import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z, { success } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { error } from "console";
import { inngest } from "@/inngest/client";

const requestSchema = z.object({
    conversationId: z.string(),
    message: z.string(),
});

export const POST = async (request: Request) => {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            {error: 'Unauthorized'},
            { status: 401 }
        );
    }

    const internalKey = process.env.APP_CONVEX_INTERNAL_KEY;

    console.log('internalKey', internalKey);

    // if (!internalKey) {
    //     return NextResponse.json(
    //         { error: 'Internal key not configured' },
    //         { status: 500 }
    //     );
    // }

    const body = await request.json();
    const { conversationId, message } = requestSchema.parse(body);

    // Invoke convex mutation, query
    const conversation = await convex.query(api.system.getConversationById, {
        // internalKey,
        conversationId: conversationId as Id<'conversations'>,
    });

    if (!conversation) {
        return NextResponse.json(
            { error: 'Conversation not found' },
            { status: 404 }
        );
    }

    const projectId = conversation.projectId;

    // Create user message
    await convex.mutation(api.system.createMessage, {
        // internalKey,
        conversationId: conversationId as Id<'conversations'>,
        projectId,
        role: 'user',
        content: message,
    });

    // Create assistant message placeholder with processing status
    const assistantMessageId = await convex.mutation(api.system.createMessage, {
        // internalKey,
        conversationId: conversationId as Id<'conversations'>,
        projectId,
        role: 'assistant',
        content: '',
        status: 'processing',
    });

    // Invoke Inngest to process the message
    const event = await inngest.send({
        name: 'message/sent',
        data: {
            messageId: assistantMessageId,
        },
    });

    return NextResponse.json({
        success: true,
        eventId: event.ids[0],
        messageId: assistantMessageId,
    });
};
import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { inngest } from "@/inngest/client";

const requestSchema = z.object({
    conversationId: z.string(),
    message: z.string(),
});

export const POST = async (request: Request) => {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const body = await request.json();
    const { conversationId, message } = requestSchema.parse(body);

    // Invoke convex mutation, query
    const conversation = await convex.query(api.system.getConversationById, {
        conversationId: conversationId as Id<'conversations'>,
    });

    if (!conversation) {
        return NextResponse.json(
            { error: 'Conversation not found' },
            { status: 404 }
        );
    }

    const projectId = conversation.projectId;

    // Check for processing messages
    const processingMessages: any = await convex.query(
        api.system.getProcessingMessages,
        {
            projectId,
        }
    );

    if (processingMessages.length > 0) {
        // Cancel all processing messages
        await Promise.all(
            processingMessages.map(async (msg: any) => {
                await inngest.send({
                    name: "message/cancel",
                    data: {
                        messageId: msg._id,
                    },
                });

                await convex.mutation(api.system.updateMessageStatus, {
                    messageId: msg._id,
                    status: "cancelled",
                });
            })
        );
    }


    // Create user message
    await convex.mutation(api.system.createMessage, {
        conversationId: conversationId as Id<'conversations'>,
        projectId,
        role: 'user',
        content: message,
    });

    // Create assistant message placeholder with processing status
    const assistantMessageId = await convex.mutation(api.system.createMessage, {
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
            conversationId,
            projectId,
            message,
        },
    });

    return NextResponse.json({
        success: true,
        eventId: event.ids[0],
        messageId: assistantMessageId,
    });
};
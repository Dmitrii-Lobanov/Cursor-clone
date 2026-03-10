import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

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

    const internalKey = process.env.CONVEX_INTERNAL_KEY;

    if (!internalKey) {
        return NextResponse.json(
            { error: 'Internal key not configured' },
            { status: 500 }
        );
    }

    const body = await request.json();
    const { conversationId, message } = requestSchema.parse(body);

    // Call convex mutation, query
    const conversation = await convex.query(api.system.getConversationById, {
        conversationId: conversationId as Id<'conversations'>,
    });
};
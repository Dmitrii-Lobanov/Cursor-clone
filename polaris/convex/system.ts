import { v } from "convex/values";
import { query } from "./_generated/server";

const validateInternalKey = (key: string) => {
    const internalKey = process.env.CONVEX_INTERNAL_KEY;

    if (!internalKey) {
        throw new Error('CONVEX_INTERNAL_KEY is not configured');
    }

    if (key !== internalKey) {
        throw new Error('Invalid internal key');
    }
};

export const getConversationById = query({
    args: {
        conversationId: v.id('conversations'),
    },

    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});
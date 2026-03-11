import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getConversationById = query({
    args: {
        conversationId: v.id('conversations'),
    },

    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});

export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      projectId: args.projectId,
      role: args.role,
      content: args.content,
      status: args.status,
    });

    // Update conversation's updatedAt
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

export const updateMessageContent = mutation({
    args: {
        messageId: v.id('messages'),
        content: v.string(),
    },

    handler: async (ctx, args) => {
        await ctx.db.patch(args.messageId, {
            content: args.content,
            status: 'completed',
        });
    }
});

export const getProcessingMessages = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_project_status", (q) =>
        q
          .eq("projectId", args.projectId)
          .eq("status", "processing")
      )
      .collect();
  },
});

export const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      status: args.status,
    });
  },
});

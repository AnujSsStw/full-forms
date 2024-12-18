import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const addMsg = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const firstMessage = await ctx.db.get(sessionId as Id<"cause">);
    if (firstMessage?.isFirstMsgId) {
      await ctx.db.patch(firstMessage.isFirstMsgId, {
        text: JSON.stringify(firstMessage.data),
      });
    } else {
      const msg = await ctx.db.insert("messages", {
        isViewer: false,
        text: JSON.stringify(firstMessage?.data),
        sessionId,
      });
      await ctx.db.patch(sessionId as Id<"cause">, {
        isFirstMsgId: msg,
      });
    }
  },
});

export const send = mutation({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { message, sessionId }) => {
    await ctx.db.insert("messages", {
      isViewer: true,
      text: message,
      sessionId,
    });
    await ctx.scheduler.runAfter(0, internal.serve.answer, {
      sessionId,
    });
  },
});

export const clear = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
  },
});

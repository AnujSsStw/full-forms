import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getAllBookings = query({
  handler: async (ctx) => {
    return await ctx.db.query("booking").collect();
  },
});

export const getBookingById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id as Id<"booking">);
  },
});

export const getAllCause = query({
  handler: async (ctx) => {
    return await ctx.db.query("cause").collect();
  },
});

export const getCauseById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id as Id<"cause">);
  },
});

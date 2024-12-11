import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getAllBookings = query({
  handler: async (ctx) => {
    return await ctx.db.query("booking").collect();
  },
});

export const getAllCause = query({
  handler: async (ctx) => {
    return await ctx.db.query("cause").collect();
  },
});

export const getDataByFetch = internalQuery({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id as Id<"cause">);
  },
});

export const getBookingPdf = query({
  handler: async (ctx) => {
    return await ctx.storage.getUrl("kg264swwfc37ca1wkd5zwccrcs7689cj");
  },
});

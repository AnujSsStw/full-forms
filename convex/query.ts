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
    return await ctx.db.query("cause").order("desc").collect();
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

export const getSignature = query({
  handler: async (ctx) => {
    return await ctx.db.query("signature").collect();
  },
});

export const getAllSignature = query({
  handler: async (ctx) => {
    return await ctx.db.query("signature").collect();
  },
});

export const getAllCaseNo = query({
  handler: async (ctx) => {
    return (await ctx.db.query("booking").collect()).map((v) => ({
      bookingFormId: v._id,
      createdAt: v._creationTime,
      caseNumber: v.data["agency_case_number"] || "Not yet set",
    }));
  },
});

import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { startOfWeek, endOfWeek } from "date-fns";
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

export const getAllarrestDeclaration = query({
  handler: async (ctx) => {
    return await ctx.db.query("arrestDeclaration").collect();
  },
});

export const getArrestDeclaration = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id as Id<"arrestDeclaration">);
  },
});

export const getReportsForTimeRange = mutation({
  args: {
    start: v.string(),
    end: v.string(),
    agency: v.string(), // can be all or a specific agency
  },
  handler: async (ctx, { start, end, agency }) => {
    const data =
      agency === "all"
        ? await ctx.db
            .query("booking")
            .filter((q) => q.gte(q.field("data.arrest_time"), start))
            .filter((q) => q.lte(q.field("data.arrest_time"), end))
            .collect()
        : await ctx.db
            .query("booking")
            .filter((q) => q.gte(q.field("data.arrest_time"), start))
            .filter((q) => q.lte(q.field("data.arrest_time"), end))
            .filter((q) => q.eq(q.field("data.arrest_agency"), agency))
            .collect();

    const dataWithSummary = data.map((booking) => {
      if (booking.causeId) {
        return ctx.db.get(booking.causeId).then((cause) => ({
          booking,
          cause: cause?.data["probable-cause"] ?? "Not yet set",
        }));
      }
      return Promise.resolve({
        booking,
        cause: "No cause",
      });
    });

    return await Promise.all(dataWithSummary);
  },
});

export const getBookingsWithUserNames = query({
  handler: async (ctx) => {
    const data = await ctx.db.query("booking").collect();
    const dataWithUserNames = await Promise.all(
      data.map((booking) => {
        if (booking.userId) {
          return ctx.db.get(booking.userId).then((user) => ({
            booking,
            user: user?.fullName,
          }));
        }
        return Promise.resolve({
          booking,
          user: "Not yet set",
        });
      })
    );
    return dataWithUserNames;
  },
});

export const getSirReportsForTimeRange = mutation({
  args: {
    frequency: v.string(),
    date: v.string(),
  },
  handler: async (ctx, { frequency, date }) => {
    let start: Date;
    let end: Date;

    switch (frequency) {
      case "weekly":
        start = startOfWeek(new Date(date), { weekStartsOn: 1 }); // Monday
        end = endOfWeek(new Date(date), { weekStartsOn: 1 }); // Sunday
        break;
      case "monthly":
        start = new Date(date);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Last day of month
        break;
      case "yearly":
        start = new Date(date);
        end = new Date(start.getFullYear(), 11, 31); // December 31st
        break;
      default:
        throw new Error(
          "Invalid frequency. Must be 'weekly', 'monthly', or 'yearly'"
        );
    }

    return await ctx.db
      .query("sir")
      .filter((q) => q.gte(q.field("date"), start.toISOString()))
      .filter((q) => q.lte(q.field("date"), end.toISOString()))
      .collect();
  },
});

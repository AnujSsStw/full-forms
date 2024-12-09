import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createBooking = mutation({
  handler: async (ctx) => {
    return await ctx.db.insert("booking", {
      data: {},
      charges: [],
    });
  },
});

export const updateBooking = mutation({
  args: {
    id: v.string(),
    data: v.any(),
    includeCharges: v.boolean(),
  },
  handler: async (ctx, { id, data }) => {
    const d = await ctx.db.get(id as Id<"booking">);
    if (!d) {
      throw new Error("Booking not found");
    }

    if (data.charges) {
      await ctx.db.patch(id as Id<"booking">, {
        charges: [...d.charges, data],
      });
      return;
    }

    await ctx.db.patch(id as Id<"booking">, {
      data: {
        ...data,
      },
    });
  },
});

export const deleteBooking = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id as Id<"booking">);
  },
});

export const createCause = mutation({
  handler: async (ctx) => {
    return await ctx.db.insert("cause", {
      data: {},
    });
  },
});

export const updateCause = mutation({
  args: {
    id: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { id, data }) => {
    return await ctx.db.patch(id as Id<"cause">, {
      data: {
        ...data,
      },
    });
  },
});

export const deleteCause = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id as Id<"cause">);
  },
});

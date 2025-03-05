import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation } from "./_generated/server";
import schema from "./schema";
import { getCurrentUser } from "./users";
import { bookingStatus } from "./schema";
export const createBooking = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("booking", {
      data: {},
      charges: [],
      userId: user._id,
      status: "pending",
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
    if (data.charges) {
      await ctx.db.patch(id as Id<"booking">, {
        charges: data.charges,
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
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.approved !== true) {
      throw new Error("User not approved");
    }
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

export const createCauseWithBooking = mutation({
  args: {
    bookingId: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { bookingId, data }) => {
    const c = await ctx.db.get(bookingId as Id<"booking">);
    if (!c) {
      throw new Error("Booking not found");
    }
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    if (c.causeId) {
      console.info("Cause already exists for booking", bookingId);
      ctx.runMutation(api.mutation.updateCause, {
        id: c.causeId,
        data,
      });
      return c.causeId;
    }
    const causeId = await ctx.db.insert("cause", {
      data: {
        ...data,
        userId: user._id,
      },
    });

    await ctx.db.patch(bookingId as Id<"booking">, {
      causeId,
    });

    return causeId;
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

export const insertEmbedding = internalMutation({
  args: schema.tables.calcrim.validator,
  handler: async (ctx, args) => {
    await ctx.db.insert("calcrim", {
      text: args.text,
      embedding: args.embedding,
    });
  },
});

export const insertSeedData = internalMutation({
  args: schema.tables.pc.validator,
  handler: async (ctx, args) => {
    await ctx.db.insert("pc", {
      code_number: args.code_number,
      codeType: args.codeType,
      narrative: args.narrative,
      m_f: args.m_f,
    });
  },
});

export const createSignature = mutation({
  args: {
    sign: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("signature", {
      base64Sign: args.sign,
      userName: args.name,
    });
  },
});

export const deleteSignature = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id as Id<"signature">);
  },
});

export const createArrestDeclaration = mutation({
  handler: async (ctx) => {
    return await ctx.db.insert("arrestDeclaration", {
      data: initialArrestFormData,
    });
  },
});

export const updateArrestDeclaration = mutation({
  args: {
    id: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { id, data }) => {
    return await ctx.db.patch(id as Id<"arrestDeclaration">, {
      data: {
        ...data,
      },
    });
  },
});

export const deleteArrestDeclaration = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id as Id<"arrestDeclaration">);
  },
});

const initialArrestFormData = {
  courtLocations: [] as string[],
  defendant: "",
  caseNumber: "",
  declarantName: "",
  title: "",
  employedBy: "",
  county: "",
  reportedCrime: "",
  declaration: "",
  sex: "",
  race: "",
  dob: "",
  eyes: "",
  hair: "",
  height: "",
  weight: "",
  cdl: "",
  address: "",
  date: "",
  bail: "",
  attachments: "",
  printName: "",
  judicialDecision: "",
  judicialDate: "",
  judicialName: "",
};

export const updateBookingStatus = mutation({
  args: {
    id: v.string(),
    status: bookingStatus,
  },
  handler: async (ctx, { id, status }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.approved !== true) {
      throw new Error("User not approved");
    }
    return await ctx.db.patch(id as Id<"booking">, {
      status,
    });
  },
});

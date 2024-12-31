import { Infer, v } from "convex/values";
import schema from "./schema";
import { action, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";

export type PC = Infer<typeof schema.tables.pc.validator>;

// Define return type for both query functions
export type PenaltyQueryResult = PC[];

export const getPenaltyByCode = internalQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<PenaltyQueryResult> => {
    const data = await ctx.db
      .query("pc")
      .withSearchIndex("search_code_number", (q) =>
        q.search("code_number", args.query)
      )
      .take(10);

    return data;
  },
});

export const getPenaltyByNarrative = internalQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<PenaltyQueryResult> => {
    const data = await ctx.db
      .query("pc")
      .withSearchIndex("search_narrative", (q) =>
        q.search("narrative", args.query)
      )
      .take(10);
    return data;
  },
});

// Explicitly type the action return value
export const getPenalty = action({
  args: {
    query: v.string(),
    queryByCode: v.boolean(),
  },
  handler: async (ctx, args): Promise<PenaltyQueryResult> => {
    if (args.queryByCode) {
      return await ctx.runQuery(internal.pc.getPenaltyByCode, {
        query: args.query,
      });
    } else {
      return await ctx.runQuery(internal.pc.getPenaltyByNarrative, {
        query: args.query,
      });
    }
  },
});

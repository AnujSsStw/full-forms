"use node";
import schema from "./schema";
import { asyncMap } from "modern-async";
import { embedTexts } from "./init";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const addEmbedding = internalAction({
  args: {
    text: schema.tables.calcrim.validator.fields.text,
  },
  handler: async (ctx, args) => {
    const embeddings = await embedTexts(args.text);
    await asyncMap(embeddings, async (embedding: number[]) => {
      await ctx.runMutation(internal.mutation.insertEmbedding, {
        text: args.text,
        embedding,
      });
    });
  },
});

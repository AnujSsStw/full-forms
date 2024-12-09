import { internalAction, internalMutation } from "./_generated/server";
import schema from "./schema";
import { PenalCode } from "./pcSeed";
import { internal } from "./_generated/api";

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

const processBatch = async (ctx: any, batch: any[]) => {
  const batchPromises = batch.map((pc) =>
    ctx.runMutation(internal.init.insertSeedData, {
      code_number: pc["CODE #"].toString(),
      codeType: pc["CODE TYPE"],
      narrative: pc.NARRATIVE,
      m_f: pc["M/F"] as "M" | "F",
    })
  );
  await Promise.all(batchPromises);
};

export default internalAction(async (ctx) => {
  // Filter valid entries first
  const validEntries = PenalCode.filter(
    (pc) => pc["M/F"] === "M" || pc["M/F"] === "F"
  );

  // Process in batches of 500
  const BATCH_SIZE = 500;
  const totalBatches = Math.ceil(validEntries.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, validEntries.length);
    const batch = validEntries.slice(start, end);

    // Process batch and add delay between batches
    await processBatch(ctx, batch);
    if (i < totalBatches - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay between batches
    }
  }

  console.info(
    `👒 Database has been successfully configured with ${validEntries.length} entries.`
  );
});

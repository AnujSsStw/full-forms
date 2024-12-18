"use node";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { PenalCode } from "./pcSeed";
import schema from "./schema";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";

const processBatch = async (ctx: any, batch: any[]) => {
  const batchPromises = batch.map((pc) =>
    ctx.runMutation(internal.mutation.insertSeedData, {
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

export const embedAll = internalAction({
  handler: async (ctx) => {
    try {
      const response = await fetch(
        "https://healthy-kangaroo-437.convex.cloud/api/storage/fabbc987-3e14-4d2a-a3af-d38f8a12b62e"
      );
      const pdfBytes = await response.arrayBuffer();
      const pdfData = await pdf(Buffer.from(pdfBytes));
      const pdfText = pdfData.text;

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 100,
      });
      const chunks = await textSplitter.splitText(pdfText);

      const batchPromises = chunks.map((chunk) =>
        ctx.runAction(internal.embed.addEmbedding, {
          text: chunk,
        })
      );
      console.info("Processing", batchPromises.length);

      // Wait for all embeddings to complete
      await Promise.all(batchPromises);
    } catch (error) {
      console.error("Error in embedAll:", error);
      throw error;
    }
  },
});

export async function embedTexts(text: string) {
  if (!text) return [];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const { data } = await openai.embeddings.create({
    input: text,
    model: "text-embedding-ada-002",
  });

  return data.map(({ embedding }) => embedding);
}

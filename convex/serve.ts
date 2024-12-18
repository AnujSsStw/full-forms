import { v } from "convex/values";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const OPENAI_MODEL = "gpt-3.5-turbo";
async function embedTexts(text: string) {
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

export const answer = internalAction({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const messages = await ctx.runQuery(internal.serve.getMessages, {
      sessionId,
    });
    const lastUserMessage = messages.at(-1)!.text;

    const [embedding] = await embedTexts(lastUserMessage);

    const searchResults = await ctx.vectorSearch("calcrim", "by_embedding", {
      vector: embedding,
      limit: 8,
    });

    const relevantDocuments = await ctx.runQuery(internal.serve.getChunks, {
      embeddingIds: searchResults.map(({ _id }) => _id),
    });

    const messageId = await ctx.runMutation(internal.serve.addBotMessage, {
      sessionId,
    });

    try {
      const openai = new OpenAI();
      const stream = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        stream: true,
        messages: [
          {
            role: "system",
            content: `
                You are an expert in criminal law and legal writing, specializing in evaluating probable cause declarations for warrantless arrests or warrants. 
    - Your task is to review probable cause declarations to ensure they meet legal standards, including adherence to statutory and constitutional requirements.
    - Identify and correct any errors, such as insufficient factual basis, missing legal elements, or lack of specificity.
    - Highlight and fix grammar, spelling, and structural issues to ensure clarity and professionalism.
    - Suggest improvements to strengthen the declaration and ensure legal compliance.
    - When requested, generate examples of properly written probable cause declarations for training or demonstration purposes.
    - Ensure all advice and recommendations are clear, actionable, and legally sound.
            `,
          },
          ...(relevantDocuments.map((v) => ({
            role: "system",
            content: "Relevant document:\n\n" + v?.text,
          })) as ChatCompletionMessageParam[]),
          ...(messages.map(({ isViewer, text }) => ({
            role: isViewer ? "user" : "assistant",
            content: text,
          })) as ChatCompletionMessageParam[]),
        ],
      });
      let text = "";
      for await (const { choices } of stream) {
        const replyDelta = choices[0].delta.content;
        if (typeof replyDelta === "string" && replyDelta.length > 0) {
          text += replyDelta;
          await ctx.runMutation(internal.serve.updateBotMessage, {
            messageId,
            text,
          });
        }
      }
    } catch (error: any) {
      await ctx.runMutation(internal.serve.updateBotMessage, {
        messageId,
        text: "I cannot reply at this time. Reach out to the team on Discord",
      });
      throw error;
    }
  },
});

export const getMessages = internalQuery(
  async (ctx, { sessionId }: { sessionId: string }) => {
    return await ctx.db
      .query("messages")
      .withIndex("bySessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
  }
);

export const getChunks = internalQuery(
  async (ctx, { embeddingIds }: { embeddingIds: Id<"calcrim">[] }) => {
    const chunks = embeddingIds.map((id) => ctx.db.get(id));

    return await Promise.all(chunks);
  }
);

export const addBotMessage = internalMutation(
  async (ctx, { sessionId }: { sessionId: string }) => {
    return await ctx.db.insert("messages", {
      isViewer: false,
      text: "",
      sessionId,
    });
  }
);

export const updateBotMessage = internalMutation(
  async (
    ctx,
    { messageId, text }: { messageId: Id<"messages">; text: string }
  ) => {
    await ctx.db.patch(messageId, { text });
  }
);

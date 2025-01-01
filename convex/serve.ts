import { v } from "convex/values";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

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

// crimne element
export const crimeElement = action({
  args: {
    pcId: v.id("pc"),
  },
  handler: async (ctx, args): Promise<Doc<"crimeElement">> => {
    const pc_element = (await ctx.runQuery(
      internal.serve.getCrimeElementByPcId,
      {
        pcId: args.pcId,
      }
    )) as Doc<"crimeElement">;

    if (!pc_element) {
      const id = await ctx.runAction(internal.serve.generateCrimeElement, {
        pcId: args.pcId,
      });

      const data = await ctx.runQuery(internal.serve.getCrimeElement, {
        id,
      });
      if (!data) throw new Error("No data");
      return data;
    }

    return pc_element;
  },
});

export const generateCrimeElement = internalAction({
  args: {
    pcId: v.id("pc"),
  },
  handler: async (ctx, args): Promise<Id<"crimeElement">> => {
    const pc = await ctx.runQuery(internal.serve.getPc, { pcId: args.pcId });
    if (!pc) throw new Error("PC not found");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const [embedding] = await embedTexts(pc.code_number + " " + pc.narrative);
    const searchResults = await ctx.vectorSearch("calcrim", "by_embedding", {
      vector: embedding,
      limit: 5,
    });
    const relevantDocuments = await ctx.runQuery(internal.serve.getChunks, {
      embeddingIds: searchResults.map(({ _id }) => _id),
    });

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,

      messages: [
        {
          role: "system",
          content: `You are a legal expert. Given a criminal code, provide:
          1. A list of elements required to prove the crime
          2. The CALCRIM jury instruction example
          
          Format your response exactly as a JSON object with two arrays:
          {
            "elements": ["element1", "element2", ...],
            "calcrim_example": ["instruction1", "instruction2", ...]
          }`,
        },
        ...(relevantDocuments.map((v) => ({
          role: "system",
          content: "Relevant document:\n\n" + v?.text,
        })) as ChatCompletionMessageParam[]),
        {
          role: "user",
          content: `Create elements and CALCRIM example for: ${pc.code_number} - ${pc.narrative}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response content");

    const result = JSON.parse(content);

    return await ctx.runMutation(internal.serve.createCrimeElement, {
      pcId: args.pcId,
      elements: result.elements,
      calcrimExample: result.calcrim_example,
    });
  },
});

export const createCrimeElement = internalMutation({
  args: {
    pcId: v.id("pc"),
    elements: v.array(v.string()),
    calcrimExample: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crimeElement", {
      pcId: args.pcId,
      element: args.elements,
      calcrim_example: args.calcrimExample,
    });
  },
});

export const getPc = internalQuery({
  args: {
    pcId: v.id("pc"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.pcId);
  },
});

export const getCrimeElementByPcId = internalQuery({
  args: {
    pcId: v.id("pc"),
  },
  handler: async (ctx, args): Promise<Doc<"crimeElement"> | null> => {
    const pc_element = await ctx.db
      .query("crimeElement")
      .withIndex("by_pcId", (q) => q.eq("pcId", args.pcId))
      .first();
    return pc_element;
  },
});

export const getCrimeElement = internalQuery({
  args: {
    id: v.id("crimeElement"),
  },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

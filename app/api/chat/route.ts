import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Process with Claude directly
    const claudeResult = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `Please review and refine the above response, making it more human-like and ensuring accuracy
            ✅ Vary Sentence Structure – AI-generated text often has a predictable rhythm. Introducing a mix of short and long sentences will improve authenticity.
✅ Use More Natural Transitions – Adding slight imperfections in phrasing (like minor stylistic variations) makes it more human-like.
✅ Introduce First-Person or Institutional References (if allowed) – Phrases like “This research will assess…” or “Our study will focus on…” increase authenticity.
✅ Include Unique Perspectives – AI tends to summarize existing ideas without injecting insightful commentary. Adding real-world law enforcement insights or officer anecdotes can help.
dont't use it looks like or it seems like. Just say it is.
            `,
        },
        ...messages,
      ],
    });

    return claudeResult.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
}

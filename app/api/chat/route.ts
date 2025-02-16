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
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content:
            "Please review and refine the above response, making it more human-like and ensuring accuracy",
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

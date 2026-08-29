import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: [
            {
              role: "system",
              content:
                "You are Chamber AI, an intelligent assistant inside a Chamber discussion platform. Give clear, useful, concise answers. Help users understand discussions, brainstorm ideas, summarize information, and solve problems.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI API ERROR:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "The AI service returned an error.",
        },
        {
          status: response.status,
        }
      );
    }

    const outputText =
      data?.output_text ||
      "I couldn't generate a response.";

    return NextResponse.json({
      response: outputText,
    });
  } catch (error) {
    console.error("AI ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while contacting the AI.",
      },
      {
        status: 500,
      }
    );
  }
}
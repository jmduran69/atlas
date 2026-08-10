import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `
You are Atlas, an executive intelligence system for company founders.

For this connectivity test, respond with exactly two sentences:

Sentence 1: Confirm that Atlas Intelligence is online.
Sentence 2: State that you are ready to analyze founder meetings, decisions, risks, and priorities.

Be concise and professional.
      `.trim(),
    });

    return NextResponse.json({
      status: "online",
      intelligence: response.output_text,
    });
  } catch (error) {
    console.error("Atlas Intelligence error:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Atlas Intelligence failed.",
      },
      { status: 500 },
    );
  }
}
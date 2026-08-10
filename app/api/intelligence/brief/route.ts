import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getMeetings } from "@/lib/services/meeting.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const meetings = await getMeetings();
    const meetingContext = JSON.stringify(meetings, null, 2);

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `
You are Atlas, an executive intelligence system for company founders.

Here is the current meeting data from Atlas:

${meetingContext}

Analyze the meeting data and produce a concise executive briefing for the founders.

Focus on what matters now, not a generic summary of the calendar.

Identify:
- the most important immediate meeting or priority,
- why it deserves attention,
- any scheduling conflicts or operational risks visible in the data,
- important patterns across the meetings,
- and the most useful action the founders should take next.

Use only information contained in the meeting data.
Do not invent facts, relationships, commitments, risks, or prior context that Atlas does not have.

Write for senior executives.
Be concise, specific, and decision-oriented.
      `.trim(),
    });

    return NextResponse.json({
      status: "online",
      meetingCount: meetings.length,
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
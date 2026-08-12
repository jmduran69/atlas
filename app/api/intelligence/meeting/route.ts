import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

import { getMeeting } from "@/lib/services/meeting.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    const meetingId = request.nextUrl.searchParams.get("id");

    if (!meetingId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Meeting ID is required.",
        },
        { status: 400 },
      );
    }

    const meeting = await getMeeting(meetingId);

    const meetingContext = JSON.stringify(
      {
        title: meeting.title,
        subtitle: meeting.subtitle,
        purpose: meeting.purpose,
        objective: meeting.objective,
        date: meeting.meeting_date,
        time: meeting.start_time,
        timezone: meeting.timezone,
        durationMinutes: meeting.duration_minutes,
        type: meeting.meeting_type,
        category: meeting.meeting_category,
        destination: meeting.destination,
        status: meeting.lifecycle_status,
      },
      null,
      2,
    );

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `
You are Atlas, an executive intelligence system for company founders.

You are analyzing one specific meeting.

Here is the meeting data from Atlas:

${meetingContext}

Prepare a concise pre-meeting intelligence brief for the founders.

Identify:

- the purpose of the meeting,
- the desired outcome,
- what deserves the founders' attention,
- any preparation gaps visible in the data,
- important questions the founders should consider,
- and the most useful next action before the meeting.

Use only information contained in the meeting data.

Do not invent facts, relationships, commitments, risks, people, company information, or prior context that Atlas does not have.

If information is missing, say so clearly rather than guessing.

Write for senior executives.
Be concise, specific, and decision-oriented.
      `.trim(),
    });

    return NextResponse.json({
      status: "online",
      meetingId,
      meeting: {
        title: meeting.title,
        date: meeting.meeting_date,
        time: meeting.start_time,
      },
      intelligence: response.output_text,
    });
  } catch (error) {
    console.error("Atlas Meeting Intelligence error:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Atlas Meeting Intelligence failed.",
      },
      { status: 500 },
    );
  }
}
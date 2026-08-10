import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getMeetings } from "@/lib/services/meeting.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const meetings = await getMeetings();
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const currentZurichTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zurich",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(now);

    const windowStart = new Date(`${today}T00:00:00`);
windowStart.setDate(windowStart.getDate() - 2);

const windowEnd = new Date(`${today}T23:59:59`);
windowEnd.setDate(windowEnd.getDate() + 7);
const relevantMeetings = meetings.filter((meeting) => {
  const meetingDate = new Date(
    `${meeting.meeting_date}T${meeting.start_time}`,
  );

  return meetingDate >= windowStart && meetingDate <= windowEnd;
});

    const meetingContext = JSON.stringify(
  relevantMeetings.map((meeting) => ({
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
  })),
  null,
  2,
);

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `
You are Atlas, an executive intelligence system for company founders.

The current date is ${today}.
Use this date as the authoritative reference for determining whether a meeting is past, today, or upcoming.

The current time in Europe/Zurich is ${currentZurichTime}.
Use this time as the authoritative reference for determining whether a meeting scheduled for today has already passed or is still upcoming.

Here is the current meeting data from Atlas:

${meetingContext}

Analyze the meeting data and produce a concise executive briefing for the founders.

Focus on what matters now, not a generic summary of the calendar.
Treat past meetings only as historical context.
Never identify a past meeting as the immediate priority unless the data explicitly shows an unresolved action that requires attention today.
Prioritize today's remaining meetings first, followed by upcoming meetings.

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
import { NextResponse } from "next/server";

import {
  createMeeting,
  getMeetings,
} from "@/lib/services/meeting.service";

type CreateMeetingRequest = {
  title?: string;
  subtitle?: string;
  purpose?: string;
  objective?: string;
  meeting_date?: string;
  start_time?: string;
  duration_minutes?: number | null;
  meeting_type?: string | null;
  meeting_category?: string | null;
  destination?: string | null;
  lifecycle_status?: string;
};

export async function GET() {
  try {
    const meetings = await getMeetings();

    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve meetings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateMeetingRequest;

    const title = body.title?.trim();
    const meetingDate = body.meeting_date?.trim();
    const startTime = body.start_time?.trim();

    if (!title || !meetingDate || !startTime) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Title, meeting date, and start time are required.",
        },
        { status: 400 },
      );
    }

    const meeting = await createMeeting({
      title,
      subtitle: body.subtitle?.trim() || undefined,
      purpose: body.purpose?.trim() || undefined,
      objective: body.objective?.trim() || undefined,
      meeting_date: meetingDate,
      start_time: startTime,
      duration_minutes: body.duration_minutes,
      meeting_type: body.meeting_type?.trim() || undefined,
      meeting_category:
        body.meeting_category?.trim() || undefined,
      destination: body.destination?.trim() || undefined,
      lifecycle_status:
        body.lifecycle_status?.trim() || undefined,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("POST /api/meetings failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create meeting",
      },
      { status: 500 },
    );
  }
}
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
import { NextResponse } from "next/server";

import {
  deleteMeeting,
  updateMeeting,
} from "@/lib/services/meeting.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateMeetingRequest = {
  title?: string;
  subtitle?: string;
  purpose?: string;
  objective?: string;
  meeting_date?: string;
  start_time?: string;
  lifecycle_status?: string;
};

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const body =
      (await request.json()) as UpdateMeetingRequest;

    const meeting = await updateMeeting(id, body);

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("PUT /api/meetings failed:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update the meeting.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    await deleteMeeting(id);

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    console.error("DELETE /api/meetings failed:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete the meeting.",
      },
      {
        status: 500,
      },
    );
  }
}
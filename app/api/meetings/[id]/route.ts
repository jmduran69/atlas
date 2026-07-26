import { NextResponse } from "next/server";

import { deleteMeeting } from "@/lib/services/meeting.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    console.error("POST /api/meetings failed:", error);
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
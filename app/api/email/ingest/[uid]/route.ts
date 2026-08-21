import { NextResponse } from "next/server";

import { ingestEmailMeeting } from "@/lib/services/email-meeting-ingestion.service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { uid: uidParam } = await context.params;
    const uid = Number(uidParam);

    if (!Number.isInteger(uid) || uid <= 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid email UID.",
        },
        { status: 400 },
      );
    }

    const result = await ingestEmailMeeting(uid);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Atlas email meeting ingestion failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to ingest email meeting.",
      },
      { status: 500 },
    );
  }
}

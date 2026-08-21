import { NextResponse } from "next/server";

import { getEmailByUid } from "@/lib/email/infomaniak";
import { extractMeetingCandidate } from "@/lib/email/meeting-candidate";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

export async function GET(
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

    const email = await getEmailByUid(uid);

    if (!email) {
      return NextResponse.json(
        {
          ok: false,
          message: "Email not found.",
        },
        { status: 404 },
      );
    }

    const candidate = await extractMeetingCandidate(email);

    if (!candidate) {
      return NextResponse.json({
        ok: true,
        candidate: null,
        message: "Email does not appear to contain a supported meeting invitation.",
      });
    }

    return NextResponse.json({
      ok: true,
      candidate,
    });
  } catch (error) {
    console.error("Atlas meeting candidate extraction failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to extract meeting candidate.",
      },
      { status: 500 },
    );
  }
}
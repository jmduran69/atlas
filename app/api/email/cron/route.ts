import { NextRequest, NextResponse } from "next/server";

import { processRecentInbox } from "@/lib/services/email-inbox-processor.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const report = await processRecentInbox(20);

    return NextResponse.json({
      ok: true,
      ...report,
    });
  } catch (error) {
    console.error("Automatic email processing failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Automatic email processing failed.",
      },
      {
        status: 500,
      },
    );
  }
}

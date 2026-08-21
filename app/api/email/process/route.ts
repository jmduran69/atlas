import { NextResponse } from "next/server";

import { processRecentInbox } from "@/lib/services/email-inbox-processor.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const requestedLimit = Number(
      searchParams.get("limit") ?? "20",
    );

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0 &&
      requestedLimit <= 100
        ? requestedLimit
        : 20;

    const report = await processRecentInbox(limit);

    return NextResponse.json({
      ok: true,
      ...report,
    });
  } catch (error) {
    console.error("Atlas inbox processing failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process inbox.",
      },
      { status: 500 },
    );
  }
}

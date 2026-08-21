import { NextResponse } from "next/server";

import { getRecentEmails } from "@/lib/email/infomaniak";

export const runtime = "nodejs";

export async function GET() {
  try {
    const emails = await getRecentEmails(20);

    return NextResponse.json({
      ok: true,
      count: emails.length,
      emails,
    });
  } catch (error) {
    console.error("Atlas recent email retrieval failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve recent emails.",
      },
      { status: 500 },
    );
  }
}
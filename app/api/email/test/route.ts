import { NextResponse } from "next/server";

import { testEmailConnection } from "@/lib/email/infomaniak";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = await testEmailConnection();

    return NextResponse.json({
      ok: true,
      connected: status.connected,
      mailbox: status.mailbox,
      messageCount: status.messageCount,
    });
  } catch (error) {
    console.error("Atlas email connection test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to connect to the email mailbox.",
      },
      { status: 500 },
    );
  }
}
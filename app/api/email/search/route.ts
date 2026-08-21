import { NextResponse } from "next/server";

import { searchEmailsBySubject } from "@/lib/email/infomaniak";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject")?.trim();

    if (!subject) {
      return NextResponse.json(
        {
          ok: false,
          message: "A subject search term is required.",
        },
        { status: 400 },
      );
    }

    const emails = await searchEmailsBySubject(subject);

    return NextResponse.json({
      ok: true,
      count: emails.length,
      emails,
    });
  } catch (error) {
    console.error("Atlas email search failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to search email.",
      },
      { status: 500 },
    );
  }
}
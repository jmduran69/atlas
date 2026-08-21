import { NextResponse } from "next/server";

import { getEmailByUid } from "@/lib/email/infomaniak";

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

    return NextResponse.json({
      ok: true,
      email,
    });
  } catch (error) {
    console.error("Atlas email retrieval failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve email.",
      },
      { status: 500 },
    );
  }
}
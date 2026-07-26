import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      message: "Atlas is connected to Supabase",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message:
          error instanceof Error ? error.message : "Unknown connection error",
      },
      { status: 500 }
    );
  }
}
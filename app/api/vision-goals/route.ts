import { NextResponse } from "next/server";
import { insertVisionGoal } from "@/lib/db";
import type { VisionGoal } from "@/types/vision";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const goal = (await request.json()) as VisionGoal;
    insertVisionGoal(goal);
    return NextResponse.json(goal);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

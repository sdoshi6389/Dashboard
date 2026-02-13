import { NextResponse } from "next/server";
import { insertVisionTile } from "@/lib/db";
import type { VisionTile } from "@/types/vision";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const tile = (await request.json()) as VisionTile;
    insertVisionTile(tile);
    return NextResponse.json(tile);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create tile" }, { status: 500 });
  }
}

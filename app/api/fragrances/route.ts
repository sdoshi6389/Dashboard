import { NextResponse } from "next/server";
import { insertFragrance } from "@/lib/db";
import type { Fragrance } from "@/types/fragrances";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const fragrance = (await request.json()) as Fragrance;
    insertFragrance(fragrance);
    return NextResponse.json(fragrance);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create fragrance" }, { status: 500 });
  }
}

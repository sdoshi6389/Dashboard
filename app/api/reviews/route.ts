import { NextResponse } from "next/server";
import { insertReview } from "@/lib/db";
import type { Review } from "@/types/reading";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const review = (await request.json()) as Review;
    insertReview(review);
    return NextResponse.json(review);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

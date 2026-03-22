import { NextResponse } from "next/server";
import type { Meal } from "@/types/meals";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const meal = (await request.json()) as Meal;
    return NextResponse.json(meal);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create meal" }, { status: 500 });
  }
}
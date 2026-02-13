import { NextResponse } from "next/server";
import { insertBook } from "@/lib/db";
import type { Book } from "@/types/reading";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const book = (await request.json()) as Book;
    insertBook(book);
    return NextResponse.json(book);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

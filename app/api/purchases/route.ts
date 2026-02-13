import { NextResponse } from "next/server";
import { insertPurchase } from "@/lib/db";
import type { PurchaseItem } from "@/types/purchases";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const item = (await request.json()) as PurchaseItem;
    insertPurchase(item);
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}

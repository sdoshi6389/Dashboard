import { NextResponse } from "next/server";
import { insertPackage } from "@/lib/db";
import type { Package } from "@/types/packages";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const pkg = (await request.json()) as Package;
    insertPackage(pkg);
    return NextResponse.json(pkg);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

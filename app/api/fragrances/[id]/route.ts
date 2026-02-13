import { NextResponse } from "next/server";
import { updateFragrance, deleteFragrance } from "@/lib/db";
import type { Fragrance } from "@/types/fragrances";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patch = (await request.json()) as Partial<Fragrance>;
    updateFragrance(id, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update fragrance" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deleteFragrance(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete fragrance" }, { status: 500 });
  }
}

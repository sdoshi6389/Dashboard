import { NextResponse } from "next/server";
import { updateVisionGoal, deleteVisionGoal } from "@/lib/db";
import type { VisionGoal } from "@/types/vision";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patch = (await request.json()) as Partial<VisionGoal>;
    updateVisionGoal(id, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deleteVisionGoal(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}

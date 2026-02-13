import { NextResponse } from "next/server";
import { loadFullState, clearAllData, resetToSeed } from "@/lib/db";
import type { FullState } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = loadFullState();
    return NextResponse.json(state);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as string;
    if (action === "reset") {
      resetToSeed();
      return NextResponse.json(loadFullState());
    }
    if (action === "clear") {
      clearAllData();
      return NextResponse.json(loadFullState());
    }
    if (action === "import" && body.state) {
      const state = body.state as FullState;
      const { importState } = await import("@/lib/db-import");
      importState(state);
      return NextResponse.json(loadFullState());
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
  }
}

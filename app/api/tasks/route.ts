import { NextResponse } from "next/server";
import { insertTask } from "@/lib/db";
import type { Task } from "@/types/todo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const task = (await request.json()) as Task;
    insertTask(task);
    return NextResponse.json(task);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

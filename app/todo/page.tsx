import { Suspense } from "react";
import TodoClient from "./TodoClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <TodoClient />
    </Suspense>
  );
}

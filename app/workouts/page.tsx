import { Suspense } from "react";
import WorkoutsClient from "./WorkoutsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <WorkoutsClient />
    </Suspense>
  );
}
import { Suspense } from "react";
import TravelsClient from "./travels_client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <TravelsClient />
    </Suspense>
  );
}
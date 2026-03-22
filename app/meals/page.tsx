import { Suspense } from "react";
import MealsClient from "./MealsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <MealsClient />
    </Suspense>
  );
}
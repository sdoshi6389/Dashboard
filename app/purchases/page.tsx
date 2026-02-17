import { Suspense } from "react";
import PurchasesClient from "./PurchasesClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <PurchasesClient />
    </Suspense>
  );
}

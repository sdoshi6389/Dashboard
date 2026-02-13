"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { Plus, ExternalLink, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";
import { isThisMonth } from "@/lib/date";
import { formatDisplay } from "@/lib/date";
import type { PurchaseItem } from "@/types/purchases";
import { PurchaseDrawer } from "@/components/forms/PurchaseDrawer";

export default function PurchasesPage() {
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const purchaseItems = useStore((s) => s.purchaseItems);
  const updatePurchase = useStore((s) => s.updatePurchase);
  const deletePurchase = useStore((s) => s.deletePurchase);
  const markPurchased = useStore((s) => s.markPurchased);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const monthly = purchaseItems.filter((p) => p.recurrence === "monthly");
  const wishlist = purchaseItems.filter((p) => p.recurrence === "none");
  const dueThisMonth = monthly.filter((p) => p.nextPurchaseAt && isThisMonth(p.nextPurchaseAt));
  const monthlyTotal = monthly.reduce((sum, p) => sum + (p.estPrice ?? 0), 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Purchases"
        description="Monthly recurring and wishlist"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add item
          </Button>
        }
      />

      <section>
        <h2 className="text-lg font-semibold mb-2">Monthly</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Estimated monthly spend: ${monthlyTotal}
        </p>
        {monthly.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No monthly items"
            description="Add items you buy regularly."
            action={<Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">Add item</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {monthly.map((p) => (
              <PurchaseCard
                key={p.id}
                item={p}
                onEdit={() => { setEditId(p.id); setAddOpen(true); }}
                onDelete={() => deletePurchase(p.id)}
                onMarkPurchased={() => markPurchased(p.id)}
                showNext
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Wishlist</h2>
        {wishlist.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No wishlist items"
            description="Add one-off purchases you're considering."
            action={<Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">Add item</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((p) => (
              <PurchaseCard
                key={p.id}
                item={p}
                onEdit={() => { setEditId(p.id); setAddOpen(true); }}
                onDelete={() => deletePurchase(p.id)}
                onMarkPurchased={() => markPurchased(p.id)}
                showNext={false}
              />
            ))}
          </div>
        )}
      </section>

      <PurchaseDrawer
        open={addOpen || !!editId}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
          setAddOpen(open);
        }}
        item={editId ? purchaseItems.find((p) => p.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updatePurchase(editId, data);
            setEditId(null);
          } else {
            useStore.getState().addPurchase(data);
          }
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function PurchaseCard({
  item,
  onEdit,
  onDelete,
  onMarkPurchased,
  showNext,
}: {
  item: PurchaseItem;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPurchased: () => void;
  showNext: boolean;
}) {
  return (
    <Card className="aurora-card">
      <CardContent className="p-4 flex gap-4">
        <Thumbnail imageDataUrl={item.imageDataUrl} imageUrl={item.imageUrl} alt={item.name} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.category}</p>
          {item.estPrice != null && <p className="text-sm">${item.estPrice}</p>}
          {showNext && item.nextPurchaseAt && (
            <p className="text-xs text-muted-foreground">Next: {formatDisplay(item.nextPurchaseAt)}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {item.link && (
              <Button size="sm" variant="ghost" asChild className="rounded-lg">
                <Link href={item.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> Link
                </Link>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onEdit} className="aurora-btn-secondary rounded-lg">Edit</Button>
            {item.recurrence === "monthly" && (
              <Button size="sm" onClick={onMarkPurchased} className="aurora-btn rounded-lg">Mark purchased</Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive rounded-lg">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

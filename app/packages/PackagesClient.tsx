"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { Plus, Package, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDisplay } from "@/lib/date";
import type { Package as Pkg } from "@/types/packages";
import { PackageDrawer } from "@/components/forms/PackageDrawer";

export default function PackagesPage() {
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const packages = useStore((s) => s.packages);
  const updatePackage = useStore((s) => s.updatePackage);
  const deletePackage = useStore((s) => s.deletePackage);
  const markDelivered = useStore((s) => s.markDelivered);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const sorted = [...packages].sort((a, b) => {
    const da = a.expectedDeliveryDate ? new Date(a.expectedDeliveryDate).getTime() : 0;
    const db = b.expectedDeliveryDate ? new Date(b.expectedDeliveryDate).getTime() : 0;
    return da - db;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Packages"
        description="Track incoming deliveries"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add package
          </Button>
        }
      />
      {sorted.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No packages"
          description="Add a package to track delivery."
          action={<Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">Add package</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <Card key={p.id} className="aurora-card">
              <CardContent className="p-4 flex gap-4">
                <Thumbnail imageDataUrl={p.imageDataUrl} imageUrl={p.imageUrl} alt={p.itemName} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.itemName}</p>
                  {p.carrier && <p className="text-sm text-muted-foreground">{p.carrier}</p>}
                  {p.expectedDeliveryDate && (
                    <p className="text-xs text-muted-foreground">Expected: {formatDisplay(p.expectedDeliveryDate)}</p>
                  )}
                  <Badge variant="outline" className="mt-2">{p.status}</Badge>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.link && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={p.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> Open order
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setEditId(p.id); setAddOpen(true); }} className="aurora-btn-secondary rounded-lg">Edit</Button>
                    {p.status !== "delivered" && (
                      <Button size="sm" onClick={() => markDelivered(p.id)} className="aurora-btn rounded-lg">Mark delivered</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deletePackage(p.id)} className="text-destructive">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PackageDrawer
        open={addOpen || !!editId}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
          setAddOpen(open);
        }}
        item={editId ? packages.find((p) => p.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updatePackage(editId, data);
            setEditId(null);
          } else {
            useStore.getState().addPackage(data);
          }
          setAddOpen(false);
        }}
      />
    </div>
  );
}

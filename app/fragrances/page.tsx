"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { Plus, Sparkles, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Fragrance, FragranceSeason } from "@/types/fragrances";
import { FragranceDrawer } from "@/components/forms/FragranceDrawer";

const SEASONS: FragranceSeason[] = ["spring", "summer", "fall", "winter", "all"];

export default function FragrancesPage() {
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [vibeFilter, setVibeFilter] = useState("");
  const [sampledFilter, setSampledFilter] = useState<"all" | "sampled" | "unsampled">("all");

  const fragrances = useStore((s) => s.fragrances);
  const updateFragrance = useStore((s) => s.updateFragrance);
  const deleteFragrance = useStore((s) => s.deleteFragrance);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const filtered = fragrances
    .filter((f) => seasonFilter === "all" || f.season === seasonFilter)
    .filter((f) => !vibeFilter || f.vibeTags.some((t) => t.toLowerCase().includes(vibeFilter.toLowerCase())))
    .filter((f) => {
      if (sampledFilter === "sampled") return f.sampled;
      if (sampledFilter === "unsampled") return !f.sampled;
      return true;
    });

  const toSample = fragrances.filter((f) => !f.sampled);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Fragrances"
        description="Track samples and favorites"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add fragrance
          </Button>
        }
      />

      {toSample.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">To sample next</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toSample.slice(0, 6).map((f) => (
              <FragranceCard
                key={f.id}
                fragrance={f}
                onOpenDetail={() => setDetailId(f.id)}
                onEdit={() => { setEditId(f.id); setAddOpen(true); }}
                onDelete={() => deleteFragrance(f.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Filter by vibe..."
            value={vibeFilter}
            onChange={(e) => setVibeFilter(e.target.value)}
            className="max-w-[200px] aurora-input rounded-xl h-10"
          />
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm aurora-input"
          >
            <option value="all">All seasons</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={sampledFilter}
            onChange={(e) => setSampledFilter(e.target.value as typeof sampledFilter)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm aurora-input"
          >
            <option value="all">All</option>
            <option value="sampled">Sampled</option>
            <option value="unsampled">To sample</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No fragrances"
            description="Add a fragrance to track."
            action={<Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">Add fragrance</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => (
              <FragranceCard
                key={f.id}
                fragrance={f}
                onOpenDetail={() => setDetailId(f.id)}
                onEdit={() => { setEditId(f.id); setAddOpen(true); }}
                onDelete={() => deleteFragrance(f.id)}
              />
            ))}
          </div>
        )}
      </section>

      <FragranceDrawer
        open={addOpen}
        onOpenChange={(open) => { setAddOpen(open); if (!open) setEditId(null); }}
        fragrance={editId ? fragrances.find((f) => f.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updateFragrance(editId, data);
            setEditId(null);
          } else {
            useStore.getState().addFragrance(data);
          }
          setAddOpen(false);
        }}
      />
      {detailId && (
        <FragranceDrawer
          mode="detail"
          open={!!detailId}
          onOpenChange={(open) => { if (!open) setDetailId(null); }}
          fragrance={fragrances.find((f) => f.id === detailId) ?? null}
          onSave={() => {}}
          onEditClick={() => {
            setEditId(detailId);
            setDetailId(null);
            setAddOpen(true);
          }}
        />
      )}
    </div>
  );
}

function FragranceCard({
  fragrance,
  onOpenDetail,
  onEdit,
  onDelete,
}: {
  fragrance: Fragrance;
  onOpenDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="aurora-card cursor-pointer transition-all duration-200 hover:border-aurora-teal/30" onClick={onOpenDetail}>
      <CardContent className="p-4 flex gap-4">
        <Thumbnail imageDataUrl={fragrance.imageDataUrl} imageUrl={fragrance.imageUrl} alt={fragrance.name} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{fragrance.name}</p>
          <p className="text-sm text-muted-foreground">{fragrance.brand}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className="text-xs">{fragrance.season}</Badge>
            {fragrance.sampled && <Badge variant="secondary">Sampled</Badge>}
            {fragrance.wouldBuy && <Badge className="text-xs">Would buy</Badge>}
          </div>
          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

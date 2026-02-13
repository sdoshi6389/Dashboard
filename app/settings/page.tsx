"use client";

import { useRef } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import type { FullState } from "@/types/state";
import { Download, Upload, RotateCcw, Trash2 } from "lucide-react";

function parseExportFile(text: string): FullState | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (parsed && Array.isArray(parsed.tasks)) {
      return {
        tasks: parsed.tasks as FullState["tasks"],
        visionTiles: (parsed.visionTiles ?? []) as FullState["visionTiles"],
        visionGoals: (parsed.visionGoals ?? []) as FullState["visionGoals"],
        books: (parsed.books ?? []) as FullState["books"],
        reviews: (parsed.reviews ?? []) as FullState["reviews"],
        purchaseItems: (parsed.purchaseItems ?? []) as FullState["purchaseItems"],
        fragrances: (parsed.fragrances ?? []) as FullState["fragrances"],
        packages: (parsed.packages ?? []) as FullState["packages"],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const resetToDemo = useStore((s) => s.resetToDemo);
  const importState = useStore((s) => s.importState);
  const clearAll = useStore((s) => s.clearAll);

  const handleExport = () => {
    const s = useStore.getState();
    const state = {
      version: 1,
      tasks: s.tasks,
      visionTiles: s.visionTiles,
      visionGoals: s.visionGoals,
      books: s.books,
      reviews: s.reviews,
      purchaseItems: s.purchaseItems,
      fragrances: s.fragrances,
      packages: s.packages,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doshi-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const state = parseExportFile(text);
      if (state) {
        importState(state);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetDemo = () => {
    if (typeof window !== "undefined" && window.confirm("Replace all data with demo data?")) {
      resetToDemo();
    }
  };

  const handleClearAll = () => {
    if (typeof window !== "undefined" && window.confirm("Permanently delete all data? This cannot be undone.")) {
      clearAll();
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Settings" description="Data and preferences" />
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>
            Data is stored in a local SQLite database (data/dashboard.sqlite). Export to back up or move to another device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-2 aurora-btn-secondary rounded-xl">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2 aurora-btn-secondary rounded-xl">
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
            <Button variant="outline" onClick={handleResetDemo} className="gap-2 aurora-btn-secondary rounded-xl">
              <RotateCcw className="h-4 w-4" />
              Reset to demo data
            </Button>
            <Button variant="destructive" onClick={handleClearAll} className="gap-2 rounded-xl">
              <Trash2 className="h-4 w-4" />
              Clear all data
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Doshi&apos;s Dashboard — personal dashboard. Desktop-first, local-first. No authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p><strong>Where data is stored:</strong> Local SQLite database at <code className="text-xs">data/dashboard.sqlite</code> in the project folder. Data persists when you stop and restart the app.</p>
          <p className="mt-2"><strong>Export/Import:</strong> Export downloads a JSON backup. Import reads a previously exported file and replaces the database content.</p>
        </CardContent>
      </Card>
    </div>
  );
}

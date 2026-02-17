"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Image as ImageIcon, Target, Pencil, Trophy, Pause } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDisplay } from "@/lib/date";
import type { VisionTile, VisionGoal, VisionCategory } from "@/types/vision";
import { VisionTileDrawer } from "@/components/forms/VisionTileDrawer";
import { VisionGoalDrawer } from "@/components/forms/VisionGoalDrawer";

const CATEGORIES: VisionCategory[] = ["Fitness", "Career", "Relationships", "Money", "Creativity", "Other"];

export default function VisionPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"board" | "goals">("board");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [boardDrawerOpen, setBoardDrawerOpen] = useState(false);
  const [goalDrawerOpen, setGoalDrawerOpen] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);

  const visionTiles = useStore((s) => s.visionTiles);
  const visionGoals = useStore((s) => s.visionGoals);
  const addTile = useStore((s) => s.addTile);
  const updateTile = useStore((s) => s.updateTile);
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "goals") setTab("goals");
    if (searchParams.get("add") === "1") {
      if (searchParams.get("tab") === "goals") setGoalDrawerOpen(true);
      else setBoardDrawerOpen(true);
    }
  }, [searchParams]);

  const boardImage = visionTiles[0];
  const filteredGoals = categoryFilter === "all"
    ? visionGoals
    : visionGoals.filter((g) => g.category === categoryFilter);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vision"
        description={tab === "board" ? "One vision board image" : "Text goals"}
        action={
          tab === "board" ? (
            <Button
              onClick={() => setBoardDrawerOpen(true)}
              className="aurora-btn"
            >
              {boardImage ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Change board image
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Set vision board image
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => { setEditGoalId(null); setGoalDrawerOpen(true); }} className="aurora-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add goal
            </Button>
          )
        }
      />

      {tab === "goals" && (
        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] aurora-input">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as "board" | "goals")}>
        <TabsList className="aurora-tabs">
          <TabsTrigger value="board" className="gap-2">
            <ImageIcon className="h-4 w-4" /> Board
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" /> Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-0">
          <div className="relative -mx-6 -mb-6 rounded-xl overflow-hidden aurora-board-container" style={{ minHeight: "calc(100vh - 12rem)" }}>
            {!boardImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
                <EmptyState
                  icon={ImageIcon}
                  title="No vision board image"
                  description="Set one image as your full-page vision board — a collage, mood board, or single inspiration image."
                  action={
                    <Button onClick={() => setBoardDrawerOpen(true)} className="aurora-btn">
                      Set vision board image
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                <div className="absolute inset-0">
                  {boardImage.imageDataUrl || boardImage.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={boardImage.imageDataUrl ?? boardImage.imageUrl}
                      alt="Vision board"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      No image set
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setBoardDrawerOpen(true)}
                    className="shadow-lg backdrop-blur-sm bg-background/80 border border-white/10 aurora-btn-secondary"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Change image
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          {filteredGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals"
              description="Add a text goal with target date and progress."
              action={<Button onClick={() => setGoalDrawerOpen(true)} className="aurora-btn">Add goal</Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((g) => (
                <Card key={g.id} className="aurora-card">
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{g.category}</p>
                      {g.why && <p className="text-sm text-muted-foreground mt-1">{g.why}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => { setEditGoalId(g.id); setGoalDrawerOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteGoal(g.id)}>
                        <span className="text-destructive text-sm">×</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {g.targetDate && (
                      <p className="text-xs text-muted-foreground">Target: {formatDisplay(g.targetDate)}</p>
                    )}
                    {g.progress != null && (
                      <Progress value={g.progress} className="h-2 progress-aurora rounded-full" />
                    )}
                    <div className="flex gap-2 pt-2">
                      {g.status === "active" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateGoal(g.id, { status: "achieved" })} className="aurora-btn-secondary">
                            <Trophy className="h-3 w-3 mr-1" /> Achieved
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateGoal(g.id, { status: "paused" })}>
                            <Pause className="h-3 w-3 mr-1" /> Pause
                          </Button>
                        </>
                      )}
                      {g.status === "paused" && (
                        <Button size="sm" variant="outline" onClick={() => updateGoal(g.id, { status: "active" })} className="aurora-btn-secondary">
                          Resume
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <VisionTileDrawer
        open={boardDrawerOpen}
        onOpenChange={(open) => setBoardDrawerOpen(open)}
        tile={boardImage ?? null}
        onSave={(data) => {
          if (boardImage) {
            updateTile(boardImage.id, data);
          } else {
            addTile(data);
          }
          setBoardDrawerOpen(false);
        }}
        isBoardOnly
      />
      <VisionGoalDrawer
        open={goalDrawerOpen}
        onOpenChange={(open) => {
          if (!open) setEditGoalId(null);
          setGoalDrawerOpen(open);
        }}
        goal={editGoalId ? visionGoals.find((g) => g.id === editGoalId) ?? null : null}
        onSave={(data) => {
          if (editGoalId) {
            updateGoal(editGoalId, data);
            setEditGoalId(null);
          } else {
            addGoal(data);
          }
          setGoalDrawerOpen(false);
        }}
      />
    </div>
  );
}

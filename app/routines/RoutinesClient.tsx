"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Clock3 } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { RoutineDrawer } from "@/components/forms/RoutineDrawer";
import { useStore } from "@/lib/store";
import type { Routine, RoutineTask } from "@/types/routines";

type RoutineView = "all" | "hourly" | "named";

const dayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export default function RoutinesClient() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<RoutineView>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const routines = useStore((s) => s.routines);
  const updateRoutine = useStore((s) => s.updateRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const base = [...routines].filter((routine) => {
      if (view === "hourly") return routine.routineType === "hourly";
      if (view === "named") return routine.routineType !== "hourly";
      return true;
    });

    return base.sort((a, b) => {
      const aDay = a.day ? dayOrder.indexOf(a.day) : 999;
      const bDay = b.day ? dayOrder.indexOf(b.day) : 999;
      if (aDay !== bDay) return aDay - bDay;

      const aTime = a.startTime ?? "99:99";
      const bTime = b.startTime ?? "99:99";
      if (aTime !== bTime) return aTime.localeCompare(bTime);

      return a.title.localeCompare(b.title);
    });
  }, [routines, view]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Routines"
        description="Plan hourly schedules and reusable routines like morning or night"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add routine
          </Button>
        }
      />

      <Tabs value={view} onValueChange={(v) => setView(v as RoutineView)}>
        <TabsList className="aurora-tabs">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="named">Named routines</TabsTrigger>
        </TabsList>

        <TabsContent value={view} className="mt-6">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Clock3}
              title="No routines yet"
              description="Create your first routine or hourly schedule."
              action={
                <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
                  Add routine
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {filtered.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onEdit={() => {
                    setEditId(routine.id);
                    setAddOpen(true);
                  }}
                  onDelete={() => deleteRoutine(routine.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <RoutineDrawer
        open={addOpen || !!editId}
        onOpenChange={(open) => {
          if (!open) {
            setEditId(null);
            setAddOpen(false);
          }
        }}
        item={editId ? routines.find((r) => r.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updateRoutine(editId, data);
            setEditId(null);
          } else {
            useStore.getState().addRoutine(data);
          }
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function RoutineCard({
  routine,
  onEdit,
  onDelete,
}: {
  routine: Routine;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="aurora-card">
      <CardContent className="p-5 space-y-5">
        <div className="flex gap-4">
          <Thumbnail
            imageDataUrl={routine.imageDataUrl}
            imageUrl={routine.imageUrl}
            alt={routine.title}
            size="lg"
          />

          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate">{routine.title}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {routine.routineType}
              </Badge>

              {routine.day && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {routine.day}
                </Badge>
              )}

              {routine.startTime && (
                <Badge variant="outline" className="text-xs">
                  {routine.endTime ? `${routine.startTime} - ${routine.endTime}` : routine.startTime}
                </Badge>
              )}
            </div>

            {routine.notes && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {routine.notes}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Tasks</p>

          {routine.tasks.length === 0 ? (
            <Card className="aurora-card">
              <CardContent className="py-3 px-4 text-sm text-muted-foreground">
                No routine tasks added yet.
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-2">
              {routine.tasks.map((task) => (
                <RoutineTaskRow key={task.id} task={task} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="aurora-btn-secondary rounded-lg"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RoutineTaskRow({ task }: { task: RoutineTask }) {
  return (
    <Card className="aurora-card">
      <CardContent className="py-3 px-4 flex items-center gap-3">
        <div className="shrink-0 rounded-full border-2 border-primary w-6 h-6 flex items-center justify-center" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{task.title}</p>
          {task.time && <p className="text-xs text-muted-foreground mt-1">{task.time}</p>}
          {task.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
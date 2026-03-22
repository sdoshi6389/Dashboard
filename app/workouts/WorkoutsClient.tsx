"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Dumbbell, Plus, Pencil, Trash2 } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { WorkoutDrawer } from "@/components/forms/WorkoutDrawer";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { WorkoutExercise, WorkoutPlan } from "@/types/workouts";

const dayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export default function WorkoutsClient() {
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const workouts = useStore((s) => s.workouts);
  const updateWorkout = useStore((s) => s.updateWorkout);
  const deleteWorkout = useStore((s) => s.deleteWorkout);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const sorted = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const aDay = a.day ? dayOrder.indexOf(a.day) : 999;
      const bDay = b.day ? dayOrder.indexOf(b.day) : 999;

      if (aDay !== bDay) return aDay - bDay;
      return a.title.localeCompare(b.title);
    });
  }, [workouts]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Workouts"
        description="Organize workout days, muscle groups, and exercise plans"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add workout
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          description="Create your first workout plan."
          action={
            <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
              Add workout
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {sorted.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onEdit={() => {
                setEditId(workout.id);
                setAddOpen(true);
              }}
              onDelete={() => deleteWorkout(workout.id)}
            />
          ))}
        </div>
      )}

      <WorkoutDrawer
        open={addOpen || !!editId}
        onOpenChange={(open) => {
          if (!open) {
            setEditId(null);
            setAddOpen(false);
          }
        }}
        item={editId ? workouts.find((w) => w.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updateWorkout(editId, data);
            setEditId(null);
          } else {
            useStore.getState().addWorkout(data);
          }
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function WorkoutCard({
  workout,
  onEdit,
  onDelete,
}: {
  workout: WorkoutPlan;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="aurora-card">
      <CardContent className="p-5 space-y-5">
        <div className="flex gap-4">
          <Thumbnail
            imageDataUrl={workout.imageDataUrl}
            imageUrl={workout.imageUrl}
            alt={workout.title}
            size="lg"
          />

          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate">{workout.title}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {workout.workoutType}
              </Badge>

              {workout.day && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {workout.day}
                </Badge>
              )}

              {workout.difficulty && (
                <Badge variant="outline" className="text-xs capitalize">
                  {workout.difficulty}
                </Badge>
              )}

              {typeof workout.durationMinutes === "number" && (
                <Badge variant="outline" className="text-xs">
                  {workout.durationMinutes} min
                </Badge>
              )}
            </div>

            {workout.targetMuscles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                Works: {workout.targetMuscles.join(", ")}
              </p>
            )}

            {workout.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {workout.notes}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Exercises</p>

          {workout.exercises.length === 0 ? (
            <EmptyExerciseState />
          ) : (
            <ul className="space-y-2">
              {workout.exercises.map((exercise) => (
                <ExerciseRow key={exercise.id} exercise={exercise} />
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

function ExerciseRow({ exercise }: { exercise: WorkoutExercise }) {
  return (
    <Card className="aurora-card">
      <CardContent className="py-3 px-4 flex items-center gap-3">
        <div className="shrink-0 rounded-full border-2 border-primary w-6 h-6 flex items-center justify-center" />

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium")}>{exercise.name}</p>
          {exercise.reps && (
            <p className="text-xs text-muted-foreground mt-1">{exercise.reps}</p>
          )}
          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {exercise.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyExerciseState() {
  return (
    <Card className="aurora-card">
      <CardContent className="py-3 px-4 text-sm text-muted-foreground">
        No exercises added yet.
      </CardContent>
    </Card>
  );
}
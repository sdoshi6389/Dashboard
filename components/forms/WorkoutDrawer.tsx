"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "@/components/shared/ImagePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { uid } from "@/lib/utils";
import type {
  WorkoutPlan,
  WorkoutType,
  WorkoutDifficulty,
  WorkoutDay,
  WorkoutExercise,
} from "@/types/workouts";

interface WorkoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WorkoutPlan | null;
  onSave: (data: Omit<WorkoutPlan, "id">) => void;
}

export function WorkoutDrawer({ open, onOpenChange, item, onSave }: WorkoutDrawerProps) {
  const [title, setTitle] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("custom");
  const [day, setDay] = useState<WorkoutDay | "none">("none");
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty | "none">("none");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [targetMuscles, setTargetMuscles] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseReps, setExerciseReps] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setWorkoutType(item.workoutType);
      setDay(item.day ?? "none");
      setDifficulty(item.difficulty ?? "none");
      setDurationMinutes(item.durationMinutes?.toString() ?? "");
      setTargetMuscles(item.targetMuscles.join(", "));
      setNotes(item.notes ?? "");
      setImageDataUrl(item.imageDataUrl);
      setImageUrl(item.imageUrl);
      setExercises(item.exercises ?? []);
    } else {
      setTitle("");
      setWorkoutType("custom");
      setDay("none");
      setDifficulty("none");
      setDurationMinutes("");
      setTargetMuscles("");
      setNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
      setExercises([]);
    }

    setExerciseName("");
    setExerciseReps("");
    setExerciseNotes("");
  }, [item, open]);

  const addExercise = () => {
    const trimmed = exerciseName.trim();
    if (!trimmed) return;

    setExercises((prev) => [
      ...prev,
      {
        id: uid(),
        name: trimmed,
        reps: exerciseReps.trim() || undefined,
        notes: exerciseNotes.trim() || undefined,
      },
    ]);

    setExerciseName("");
    setExerciseReps("");
    setExerciseNotes("");
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onSave({
      title: trimmed,
      workoutType,
      day: day === "none" ? undefined : day,
      difficulty: difficulty === "none" ? undefined : difficulty,
      durationMinutes: durationMinutes.trim() ? Number(durationMinutes) : undefined,
      targetMuscles: targetMuscles
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
      imageDataUrl,
      imageUrl,
      exercises,
    });

    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item ? "Edit workout" : "Add workout"}</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
          />

          <div>
            <Label>Workout title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Monday Abs, Push Day A, Pull Day..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Workout type</Label>
              <Select value={workoutType} onValueChange={(v) => setWorkoutType(v as WorkoutType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abs">Abs</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="pull">Pull</SelectItem>
                  <SelectItem value="legs">Legs</SelectItem>
                  <SelectItem value="upper">Upper</SelectItem>
                  <SelectItem value="lower">Lower</SelectItem>
                  <SelectItem value="full-body">Full Body</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="mobility">Mobility</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Day</Label>
              <Select value={day} onValueChange={(v) => setDay(v as WorkoutDay | "none")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific day</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as WorkoutDifficulty | "none")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Target muscles</Label>
            <Input
              value={targetMuscles}
              onChange={(e) => setTargetMuscles(e.target.value)}
              placeholder="Abs, chest, triceps, lats..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Workout notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Exercises</h3>
              <p className="text-sm text-muted-foreground">
                Add the exercise list for this workout.
              </p>
            </div>

            <div className="grid gap-3">
              <Input
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Exercise name"
              />
              <Input
                value={exerciseReps}
                onChange={(e) => setExerciseReps(e.target.value)}
                placeholder="Sets/reps or duration"
              />
              <Textarea
                value={exerciseNotes}
                onChange={(e) => setExerciseNotes(e.target.value)}
                placeholder="Optional exercise notes"
              />
              <Button type="button" onClick={addExercise} className="aurora-btn rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add exercise
              </Button>
            </div>

            {exercises.length > 0 && (
              <ul className="space-y-2">
                {exercises.map((exercise) => (
                  <li key={exercise.id}>
                    <Card className="aurora-card">
                      <CardContent className="py-3 px-4 flex items-center gap-3">
                        <div className="shrink-0 rounded-full border-2 border-primary w-6 h-6 flex items-center justify-center" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{exercise.name}</p>
                          {exercise.reps && (
                            <p className="text-xs text-muted-foreground mt-1">{exercise.reps}</p>
                          )}
                          {exercise.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {exercise.notes}
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSave}>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
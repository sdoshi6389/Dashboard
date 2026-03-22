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
  Routine,
  RoutineType,
  RoutineDay,
  RoutineTask,
} from "@/types/routines";

interface RoutineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Routine | null;
  onSave: (data: Omit<Routine, "id">) => void;
}

export function RoutineDrawer({ open, onOpenChange, item, onSave }: RoutineDrawerProps) {
  const [title, setTitle] = useState("");
  const [routineType, setRoutineType] = useState<RoutineType>("custom");
  const [day, setDay] = useState<RoutineDay | "none">("none");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setRoutineType(item.routineType);
      setDay(item.day ?? "none");
      setStartTime(item.startTime ?? "");
      setEndTime(item.endTime ?? "");
      setNotes(item.notes ?? "");
      setImageDataUrl(item.imageDataUrl);
      setImageUrl(item.imageUrl);
      setTasks(item.tasks ?? []);
    } else {
      setTitle("");
      setRoutineType("custom");
      setDay("none");
      setStartTime("");
      setEndTime("");
      setNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
      setTasks([]);
    }

    setTaskTitle("");
    setTaskTime("");
    setTaskNotes("");
  }, [item, open]);

  const addTask = () => {
    const trimmed = taskTitle.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      ...prev,
      {
        id: uid(),
        title: trimmed,
        time: taskTime.trim() || undefined,
        notes: taskNotes.trim() || undefined,
      },
    ]);

    setTaskTitle("");
    setTaskTime("");
    setTaskNotes("");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onSave({
      title: trimmed,
      routineType,
      day: day === "none" ? undefined : day,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      notes: notes.trim() || undefined,
      imageDataUrl,
      imageUrl,
      tasks,
    });

    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item ? "Edit routine" : "Add routine"}</DrawerTitle>
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
            <Label>Routine title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning routine, Sunday reset, Hourly weekday plan..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Routine type</Label>
              <Select value={routineType} onValueChange={(v) => setRoutineType(v as RoutineType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Day</Label>
              <Select value={day} onValueChange={(v) => setDay(v as RoutineDay | "none")}>
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
              <Label>Start time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional routine notes"
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Routine tasks</h3>
              <p className="text-sm text-muted-foreground">
                Add the individual tasks for this routine.
              </p>
            </div>

            <div className="grid gap-3">
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
              />
              <Input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                placeholder="Optional time"
              />
              <Textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Optional task notes"
              />
              <Button type="button" onClick={addTask} className="aurora-btn rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </div>

            {tasks.length > 0 && (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <Card className="aurora-card">
                      <CardContent className="py-3 px-4 flex items-center gap-3">
                        <div className="shrink-0 rounded-full border-2 border-primary w-6 h-6 flex items-center justify-center" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.time && (
                            <p className="text-xs text-muted-foreground mt-1">{task.time}</p>
                          )}
                          {task.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.notes}
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTask(task.id)}
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
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { todayISO, isWithinDays, formatDisplay } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types/todo";
import { TodoDrawer } from "@/components/forms/TodoDrawer";

type ViewFilter = "today" | "upcoming" | "all" | "completed";

export default function TodoPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewFilter>("today");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [quickAdd, setQuickAdd] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const setTaskStatus = useStore((s) => s.setTaskStatus);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags))).sort();

  const filtered = tasks
    .filter((t) => {
      if (view === "today") return t.dueDate === todayISO();
      if (view === "upcoming")
        return t.dueDate && t.dueDate !== todayISO() && isWithinDays(t.dueDate, 7);
      if (view === "completed") return t.status === "done";
      return true;
    })
    .filter((t) => tagFilter === "all" || t.tags.includes(tagFilter))
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (da !== db) return da - db;
      const pri: Record<TaskPriority, number> = { high: 0, med: 1, low: 2 };
      return pri[a.priority] - pri[b.priority];
    });

  const handleQuickAdd = () => {
    const title = quickAdd.trim();
    if (!title) return;

    addTask({
      title,
      priority: "med",
      status: "todo",
      tags: [],
      dueDate: view === "today" ? todayISO() : undefined,
    });

    setQuickAdd("");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="To-Do"
        description="Manage tasks and priorities"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add task
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[220px] max-w-md gap-2">
          <Input
            placeholder="Quick add task..."
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            className="aurora-input rounded-xl h-11"
          />
          <Button
            onClick={handleQuickAdd}
            size="icon"
            variant="secondary"
            className="rounded-xl h-11 w-11"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[140px] aurora-input rounded-xl h-11">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as ViewFilter)}>
        <TabsList className="aurora-tabs">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming (7d)</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={view} className="mt-6">
          {filtered.length === 0 ? (
            <EmptyState
              title={view === "completed" ? "No completed tasks" : "No tasks here"}
              description="Add a task or switch view."
              action={
                <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
                  Add task
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {filtered.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() =>
                    setTaskStatus(t.id, t.status === "done" ? "todo" : "done")
                  }
                  onEdit={() => setEditId(t.id)}
                  onDelete={() => deleteTask(t.id)}
                />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <TodoDrawer
        open={addOpen || !!editId}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false);
            setEditId(null);
          }
        }}
        task={editId ? tasks.find((t) => t.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updateTask(editId, data);
            setEditId(null);
          } else {
            addTask({
              ...data,
              dueDate: data.dueDate ?? (view === "today" ? todayISO() : undefined),
            });
          }
        }}
      />
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="aurora-card">
      <CardContent className="py-3 px-4 flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-full border-2 border-primary w-6 h-6 mt-1 flex items-center justify-center hover:bg-primary/10 transition-colors"
        >
          {task.status === "done" ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : null}
        </button>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
          <p
            className={cn(
              "text-sm font-medium",
              task.status === "done" && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>

          {task.notes && (
            <p
              className={cn(
                "mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words",
                task.status === "done" && "line-through"
              )}
            >
              {task.notes}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">
            {task.priority}
          </Badge>

          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              {formatDisplay(task.dueDate)}
            </span>
          )}

          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}

          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VisionGoal, VisionCategory } from "@/types/vision";
import { useState, useEffect } from "react";

const CATEGORIES: VisionCategory[] = ["Fitness", "Career", "Relationships", "Money", "Creativity", "Other"];

interface VisionGoalDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: VisionGoal | null;
  onSave: (data: Omit<VisionGoal, "id" | "createdAt" | "updatedAt">) => void;
}

export function VisionGoalDrawer({ open, onOpenChange, goal, onSave }: VisionGoalDrawerProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VisionCategory>("Other");
  const [why, setWhy] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<VisionGoal["status"]>("active");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCategory(goal.category);
      setWhy(goal.why ?? "");
      setTargetDate(goal.targetDate ?? "");
      setStatus(goal.status);
      setProgress(goal.progress ?? 0);
    } else {
      setTitle("");
      setCategory("Other");
      setWhy("");
      setTargetDate("");
      setStatus("active");
      setProgress(0);
    }
  }, [goal, open]);

  const handleSave = () => {
    const t = title.trim();
    if (!t) return;
    onSave({
      title: t,
      category,
      why: why.trim() || undefined,
      targetDate: targetDate.trim() || undefined,
      status,
      progress,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{goal ? "Edit goal" : "Add goal"}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as VisionCategory)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Why (optional)</Label>
            <Textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why this matters" className="mt-1" />
          </div>
          <div>
            <Label>Target date</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as VisionGoal["status"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="achieved">Achieved</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Progress %</Label>
            <Slider value={progress} onChange={setProgress} min={0} max={100} className="mt-1" />
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

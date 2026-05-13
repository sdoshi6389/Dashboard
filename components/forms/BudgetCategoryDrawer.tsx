"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetCategory, BudgetCategoryType } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BudgetCategory | null;
  onSave: (data: Omit<BudgetCategory, "id">) => void;
}

export function BudgetCategoryDrawer({ open, onOpenChange, category, onSave }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [type, setType] = useState<BudgetCategoryType>("variable");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setEmoji(category.emoji ?? "");
      setMonthlyBudget(category.monthlyBudget.toString());
      setType(category.type);
      setNotes(category.notes ?? "");
    } else {
      setName("");
      setEmoji("");
      setMonthlyBudget("");
      setType("variable");
      setNotes("");
    }
  }, [category, open]);

  const handleSave = () => {
    const n = name.trim();
    if (!n || !monthlyBudget) return;
    onSave({
      name: n,
      emoji: emoji.trim() || undefined,
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      type,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{category ? "Edit Budget Category" : "Add Budget Category"}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="space-y-1.5">
              <Label>Emoji</Label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🏠" className="text-center text-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Category Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Monthly Budget ($)</Label>
              <Input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="425"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as BudgetCategoryType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed (same every month)</SelectItem>
                  <SelectItem value="variable">Variable (changes month to month)</SelectItem>
                  <SelectItem value="investing">Investing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" rows={2} />
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button onClick={handleSave} className="aurora-btn flex-1">Save</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

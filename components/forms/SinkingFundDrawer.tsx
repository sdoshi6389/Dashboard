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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SinkingFund, SinkingFundCategory } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fund: SinkingFund | null;
  onSave: (data: Omit<SinkingFund, "id">) => void;
}

const categoryOptions: { value: SinkingFundCategory; label: string }[] = [
  { value: "tech", label: "Tech" },
  { value: "travel", label: "Travel" },
  { value: "gift", label: "Gift" },
  { value: "experience", label: "Experience" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "other", label: "Other" },
];

export function SinkingFundDrawer({ open, onOpenChange, fund, onSave }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState<SinkingFundCategory>("other");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (fund) {
      setName(fund.name);
      setEmoji(fund.emoji ?? "");
      setTargetAmount(fund.targetAmount.toString());
      setCurrentAmount(fund.currentAmount.toString());
      setMonthlyContribution(fund.monthlyContribution.toString());
      setTargetDate(fund.targetDate ?? "");
      setCategory(fund.category);
      setCompleted(fund.completed ?? false);
    } else {
      setName("");
      setEmoji("");
      setTargetAmount("");
      setCurrentAmount("0");
      setMonthlyContribution("");
      setTargetDate("");
      setCategory("other");
      setCompleted(false);
    }
  }, [fund, open]);

  const handleSave = () => {
    const n = name.trim();
    if (!n || !targetAmount) return;
    onSave({
      name: n,
      emoji: emoji.trim() || undefined,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      targetDate: targetDate || undefined,
      category,
      completed,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{fund ? "Edit Goal" : "Add Goal"}</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-2 space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="space-y-1.5">
              <Label>Emoji</Label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="💻" className="text-center text-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Goal Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Laptop" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Target Amount ($)</Label>
              <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="2500" />
            </div>
            <div className="space-y-1.5">
              <Label>Amount Saved ($)</Label>
              <Input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Monthly Contribution ($)</Label>
              <Input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} placeholder="300" />
            </div>
            <div className="space-y-1.5">
              <Label>Target Date</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as SinkingFundCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="completed">Mark as completed</Label>
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

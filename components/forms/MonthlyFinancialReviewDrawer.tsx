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
import type { MonthlyFinancialReview } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: MonthlyFinancialReview | null;
  onSave: (data: Omit<MonthlyFinancialReview, "id">) => void;
}

export function MonthlyFinancialReviewDrawer({ open, onOpenChange, review, onSave }: Props) {
  const [month, setMonth] = useState("");
  const [totalIncome, setTotalIncome] = useState("");
  const [totalSpent, setTotalSpent] = useState("");
  const [totalInvested, setTotalInvested] = useState("");
  const [investmentRate, setInvestmentRate] = useState("");
  const [reflection, setReflection] = useState("");
  const [highlights, setHighlights] = useState("");
  const [improvements, setImprovements] = useState("");

  useEffect(() => {
    if (review) {
      setMonth(review.month);
      setTotalIncome(review.totalIncome.toString());
      setTotalSpent(review.totalSpent.toString());
      setTotalInvested(review.totalInvested.toString());
      setInvestmentRate(review.investmentRate.toString());
      setReflection(review.reflection);
      setHighlights(review.highlights);
      setImprovements(review.improvements);
    } else {
      const now = new Date();
      setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
      setTotalIncome("");
      setTotalSpent("");
      setTotalInvested("");
      setInvestmentRate("");
      setReflection("");
      setHighlights("");
      setImprovements("");
    }
  }, [review, open]);

  const handleSave = () => {
    if (!month) return;

    const income = parseFloat(totalIncome) || 0;
    const invested = parseFloat(totalInvested) || 0;
    const rate = investmentRate
      ? parseFloat(investmentRate)
      : income > 0
      ? Math.round((invested / income) * 100)
      : 0;

    onSave({
      month,
      totalIncome: income,
      totalSpent: parseFloat(totalSpent) || 0,
      totalInvested: invested,
      investmentRate: rate,
      reflection: reflection.trim(),
      highlights: highlights.trim(),
      improvements: improvements.trim(),
    });
    onOpenChange(false);
  };

  const computedRate =
    totalIncome && totalInvested && parseFloat(totalIncome) > 0
      ? Math.round((parseFloat(totalInvested) / parseFloat(totalIncome)) * 100)
      : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{review ? "Edit Monthly Review" : "Add Monthly Review"}</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-2 space-y-4">
          <div className="space-y-1.5">
            <Label>Month</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Income ($)</Label>
              <Input type="number" value={totalIncome} onChange={(e) => setTotalIncome(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Spent ($)</Label>
              <Input type="number" value={totalSpent} onChange={(e) => setTotalSpent(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Invested ($)</Label>
              <Input type="number" value={totalInvested} onChange={(e) => setTotalInvested(e.target.value)} placeholder="0" />
            </div>
          </div>

          {computedRate !== null && (
            <p className="text-sm text-muted-foreground">
              Investment rate: <span className="text-aurora-teal font-semibold">{computedRate}%</span>
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Highlights</Label>
            <Textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="What went well this month?" rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Improvements</Label>
            <Textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="What would you do differently?" rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Reflection</Label>
            <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Overall thoughts on this month…" rows={3} />
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

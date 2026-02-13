"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/date";
import { isThisMonth } from "@/lib/date";
import { DailyReviewDrawer } from "./DailyReviewDrawer";

export function DailyReviewPanel() {
  const [open, setOpen] = useState(false);
  const tasks = useStore((s) => s.tasks);
  const visionGoals = useStore((s) => s.visionGoals);
  const books = useStore((s) => s.books);
  const purchaseItems = useStore((s) => s.purchaseItems);
  const packages = useStore((s) => s.packages);

  const todayTasks = tasks.filter((t) => t.dueDate === todayISO() && t.status !== "done");
  const doneToday = tasks.filter((t) => t.dueDate === todayISO() && t.status === "done");
  const totalToday = todayTasks.length + doneToday.length;
  const progress = totalToday ? (doneToday.length / totalToday) * 100 : 0;

  const focusGoal = visionGoals
    .filter((g) => g.status === "active")
    .sort((a, b) => {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    })[0];

  const currentlyReading = books.filter((b) => b.status === "reading").slice(0, 1);
  const nextPackage = [...packages]
    .filter((p) => p.status !== "delivered" && p.expectedDeliveryDate)
    .sort((a, b) => (a.expectedDeliveryDate! > b.expectedDeliveryDate! ? 1 : -1))[0];
  const dueThisMonth = purchaseItems.filter(
    (p) => p.nextPurchaseAt && isThisMonth(p.nextPurchaseAt)
  );
  const estTotal = dueThisMonth.reduce((sum, p) => sum + (p.estPrice ?? 0), 0);

  return (
    <>
      <Card className="aurora-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-aurora-teal" />
            <h3 className="font-semibold">Daily Review</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Today&apos;s tasks: {todayTasks.length} remaining ({Math.round(progress)}% done)</li>
            {focusGoal && <li>• Focus goal: {focusGoal.title}</li>}
            {currentlyReading[0] && (
              <li>• Reading: {currentlyReading[0].title} by {currentlyReading[0].author}</li>
            )}
            {nextPackage && (
              <li>• Next package: {nextPackage.itemName} — {nextPackage.expectedDeliveryDate}</li>
            )}
            <li>• Due this month: {dueThisMonth.length} items (est. ${estTotal})</li>
          </ul>
          <Button onClick={() => setOpen(true)} className="w-full aurora-btn">
            Start Daily Review
          </Button>
        </CardContent>
      </Card>
      <DailyReviewDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}

"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { todayISO, isThisMonth } from "@/lib/date";
import { Check, ChevronRight, Package, BookOpen, Target, ShoppingCart, ListTodo } from "lucide-react";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { Book, BookStatus } from "@/types/reading";

interface DailyReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: "tasks", label: "Today's tasks", icon: ListTodo },
  { id: "goal", label: "Focus goal", icon: Target },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "purchases", label: "Purchases due", icon: ShoppingCart },
  { id: "package", label: "Next package", icon: Package },
] as const;

export function DailyReviewDrawer({ open, onOpenChange }: DailyReviewDrawerProps) {
  const [step, setStep] = useState(0);

  const tasks = useStore((s) => s.tasks);
  const setTaskStatus = useStore((s) => s.setTaskStatus);

  const visionGoals = useStore((s) => s.visionGoals);
  const updateGoal = useStore((s) => s.updateGoal);

  const books = useStore((s) => s.books);
  const updateBook = useStore((s) => s.updateBook);
  const addReview = useStore((s) => s.addReview);

  const purchaseItems = useStore((s) => s.purchaseItems);
  const markPurchased = useStore((s) => s.markPurchased);

  const packages = useStore((s) => s.packages);
  const markDelivered = useStore((s) => s.markDelivered);

  const todayTasks = tasks.filter((t) => t.dueDate === todayISO());

  const focusGoal = visionGoals
    .filter((g) => g.status === "active")
    .sort((a, b) => {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    })[0];

  const currentlyReading = books.filter((b) => b.status === "reading");

  const dueThisMonth = purchaseItems.filter(
    (p) => p.nextPurchaseAt && isThisMonth(p.nextPurchaseAt)
  );

  const nextPackage = [...packages]
    .filter((p) => p.status !== "delivered" && p.expectedDeliveryDate)
    .sort((a, b) => (a.expectedDeliveryDate! > b.expectedDeliveryDate! ? 1 : -1))[0];

  const currentStep = STEPS[step];
  const StepIcon = currentStep?.icon;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="flex items-center gap-2">
            {StepIcon && <StepIcon className="h-5 w-5 text-primary" />}
            {currentStep?.label}
          </DrawerTitle>
          <DrawerDescription>
            Step {step + 1} of {STEPS.length}
          </DrawerDescription>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2 h-1.5" />
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentStep?.id === "tasks" && (
            <ul className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due today.</p>
              ) : (
                todayTasks.map((t) => (
                  <li
                    key={t.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border p-3 transition-colors",
                      t.status === "done" && "opacity-60 bg-muted/50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setTaskStatus(t.id, t.status === "done" ? "todo" : "done")}
                      className="rounded-full border-2 border-primary w-6 h-6 flex items-center justify-center shrink-0"
                    >
                      {t.status === "done" && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        t.status === "done" && "line-through text-muted-foreground"
                      )}
                    >
                      {t.title}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}

          {currentStep?.id === "goal" && focusGoal && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <p className="font-medium">{focusGoal.title}</p>
                {focusGoal.why && (
                  <p className="text-sm text-muted-foreground mt-1">{focusGoal.why}</p>
                )}
                <div className="mt-4">
                  <label className="text-xs text-muted-foreground">Progress %</label>
                  <Slider
                    value={focusGoal.progress ?? 0}
                    onChange={(v) => updateGoal(focusGoal.id, { progress: v })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep?.id === "goal" && !focusGoal && (
            <p className="text-sm text-muted-foreground">No active focus goal.</p>
          )}

          {currentStep?.id === "reading" && (
            <div className="space-y-3">
              {currentlyReading.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing currently reading.</p>
              ) : (
                currentlyReading.map((b) => (
                  <ReadingStep
                    key={b.id}
                    book={b}
                    onUpdate={(updates) => updateBook(b.id, updates)}
                    onAddReview={addReview}
                  />
                ))
              )}
            </div>
          )}

          {currentStep?.id === "purchases" && (
            <ul className="space-y-2">
              {dueThisMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchases due this month.</p>
              ) : (
                dueThisMonth.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Thumbnail imageDataUrl={p.imageDataUrl} imageUrl={p.imageUrl} alt={p.name} size="sm" />
                    <span className="flex-1 text-sm">{p.name}</span>
                    <Button size="sm" onClick={() => markPurchased(p.id)}>
                      Mark purchased
                    </Button>
                  </li>
                ))
              )}
            </ul>
          )}

          {currentStep?.id === "package" && (
            <div className="space-y-3">
              {!nextPackage ? (
                <p className="text-sm text-muted-foreground">No incoming packages.</p>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Thumbnail
                    imageDataUrl={nextPackage.imageDataUrl}
                    imageUrl={nextPackage.imageUrl}
                    alt={nextPackage.itemName}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{nextPackage.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      Expected: {nextPackage.expectedDeliveryDate}
                    </p>
                  </div>
                  <Button onClick={() => markDelivered(nextPackage.id)}>Mark delivered</Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <DrawerClose asChild>
              <Button>Done</Button>
            </DrawerClose>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ReadingStep({
  book,
  onUpdate,
  onAddReview,
}: {
  book: Pick<Book, "id" | "title" | "author">;
  onUpdate: (patch: Partial<Book>) => void;
  onAddReview: (r: { bookId: string; rating: number; summary?: string; takeaways: string[] }) => void;
}) {
  const [note, setNote] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(3);
  const [summary, setSummary] = useState("");
  const [takeaways, setTakeaways] = useState("");

  const doneStatus: BookStatus = "done";

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="font-medium">
        {book.title} — {book.author}
      </p>

      <div>
        <label className="text-xs text-muted-foreground">Quick note</label>
        <Textarea
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 min-h-[60px]"
        />
        {/* NOTE: This note is currently local-only UI state.
            If you want to persist notes per reading session, add a field on Book or a separate ReadingNote type. */}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onUpdate({ status: doneStatus })}>
          Mark as done
        </Button>

        {!showReview ? (
          <Button size="sm" variant="outline" onClick={() => setShowReview(true)}>
            Add review
          </Button>
        ) : (
          <div className="flex-1 space-y-2 border rounded-lg p-3">
            <div>
              <label className="text-xs">Rating (1-5)</label>
              <Slider
                value={rating}
                onChange={(v) => setRating(v ?? 3)}
                min={1}
                max={5}
                step={1}
                className="mt-1"
              />
            </div>

            <Input
              placeholder="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-9"
            />

            <Input
              placeholder="Takeaways (comma separated)"
              value={takeaways}
              onChange={(e) => setTakeaways(e.target.value)}
              className="h-9"
            />

            <Button
              size="sm"
              onClick={() => {
                onAddReview({
                  bookId: book.id,
                  rating,
                  summary: summary || undefined,
                  takeaways: takeaways
                    ? takeaways
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : [],
                });

                onUpdate({ status: doneStatus });
                setShowReview(false);
              }}
            >
              Save review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

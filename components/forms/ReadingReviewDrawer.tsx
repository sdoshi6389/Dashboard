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
import type { Book, Review } from "@/types/reading";
import { useEffect, useState } from "react";

interface ReadingReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  onSave: (data: Omit<Review, "id" | "createdAt">) => void;
}

export function ReadingReviewDrawer({
  open,
  onOpenChange,
  book,
  onSave,
}: ReadingReviewDrawerProps) {
  const [rating, setRating] = useState(3);
  const [summary, setSummary] = useState("");
  const [takeawaysStr, setTakeawaysStr] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [applyThis, setApplyThis] = useState("");

  useEffect(() => {
    if (!open || !book) return;

    setRating(3);
    setSummary("");
    setTakeawaysStr("");
    setFavoriteQuote("");
    setApplyThis("");
  }, [open, book]);

  const handleSave = () => {
    if (!book) return;

    onSave({
      bookId: book.id,
      rating,
      summary: summary.trim() || undefined,
      takeaways: takeawaysStr
        ? takeawaysStr
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      favoriteQuote: favoriteQuote.trim() || undefined,
      applyThis: applyThis.trim() || undefined,
    });

    onOpenChange(false);
  };

  if (!book) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Review: {book.title}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 p-4">
          <div>
            <Label>Rating (1-5)</Label>
            <Slider
              value={rating}
              onChange={(value: number) => setRating(value)}
              min={1}
              max={5}
              step={1}
              className="mt-3"
            />
            <span className="ml-1 text-sm text-muted-foreground">{rating}</span>
          </div>

          <div>
            <Label>Summary</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Takeaways (one per line)</Label>
            <Textarea
              value={takeawaysStr}
              onChange={(e) => setTakeawaysStr(e.target.value)}
              placeholder={"Key takeaway 1\nKey takeaway 2"}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label>Favorite quote</Label>
            <Input
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              placeholder="Optional"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Apply this</Label>
            <Textarea
              value={applyThis}
              onChange={(e) => setApplyThis(e.target.value)}
              placeholder="How you'll apply it"
              className="mt-1"
            />
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSave}>Save review</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
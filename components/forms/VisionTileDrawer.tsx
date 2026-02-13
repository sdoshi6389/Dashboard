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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePicker } from "@/components/shared/ImagePicker";
import type { VisionTile, VisionCategory } from "@/types/vision";
import { useState, useEffect } from "react";

const CATEGORIES: VisionCategory[] = ["Fitness", "Career", "Relationships", "Money", "Creativity", "Other"];

interface VisionTileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tile: VisionTile | null;
  onSave: (data: Omit<VisionTile, "id" | "createdAt">) => void;
  isBoardOnly?: boolean;
}

export function VisionTileDrawer({ open, onOpenChange, tile, onSave, isBoardOnly }: VisionTileDrawerProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VisionCategory>("Other");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (tile) {
      setTitle(tile.title);
      setCategory(tile.category);
      setNotes(tile.notes ?? "");
      setImageDataUrl(tile.imageDataUrl);
      setImageUrl(tile.imageUrl);
    } else {
      setTitle(isBoardOnly ? "Vision board" : "");
      setCategory("Other");
      setNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
    }
  }, [tile, open, isBoardOnly]);

  const handleSave = () => {
    const t = title.trim() || (isBoardOnly ? "Vision board" : "");
    if (!t && !isBoardOnly) return;
    if (isBoardOnly && !imageDataUrl && !imageUrl) return;
    onSave({
      title: t || "Vision board",
      category,
      notes: notes.trim() || undefined,
      imageDataUrl,
      imageUrl,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="aurora-drawer">
        <DrawerHeader>
          <DrawerTitle>{isBoardOnly ? (tile ? "Change vision board image" : "Set vision board image") : (tile ? "Edit tile" : "Add tile")}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          {!isBoardOnly && (
            <>
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tile title" className="mt-1 aurora-input" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as VisionCategory)}>
                  <SelectTrigger className="mt-1 aurora-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
            label="Image"
          />
          {!isBoardOnly && (
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="mt-1 aurora-input" />
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="aurora-btn-secondary">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSave} className="aurora-btn">Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

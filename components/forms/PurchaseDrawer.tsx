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
import type { PurchaseItem, PurchaseRecurrence } from "@/types/purchases";
import { useState, useEffect } from "react";

interface PurchaseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PurchaseItem | null;
  onSave: (data: Omit<PurchaseItem, "id">) => void;
}

export function PurchaseDrawer({ open, onOpenChange, item, onSave }: PurchaseDrawerProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [estPrice, setEstPrice] = useState("");
  const [recurrence, setRecurrence] = useState<PurchaseRecurrence>("none");
  const [link, setLink] = useState("");
  const [priority, setPriority] = useState(1);
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setEstPrice(item.estPrice?.toString() ?? "");
      setRecurrence(item.recurrence);
      setLink(item.link ?? "");
      setPriority(item.priority);
      setNotes(item.notes ?? "");
      setImageDataUrl(item.imageDataUrl);
      setImageUrl(item.imageUrl);
    } else {
      setName("");
      setCategory("");
      setEstPrice("");
      setRecurrence("none");
      setLink("");
      setPriority(1);
      setNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
    }
  }, [item, open]);

  const handleSave = () => {
    const n = name.trim();
    if (!n) return;
    onSave({
      name: n,
      category: category.trim() || "Other",
      estPrice: estPrice ? parseFloat(estPrice) : undefined,
      recurrence,
      lastPurchasedAt: item?.lastPurchasedAt,
      nextPurchaseAt: item?.nextPurchaseAt,
      link: link.trim() || undefined,
      priority,
      notes: notes.trim() || undefined,
      imageDataUrl,
      imageUrl,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item ? "Edit purchase" : "Add purchase"}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
          />
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Food, Health" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Est. price</Label>
              <Input type="number" step="0.01" value={estPrice} onChange={(e) => setEstPrice(e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Recurrence</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as PurchaseRecurrence)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (wishlist)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Link (optional)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div>
            <Label>Priority (number)</Label>
            <Input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)} className="mt-1" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="mt-1" />
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

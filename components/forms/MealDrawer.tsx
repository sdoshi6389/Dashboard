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
import type { Meal, MealType } from "@/types/meals";
import { useEffect, useState } from "react";

interface MealDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Meal | null;
  onSave: (data: Omit<Meal, "id">) => void;
}

export function MealDrawer({ open, onOpenChange, item, onSave }: MealDrawerProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDate(item.date ?? "");
      setMealType(item.mealType);
      setTime(item.time ?? "");
      setDescription(item.description ?? "");
      setCalories(item.calories?.toString() ?? "");
      setProtein(item.protein?.toString() ?? "");
      setCarbs(item.carbs?.toString() ?? "");
      setFat(item.fat?.toString() ?? "");
      setNotes(item.notes ?? "");
      setImageDataUrl(item.imageDataUrl);
      setImageUrl(item.imageUrl);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTitle("");
      setDate(today);
      setMealType("breakfast");
      setTime("");
      setDescription("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
    }
  }, [item, open]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed || !date) return;

    onSave({
      title: trimmed,
      date,
      mealType,
      time: time.trim() || undefined,
      description: description.trim() || undefined,
      calories: calories.trim() ? Number(calories) : undefined,
      protein: protein.trim() ? Number(protein) : undefined,
      carbs: carbs.trim() ? Number(carbs) : undefined,
      fat: fat.trim() ? Number(fat) : undefined,
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
          <DrawerTitle>{item ? "Edit meal" : "Add meal"}</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
          />

          <div>
            <Label>Meal title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chicken bowl, protein oats, salmon rice..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Meal type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What the meal includes"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Calories</Label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Protein (g)</Label>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Fat (g)</Label>
              <Input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="mt-1"
            />
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
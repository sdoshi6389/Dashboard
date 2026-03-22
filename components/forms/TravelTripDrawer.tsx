"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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
import { ImagePicker } from "@/components/shared/ImagePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import { uid } from "@/lib/utils";
import type {
  TravelStatus,
  TravelTrip,
  TravelDay,
  TravelPlanItem,
  TravelPlanItemType,
} from "@/types/travel";

interface TravelTripDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TravelTrip | null;
  onSave: (data: Omit<TravelTrip, "id">) => void;
}

function makeEmptyDay(dayNumber: number): TravelDay {
  return {
    id: uid(),
    dayNumber,
    date: "",
    title: "",
    notes: "",
    items: [],
  };
}

export function TravelTripDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: TravelTripDrawerProps) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<TravelStatus>("future");
  const [tags, setTags] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const [days, setDays] = useState<TravelDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState("");

  const [activityTime, setActivityTime] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [activityType, setActivityType] = useState<TravelPlanItemType>("activity");

  useEffect(() => {
    if (item) {
      const initialDays = item.days.length > 0 ? item.days : [makeEmptyDay(1)];

      setTitle(item.title);
      setDestination(item.destination);
      setDescription(item.description ?? "");
      setStartDate(item.startDate);
      setEndDate(item.endDate);
      setStatus(item.status);
      setTags(item.tags.join(", "));
      setImageDataUrl(item.imageDataUrl);
      setImageUrl(item.imageUrl);
      setDays(initialDays);
      setSelectedDayId(initialDays[0]?.id ?? "");
    } else {
      const initialDays = [makeEmptyDay(1)];

      setTitle("");
      setDestination("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setStatus("future");
      setTags("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
      setDays(initialDays);
      setSelectedDayId(initialDays[0].id);
    }

    setActivityTime("");
    setActivityTitle("");
    setActivityLocation("");
    setActivityDetails("");
    setActivityType("activity");
  }, [item, open]);

  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId) ?? null,
    [days, selectedDayId]
  );

  const addDay = () => {
    const nextDay = makeEmptyDay(days.length + 1);
    setDays((prev) => [...prev, nextDay]);
    setSelectedDayId(nextDay.id);
  };

  const removeDay = (dayId: string) => {
    const updated = days
      .filter((day) => day.id !== dayId)
      .map((day, index) => ({
        ...day,
        dayNumber: index + 1,
      }));

    setDays(updated);

    if (updated.length > 0) {
      setSelectedDayId(updated[0].id);
    } else {
      const replacement = makeEmptyDay(1);
      setDays([replacement]);
      setSelectedDayId(replacement.id);
    }
  };

  const updateDay = (dayId: string, patch: Partial<TravelDay>) => {
    setDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, ...patch } : day))
    );
  };

  const addActivity = () => {
    const trimmedTitle = activityTitle.trim();
    if (!trimmedTitle || !selectedDayId) return;

    const newActivity: TravelPlanItem = {
      id: uid(),
      time: activityTime.trim(),
      title: trimmedTitle,
      location: activityLocation.trim() || undefined,
      details: activityDetails.trim() || undefined,
      type: activityType,
    };

    setDays((prev) =>
      prev.map((day) =>
        day.id === selectedDayId
          ? { ...day, items: [...day.items, newActivity] }
          : day
      )
    );

    setActivityTime("");
    setActivityTitle("");
    setActivityLocation("");
    setActivityDetails("");
    setActivityType("activity");
  };

  const removeActivity = (dayId: string, activityId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.filter((entry) => entry.id !== activityId) }
          : day
      )
    );
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedDestination = destination.trim();

    if (!trimmedTitle || !trimmedDestination) return;

    onSave({
      title: trimmedTitle,
      destination: trimmedDestination,
      description: description.trim() || undefined,
      startDate,
      endDate,
      status,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      imageDataUrl,
      imageUrl,
      days,
    });

    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item ? "Edit trip" : "Add trip"}</DrawerTitle>
        </DrawerHeader>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-4">
          <div className="space-y-4">
            <ImagePicker
              value={{ imageDataUrl, imageUrl }}
              onChange={({ imageDataUrl: d, imageUrl: u }) => {
                setImageDataUrl(d);
                setImageUrl(u);
              }}
            />

            <div>
              <Label>Trip title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Paris Spring, Japan 2026, Miami Weekend..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Destination</Label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Paris, France"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>End date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TravelStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="future">Future</SelectItem>
                  <SelectItem value="progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="europe, city, spring, beach..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Trip notes, vibe, memories, plans..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/70 bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Trip days</h3>
                <p className="text-sm text-muted-foreground">
                  Add days and plan activities for each one.
                </p>
              </div>

              <Button type="button" onClick={addDay} className="aurora-btn rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add day
              </Button>
            </div>

            <div className="space-y-3">
              {days.map((day) => (
                <Card
                  key={day.id}
                  className={`aurora-card ${
                    selectedDayId === day.id ? "ring-1 ring-primary" : ""
                  }`}
                >
                  <CardContent className="space-y-3 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDayId(day.id)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium">Day {day.dayNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {day.title || "Untitled day"}
                        </p>
                      </button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDay(day.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={day.date}
                          onChange={(e) => updateDay(day.id, { date: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Day title</Label>
                        <Input
                          value={day.title}
                          onChange={(e) => updateDay(day.id, { title: e.target.value })}
                          placeholder="Arrival, Beach day, Museum day..."
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Day notes</Label>
                      <Textarea
                        value={day.notes ?? ""}
                        onChange={(e) => updateDay(day.id, { notes: e.target.value })}
                        placeholder="Optional notes for this day"
                        className="mt-1"
                      />
                    </div>

                    {day.items.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {day.items.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-start gap-3 rounded-xl border border-border px-3 py-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {entry.time ? `${entry.time} · ` : ""}
                                {entry.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {entry.type}
                                {entry.location ? ` · ${entry.location}` : ""}
                              </p>
                              {entry.details && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {entry.details}
                                </p>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeActivity(day.id, entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedDay && (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/40 p-4">
              <div>
                <h3 className="font-medium">
                  Add activities for Day {selectedDay.dayNumber}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Works like adding exercises to a workout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time</Label>
                  <Input
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    placeholder="9:00 AM"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  <Select
                    value={activityType}
                    onValueChange={(v) => setActivityType(v as TravelPlanItemType)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Activity title</Label>
                <Input
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Louvre visit, brunch, hotel check-in..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={activityLocation}
                  onChange={(e) => setActivityLocation(e.target.value)}
                  placeholder="Optional location"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Details</Label>
                <Textarea
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  placeholder="Optional details"
                  className="mt-1"
                />
              </div>

              <Button type="button" onClick={addActivity} className="aurora-btn rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add activity
              </Button>
            </div>
          )}
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
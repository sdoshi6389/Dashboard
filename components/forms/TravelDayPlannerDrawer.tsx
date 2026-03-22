"use client";

import { useEffect, useState } from "react";
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
  TravelDay,
  TravelPlanItem,
  TravelPlanItemType,
  TravelTrip,
} from "@/types/travel";

interface TravelDayPlannerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TravelTrip | null;
  onSave: (days: TravelDay[]) => void;
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

export function TravelDayPlannerDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: TravelDayPlannerDrawerProps) {
  const [days, setDays] = useState<TravelDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string>("");

  const [planTime, setPlanTime] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [planLocation, setPlanLocation] = useState("");
  const [planDetails, setPlanDetails] = useState("");
  const [planType, setPlanType] = useState<TravelPlanItemType>("activity");

  useEffect(() => {
    if (item) {
      const initialDays = item.days.length > 0 ? item.days : [makeEmptyDay(1)];
      setDays(initialDays);
      setSelectedDayId(initialDays[0]?.id ?? "");
    } else {
      setDays([]);
      setSelectedDayId("");
    }

    setPlanTime("");
    setPlanTitle("");
    setPlanLocation("");
    setPlanDetails("");
    setPlanType("activity");
  }, [item, open]);

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
    setSelectedDayId(updated[0]?.id ?? "");
  };

  const updateDay = (dayId: string, patch: Partial<TravelDay>) => {
    setDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, ...patch } : day))
    );
  };

  const addPlanItem = () => {
    const trimmedTitle = planTitle.trim();
    if (!trimmedTitle || !selectedDayId) return;

    const newItem: TravelPlanItem = {
      id: uid(),
      time: planTime.trim(),
      title: trimmedTitle,
      location: planLocation.trim() || undefined,
      details: planDetails.trim() || undefined,
      type: planType,
    };

    setDays((prev) =>
      prev.map((day) =>
        day.id === selectedDayId
          ? { ...day, items: [...day.items, newItem] }
          : day
      )
    );

    setPlanTime("");
    setPlanTitle("");
    setPlanLocation("");
    setPlanDetails("");
    setPlanType("activity");
  };

  const removePlanItem = (dayId: string, itemId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.filter((entry) => entry.id !== itemId) }
          : day
      )
    );
  };

  const handleSave = () => {
    onSave(days);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {item ? `Plan days for ${item.title}` : "Plan trip days"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Trip days</h3>
                <p className="text-sm text-muted-foreground">
                  Add each day of the trip and then attach itinerary items.
                </p>
              </div>
              <Button type="button" onClick={addDay} className="aurora-btn rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add day
              </Button>
            </div>

            {days.length > 0 && (
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
                            onChange={(e) =>
                              updateDay(day.id, { date: e.target.value })
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Day title</Label>
                          <Input
                            value={day.title}
                            onChange={(e) =>
                              updateDay(day.id, { title: e.target.value })
                            }
                            placeholder="Arrival, Beach day, Museum day..."
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Day notes</Label>
                        <Textarea
                          value={day.notes ?? ""}
                          onChange={(e) =>
                            updateDay(day.id, { notes: e.target.value })
                          }
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
                                onClick={() => removePlanItem(day.id, entry.id)}
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
            )}
          </div>

          {selectedDayId && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Add itinerary item</h3>
                <p className="text-sm text-muted-foreground">
                  Add a plan item to the selected day.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time</Label>
                  <Input
                    value={planTime}
                    onChange={(e) => setPlanTime(e.target.value)}
                    placeholder="9:00 AM"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  <Select value={planType} onValueChange={(v) => setPlanType(v as TravelPlanItemType)}>
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
                <Label>Title</Label>
                <Input
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Louvre visit, hotel check-in, brunch..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={planLocation}
                  onChange={(e) => setPlanLocation(e.target.value)}
                  placeholder="Optional location"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Details</Label>
                <Textarea
                  value={planDetails}
                  onChange={(e) => setPlanDetails(e.target.value)}
                  placeholder="Optional details"
                  className="mt-1"
                />
              </div>

              <Button type="button" onClick={addPlanItem} className="aurora-btn rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add itinerary item
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
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  MapPinned,
  CalendarDays,
  Plane,
  Compass,
  CheckCircle2,
} from "lucide-react";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useStore } from "@/lib/store";
import type { TravelStatus } from "@/types/travel";
import { TravelTripDrawer } from "@/components/forms/TravelTripDrawer";

const statusMeta: Record<
  TravelStatus,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  future: { label: "Future", icon: Plane },
  progress: { label: "In progress", icon: Compass },
  completed: { label: "Completed", icon: CheckCircle2 },
};

export default function TravelsClientPage() {
  const trips = useStore((s) => s.trips);
  const addTrip = useStore((s) => s.addTrip);
  const updateTrip = useStore((s) => s.updateTrip);
  const deleteTrip = useStore((s) => s.deleteTrip);

  const [tab, setTab] = useState<"all" | TravelStatus>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TravelStatus>("all");
  const [search, setSearch] = useState("");

  const [tripDrawerOpen, setTripDrawerOpen] = useState(false);
  const [editTripId, setEditTripId] = useState<string | null>(null);

  const filteredTrips = useMemo(() => {
    return trips
      .filter((trip) => (tab === "all" ? true : trip.status === tab))
      .filter((trip) => (statusFilter === "all" ? true : trip.status === statusFilter))
      .filter((trip) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          trip.title.toLowerCase().includes(q) ||
          trip.destination.toLowerCase().includes(q) ||
          trip.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
  }, [trips, tab, statusFilter, search]);

  const selectedTrip = editTripId
    ? trips.find((trip) => trip.id === editTripId) ?? null
    : null;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Travels"
        description="Document previous vacations, current trips, future plans, and plan each day of every trip."
        action={
          <Button
            onClick={() => {
              setEditTripId(null);
              setTripDrawerOpen(true);
            }}
            className="aurora-btn rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add trip
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search destination or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[240px] aurora-input rounded-xl h-11"
        />

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | TravelStatus)}
        >
          <SelectTrigger className="w-[160px] aurora-input rounded-xl h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="future">Future</SelectItem>
            <SelectItem value="progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | TravelStatus)}>
        <TabsList className="aurora-tabs">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="future">Future</TabsTrigger>
          <TabsTrigger value="progress">In progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-8">
          {filteredTrips.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              title="No trips yet"
              description="Add a trip and plan out each day with activities."
              action={
                <Button
                  onClick={() => {
                    setEditTripId(null);
                    setTripDrawerOpen(true);
                  }}
                  className="aurora-btn rounded-xl"
                >
                  Add trip
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTrips.map((trip) => {
                const StatusIcon = statusMeta[trip.status].icon;

                return (
                  <Card
                    key={trip.id}
                    className="aurora-card overflow-hidden transition-all duration-200 hover:border-aurora-teal/30"
                  >
                    <div className="relative h-48 w-full overflow-hidden border-b border-border bg-muted">
                      {trip.imageDataUrl || trip.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trip.imageDataUrl || trip.imageUrl}
                          alt={trip.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-aurora-teal/10 via-background to-aurora-purple/10 text-muted-foreground">
                          <MapPinned className="h-10 w-10" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-white">{trip.title}</p>
                            <p className="text-sm text-white/80">{trip.destination}</p>
                          </div>
                          <Badge className="rounded-full border-white/20 bg-black/40 text-white">
                            <StatusIcon className="mr-1 h-3.5 w-3.5" />
                            {statusMeta[trip.status].label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="space-y-3 pb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {trip.startDate || "No start date"} - {trip.endDate || "No end date"}
                        </span>
                      </div>

                      {trip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {trip.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {trip.description ? (
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {trip.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No description added yet.
                        </p>
                      )}

                      <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium">Trip plan</p>
                          <Badge variant="outline" className="text-xs">
                            {trip.days.length} day{trip.days.length === 1 ? "" : "s"}
                          </Badge>
                        </div>

                        {trip.days.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No itinerary yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {trip.days.slice(0, 3).map((day) => (
                              <div
                                key={day.id}
                                className="rounded-xl border border-border/60 bg-muted/30 p-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium">
                                      Day {day.dayNumber}: {day.title || "Untitled day"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {day.date || "No date"}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {day.items.length} item{day.items.length === 1 ? "" : "s"}
                                  </Badge>
                                </div>
                              </div>
                            ))}

                            {trip.days.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{trip.days.length - 3} more planned day
                                {trip.days.length - 3 === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="aurora-btn-secondary rounded-lg text-xs"
                          onClick={() => {
                            setEditTripId(trip.id);
                            setTripDrawerOpen(true);
                          }}
                        >
                          Edit trip
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-xs text-destructive"
                          onClick={() => deleteTrip(trip.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TravelTripDrawer
        open={tripDrawerOpen}
        onOpenChange={(open) => {
          setTripDrawerOpen(open);
          if (!open) setEditTripId(null);
        }}
        item={selectedTrip}
        onSave={(data) => {
          if (editTripId) {
            updateTrip(editTripId, data);
          } else {
            addTrip(data);
          }
          setTripDrawerOpen(false);
          setEditTripId(null);
        }}
      />
    </div>
  );
}
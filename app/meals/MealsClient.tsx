"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Utensils } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { MealDrawer } from "@/components/forms/MealDrawer";
import { useStore } from "@/lib/store";
import { formatDisplay } from "@/lib/date";

export default function MealsClient() {
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const meals = useStore((s) => s.meals);
  const updateMeal = useStore((s) => s.updateMeal);
  const deleteMeal = useStore((s) => s.deleteMeal);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const grouped = useMemo(() => {
    const sorted = [...meals].sort((a, b) => {
      const aKey = `${a.date} ${a.time ?? "00:00"}`;
      const bKey = `${b.date} ${b.time ?? "00:00"}`;
      return aKey < bKey ? 1 : -1;
    });

    return sorted.reduce<Record<string, typeof meals>>((acc, meal) => {
      if (!acc[meal.date]) acc[meal.date] = [];
      acc[meal.date].push(meal);
      return acc;
    }, {});
  }, [meals]);

  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Meal Chart"
        description="Track meals, macros, and daily eating patterns"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add meal
          </Button>
        }
      />

      {dates.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No meals yet"
          description="Add your first meal to start your meal chart."
          action={
            <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
              Add meal
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date} className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{formatDisplay(date)}</h2>
                <p className="text-sm text-muted-foreground">{grouped[date].length} meal(s)</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {grouped[date].map((meal) => (
                  <Card key={meal.id} className="aurora-card">
                    <CardContent className="p-4 flex gap-4">
                      <Thumbnail
                        imageDataUrl={meal.imageDataUrl}
                        imageUrl={meal.imageUrl}
                        alt={meal.title}
                        size="lg"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold truncate">{meal.title}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{meal.mealType}</Badge>
                          {meal.time && <Badge variant="secondary">{meal.time}</Badge>}
                        </div>

                        {meal.description && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                            {meal.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-3">
                          {typeof meal.calories === "number" && (
                            <Badge variant="outline">{meal.calories} cal</Badge>
                          )}
                          {typeof meal.protein === "number" && (
                            <Badge variant="outline">{meal.protein}g protein</Badge>
                          )}
                          {typeof meal.carbs === "number" && (
                            <Badge variant="outline">{meal.carbs}g carbs</Badge>
                          )}
                          {typeof meal.fat === "number" && (
                            <Badge variant="outline">{meal.fat}g fat</Badge>
                          )}
                        </div>

                        {meal.notes && (
                          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                            {meal.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditId(meal.id);
                              setAddOpen(true);
                            }}
                            className="aurora-btn-secondary rounded-lg"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMeal(meal.id)}
                            className="text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MealDrawer
        open={addOpen || !!editId}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
          setAddOpen(open);
        }}
        item={editId ? meals.find((m) => m.id === editId) ?? null : null}
        onSave={(data) => {
          if (editId) {
            updateMeal(editId, data);
            setEditId(null);
          } else {
            useStore.getState().addMeal(data);
          }
          setAddOpen(false);
        }}
      />
    </div>
  );
}
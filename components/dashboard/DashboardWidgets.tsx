"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Image, Target, BookOpen, Star, ShoppingCart, Sparkles, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/date";
import { isThisMonth } from "@/lib/date";
import { formatShort } from "@/lib/date";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { cn } from "@/lib/utils";

export function DashboardWidgets() {
  const tasks = useStore((s) => s.tasks);
  const visionTiles = useStore((s) => s.visionTiles);
  const visionGoals = useStore((s) => s.visionGoals);
  const books = useStore((s) => s.books);
  const reviews = useStore((s) => s.reviews);
  const purchaseItems = useStore((s) => s.purchaseItems);
  const fragrances = useStore((s) => s.fragrances);
  const packages = useStore((s) => s.packages);

  const todayTasks = tasks.filter((t) => t.dueDate === todayISO()).slice(0, 5);
  const todayTotal = todayTasks.length;
  const todayDone = todayTasks.filter((t) => t.status === "done").length;
  const taskProgress = todayTotal ? (todayDone / todayTotal) * 100 : 0;

  const boardImage = visionTiles[0];
  const activeGoals = visionGoals.filter((g) => g.status === "active").slice(0, 3);
  const reading = books.filter((b) => b.status === "reading").slice(0, 2);
  const latestReview = reviews.length ? reviews[reviews.length - 1] : null;
  const reviewBook = latestReview ? books.find((b) => b.id === latestReview.bookId) : null;
  const dueThisMonth = purchaseItems.filter(
    (p) => p.nextPurchaseAt && isThisMonth(p.nextPurchaseAt)
  ).slice(0, 5);
  const estTotal = dueThisMonth.reduce((sum, p) => sum + (p.estPrice ?? 0), 0);
  const toSample = fragrances.filter((f) => !f.sampled).slice(0, 3);
  const arriving = [...packages]
    .filter((p) => p.status !== "delivered" && p.expectedDeliveryDate)
    .sort((a, b) => (a.expectedDeliveryDate! > b.expectedDeliveryDate! ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {/* To-Do */}
      <Link href="/todo">
        <Card className="h-full aurora-card transition-colors hover:border-aurora-teal/30">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-aurora-teal" />
              To-Do
            </h3>
            <Progress value={taskProgress} className="w-20 h-1.5 progress-aurora rounded-full" />
          </CardHeader>
          <CardContent className="space-y-1.5">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks today</p>
            ) : (
              todayTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <span className={cn(t.status === "done" && "line-through text-muted-foreground")}>
                    {t.title}
                  </span>
                  <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Vision */}
      <Link href="/vision">
        <Card className="h-full transition-colors aurora-card hover:border-aurora-teal/30">
          <CardHeader className="pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Image className="h-4 w-4 text-aurora-teal" />
              Vision
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video rounded-lg border border-border bg-muted overflow-hidden">
              {boardImage?.imageDataUrl || boardImage?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={boardImage.imageDataUrl ?? boardImage.imageUrl}
                  alt="Vision board"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Set board image
                </div>
              )}
            </div>
            {activeGoals.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Active goals</p>
                {activeGoals.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 text-sm">
                    <span>{g.title}</span>
                    {g.progress != null && (
                      <Progress value={g.progress} className="flex-1 h-1.5 max-w-[60px] progress-aurora rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Reading */}
      <Link href="/reading">
        <Card className="h-full aurora-card transition-colors hover:border-aurora-teal/30">
          <CardHeader className="pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-aurora-teal" />
              Reading
            </h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {reading.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not reading anything</p>
            ) : (
              reading.map((b) => (
                <div key={b.id} className="flex gap-2 items-center">
                  <div className="w-8 h-11 rounded border border-border bg-muted overflow-hidden flex-shrink-0">
                    {b.imageDataUrl || b.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.imageDataUrl ?? b.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">—</div>
                    )}
                  </div>
                  <p className="text-sm truncate">
                    {b.title} <span className="text-muted-foreground">— {b.author}</span>
                  </p>
                </div>
              ))
            )}
            {reviewBook && latestReview && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-aurora-teal text-aurora-teal" /> Latest: {reviewBook.title} ({latestReview.rating}/5)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Purchases */}
      <Link href="/purchases">
        <Card className="h-full aurora-card transition-colors hover:border-aurora-teal/30">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-aurora-teal" />
              Purchases
            </h3>
            {dueThisMonth.length > 0 && (
              <span className="text-xs text-muted-foreground">Est. ${estTotal}</span>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {dueThisMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing due this month</p>
            ) : (
              dueThisMonth.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <Thumbnail imageDataUrl={p.imageDataUrl} imageUrl={p.imageUrl} alt={p.name} size="sm" />
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.estPrice != null && <span className="text-muted-foreground">${p.estPrice}</span>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Fragrances */}
      <Link href="/fragrances">
        <Card className="h-full aurora-card transition-colors hover:border-aurora-teal/30">
          <CardHeader className="pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-aurora-teal" />
              To sample next
            </h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {toSample.length === 0 ? (
              <p className="text-sm text-muted-foreground">All sampled or list empty</p>
            ) : (
              toSample.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <Thumbnail imageDataUrl={f.imageDataUrl} imageUrl={f.imageUrl} alt={f.name} size="sm" />
                  <span>{f.name}</span>
                  <span className="text-muted-foreground text-xs">{f.brand}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Packages */}
      <Link href="/packages">
        <Card className="h-full aurora-card transition-colors hover:border-aurora-teal/30">
          <CardHeader className="pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-aurora-teal" />
              Arriving soon
            </h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {arriving.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incoming packages</p>
            ) : (
              arriving.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <Thumbnail imageDataUrl={p.imageDataUrl} imageUrl={p.imageUrl} alt={p.itemName} size="sm" />
                  <span className="flex-1 truncate">{p.itemName}</span>
                  <span className="text-muted-foreground text-xs">{p.expectedDeliveryDate && formatShort(p.expectedDeliveryDate)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Plus, BookOpen, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Book, BookType, BookStatus } from "@/types/reading";
import { ReadingBookDrawer } from "@/components/forms/ReadingBookDrawer";
import { ReadingReviewDrawer } from "@/components/forms/ReadingReviewDrawer";

export default function ReadingPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"academic" | "nonacademic">("nonacademic");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagSearch, setTagSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editBookId, setEditBookId] = useState<string | null>(null);
  const [reviewBookId, setReviewBookId] = useState<string | null>(null);

  const books = useStore((s) => s.books);
  const reviews = useStore((s) => s.reviews);
  const addBook = useStore((s) => s.addBook);
  const updateBook = useStore((s) => s.updateBook);
  const deleteBook = useStore((s) => s.deleteBook);

  useEffect(() => {
    if (searchParams.get("add") === "1") setAddOpen(true);
  }, [searchParams]);

  const filtered = books
    .filter((b) => b.type === tab)
    .filter((b) => statusFilter === "all" || b.status === statusFilter)
    .filter((b) => !tagSearch || b.tags.some((t) => t.toLowerCase().includes(tagSearch.toLowerCase())));

  const handleMarkDone = (book: Book) => {
    setReviewBookId(book.id);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Reading"
        description="Books and reviews"
        action={
          <Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add book
          </Button>
        }
      />
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by tag..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="max-w-[220px] aurora-input rounded-xl h-11"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] aurora-input rounded-xl h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="want">Want</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as BookType)}>
        <TabsList className="aurora-tabs">
          <TabsTrigger value="nonacademic">Non-academic</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No books"
              description="Add a book to track."
              action={<Button onClick={() => setAddOpen(true)} className="aurora-btn rounded-xl">Add book</Button>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b) => {
                const review = reviews.find((r) => r.bookId === b.id);
                return (
                  <Card key={b.id} className="aurora-card overflow-hidden transition-all duration-200 hover:border-aurora-teal/30">
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-[140px] rounded-xl border border-border bg-muted overflow-hidden flex-shrink-0 shadow-inner">
                        {b.imageDataUrl || b.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.imageDataUrl ?? b.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardHeader className="p-0 flex flex-row items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold leading-tight">{b.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{b.author}</p>
                            {b.pages != null && <p className="text-xs text-muted-foreground mt-0.5">{b.pages} pp</p>}
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">{b.status}</Badge>
                        </CardHeader>
                        <CardContent className="p-0 pt-3 space-y-2">
                          {b.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {b.tags.map((t) => (
                                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          )}
                          {review && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-4 w-4 fill-aurora-teal text-aurora-teal" />
                              {review.rating}/5
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditBookId(b.id); setAddOpen(true); }} className="aurora-btn-secondary rounded-lg text-xs">
                              Edit
                            </Button>
                            {b.status === "reading" && (
                              <Button size="sm" onClick={() => handleMarkDone(b)} className="aurora-btn rounded-lg text-xs">
                                Mark done
                              </Button>
                            )}
                            {b.status === "reading" && (
                              <Button size="sm" variant="ghost" onClick={() => setReviewBookId(b.id)} className="rounded-lg text-xs">
                                Add review
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <ReadingBookDrawer
        open={addOpen || !!editBookId}
        onOpenChange={(open) => {
          if (!open) setEditBookId(null);
          setAddOpen(open);
        }}
        book={editBookId ? books.find((b) => b.id === editBookId) ?? null : null}
        onSave={(data) => {
          if (editBookId) {
            updateBook(editBookId, data);
            setEditBookId(null);
          } else {
            addBook(data);
          }
          setAddOpen(false);
        }}
      />
      <ReadingReviewDrawer
        open={!!reviewBookId}
        onOpenChange={(open) => !open && setReviewBookId(null)}
        book={reviewBookId ? books.find((b) => b.id === reviewBookId) ?? null : null}
        onSave={(data) => {
          useStore.getState().addReview(data);
          if (reviewBookId) useStore.getState().updateBook(reviewBookId, { status: "done" });
          setReviewBookId(null);
        }}
      />
    </div>
  );
}

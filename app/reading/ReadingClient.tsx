"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Plus, BookOpen, Star, CalendarDays } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Book, BookType, ReadingLog } from "@/types/reading";
import { ReadingBookDrawer } from "@/components/forms/ReadingBookDrawer";
import { ReadingReviewDrawer } from "@/components/forms/ReadingReviewDrawer";
import { ReadingLogDrawer } from "@/components/forms/ReadingLogDrawer";

export default function ReadingClient() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<BookType>("nonacademic");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagSearch, setTagSearch] = useState("");
  const [bookDrawerOpen, setBookDrawerOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [reviewBookId, setReviewBookId] = useState<string | null>(null);
  const [logBookId, setLogBookId] = useState<string | null>(null);

  const books = useStore((s) => s.books);
  const reviews = useStore((s) => s.reviews);
  const readingLogs = useStore((s) => s.readingLogs);

  const addBook = useStore((s) => s.addBook);
  const updateBook = useStore((s) => s.updateBook);
  const addReview = useStore((s) => s.addReview);
  const addReadingLog = useStore((s) => s.addReadingLog);
  const updateReadingLog = useStore((s) => s.updateReadingLog);
  const deleteReadingLog = useStore((s) => s.deleteReadingLog);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setBookDrawerOpen(true);
      setEditingBookId(null);
    }
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => book.type === tab)
      .filter((book) => statusFilter === "all" || book.status === statusFilter)
      .filter((book) => {
        if (!tagSearch.trim()) return true;
        const q = tagSearch.toLowerCase();
        return (
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
  }, [books, tab, statusFilter, tagSearch]);

  const getBookLogs = (bookId: string): ReadingLog[] =>
    readingLogs
      .filter((log) => log.bookId === bookId)
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.createdAt.localeCompare(a.createdAt);
      });

  const getLatestLog = (bookId: string): ReadingLog | undefined => getBookLogs(bookId)[0];

  const editingBook =
    editingBookId != null ? books.find((b) => b.id === editingBookId) ?? null : null;

  const reviewBook =
    reviewBookId != null ? books.find((b) => b.id === reviewBookId) ?? null : null;

  const logBook = logBookId != null ? books.find((b) => b.id === logBookId) ?? null : null;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Reading"
        description="Track books, reading progress, and reviews."
        action={
          <Button
            onClick={() => {
              setEditingBookId(null);
              setBookDrawerOpen(true);
            }}
            className="aurora-btn rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add book
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by title, author, or tag..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="max-w-[260px] aurora-input rounded-xl h-11"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] aurora-input rounded-xl h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="want">Want</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as BookType)}>
        <TabsList className="aurora-tabs">
          <TabsTrigger value="nonacademic">Non-academic</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-8">
          {filteredBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No books yet"
              description="Add a book to start tracking your reading."
              action={
                <Button
                  onClick={() => {
                    setEditingBookId(null);
                    setBookDrawerOpen(true);
                  }}
                  className="aurora-btn rounded-xl"
                >
                  Add book
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBooks.map((book) => {
                const review = reviews.find((r) => r.bookId === book.id);
                const latestLog = getLatestLog(book.id);
                const logCount = getBookLogs(book.id).length;

                return (
                  <Card
                    key={book.id}
                    className="aurora-card overflow-hidden transition-all duration-200 hover:border-aurora-teal/30 cursor-pointer"
                    onClick={() => setLogBookId(book.id)}
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-[140px] rounded-xl border border-border bg-muted overflow-hidden flex-shrink-0 shadow-inner">
                        {book.imageDataUrl || book.imageUrl ? (
                          <img
                            src={book.imageDataUrl ?? book.imageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No cover
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <CardHeader className="p-0 flex flex-row items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold leading-tight truncate">{book.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">
                              {book.author}
                            </p>
                            {book.pages != null && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {book.pages} pages
                              </p>
                            )}
                          </div>

                          <Badge variant="outline" className="text-xs shrink-0">
                            {book.status}
                          </Badge>
                        </CardHeader>

                        <CardContent className="p-0 pt-3 space-y-3">
                          {book.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {book.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {review && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-4 w-4 fill-current" />
                              {review.rating}/5
                            </div>
                          )}

                          {latestLog ? (
                            <div className="rounded-xl border border-border/60 bg-background/40 p-3 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Last read: {latestLog.date}
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {latestLog.chapter && <span>{latestLog.chapter}</span>}
                                {latestLog.chapter && latestLog.upToPage != null && <span> • </span>}
                                {latestLog.upToPage != null && <span>up to p. {latestLog.upToPage}</span>}
                                {!latestLog.chapter &&
                                  latestLog.upToPage == null &&
                                  latestLog.pagesRead != null && (
                                    <span>{latestLog.pagesRead} pages read</span>
                                  )}
                              </div>

                              <div className="text-[11px] text-muted-foreground">
                                {logCount} log{logCount === 1 ? "" : "s"}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                              No reading entries yet. Click to log progress.
                            </div>
                          )}

                          <div
                            className="flex flex-wrap gap-2 pt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="aurora-btn-secondary rounded-lg text-xs"
                              onClick={() => {
                                setEditingBookId(book.id);
                                setBookDrawerOpen(true);
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="aurora-btn-secondary rounded-lg text-xs"
                              onClick={() => setLogBookId(book.id)}
                            >
                              Log entry
                            </Button>

                            {book.status !== "done" && (
                              <Button
                                size="sm"
                                className="aurora-btn rounded-lg text-xs"
                                onClick={() => updateBook(book.id, { status: "done" })}
                              >
                                Mark done
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-lg text-xs"
                              onClick={() => setReviewBookId(book.id)}
                            >
                              Add review
                            </Button>
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
        open={bookDrawerOpen}
        onOpenChange={(open) => {
          setBookDrawerOpen(open);
          if (!open) setEditingBookId(null);
        }}
        book={editingBook}
        onSave={(data) => {
          if (editingBookId) {
            updateBook(editingBookId, data);
          } else {
            addBook(data);
          }

          setBookDrawerOpen(false);
          setEditingBookId(null);
        }}
      />

      <ReadingReviewDrawer
        open={!!reviewBookId}
        onOpenChange={(open) => {
          if (!open) setReviewBookId(null);
        }}
        book={reviewBook}
        onSave={(data) => {
          addReview(data);
          if (data.bookId) {
            updateBook(data.bookId, { status: "done" });
          }
          setReviewBookId(null);
        }}
      />

      <ReadingLogDrawer
        open={!!logBookId}
        onOpenChange={(open) => {
          if (!open) setLogBookId(null);
        }}
        book={logBook}
        logs={logBook ? getBookLogs(logBook.id) : []}
        onSave={(data) => {
          addReadingLog(data);
        }}
        onUpdate={(logId, data) => {
          updateReadingLog(logId, data);
        }}
        onDelete={(logId) => {
          deleteReadingLog(logId);
        }}
      />
    </div>
  );
}
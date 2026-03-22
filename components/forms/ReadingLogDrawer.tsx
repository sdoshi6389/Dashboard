"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import type { Book, ReadingLog } from "@/types/reading";

interface ReadingLogDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  logs: ReadingLog[];
  onSave: (data: Omit<ReadingLog, "id" | "createdAt">) => void;
  onUpdate: (logId: string, data: Partial<Omit<ReadingLog, "id" | "createdAt" | "bookId">>) => void;
  onDelete: (logId: string) => void;
}

export function ReadingLogDrawer({
  open,
  onOpenChange,
  book,
  logs,
  onSave,
  onUpdate,
  onDelete,
}: ReadingLogDrawerProps) {
  const [date, setDate] = useState("");
  const [chapter, setChapter] = useState("");
  const [pagesRead, setPagesRead] = useState("");
  const [upToPage, setUpToPage] = useState("");
  const [notes, setNotes] = useState("");

  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editChapter, setEditChapter] = useState("");
  const [editPagesRead, setEditPagesRead] = useState("");
  const [editUpToPage, setEditUpToPage] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setDate(new Date().toISOString().slice(0, 10));
    setChapter("");
    setPagesRead("");
    setUpToPage("");
    setNotes("");
    setEditingLogId(null);
    setEditDate("");
    setEditChapter("");
    setEditPagesRead("");
    setEditUpToPage("");
    setEditNotes("");
  }, [open]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [logs]);

  const resetCreateForm = () => {
    setChapter("");
    setPagesRead("");
    setUpToPage("");
    setNotes("");
  };

  const startEditing = (log: ReadingLog) => {
    setEditingLogId(log.id);
    setEditDate(log.date);
    setEditChapter(log.chapter ?? "");
    setEditPagesRead(log.pagesRead != null ? String(log.pagesRead) : "");
    setEditUpToPage(log.upToPage != null ? String(log.upToPage) : "");
    setEditNotes(log.notes ?? "");
  };

  const cancelEditing = () => {
    setEditingLogId(null);
    setEditDate("");
    setEditChapter("");
    setEditPagesRead("");
    setEditUpToPage("");
    setEditNotes("");
  };

  const handleSave = () => {
    if (!book || !date) return;

    onSave({
      bookId: book.id,
      date,
      chapter: chapter.trim() || undefined,
      pagesRead: pagesRead.trim() ? Number(pagesRead) : undefined,
      upToPage: upToPage.trim() ? Number(upToPage) : undefined,
      notes: notes.trim() || undefined,
    });

    resetCreateForm();
  };

  const handleUpdate = () => {
    if (!editingLogId || !editDate) return;

    onUpdate(editingLogId, {
      date: editDate,
      chapter: editChapter.trim() || undefined,
      pagesRead: editPagesRead.trim() ? Number(editPagesRead) : undefined,
      upToPage: editUpToPage.trim() ? Number(editUpToPage) : undefined,
      notes: editNotes.trim() || undefined,
    });

    cancelEditing();
  };

  if (!book) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="aurora-drawer">
        <DrawerHeader>
          <DrawerTitle>{book.title} reading log</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-4 rounded-2xl border border-border/60 p-4 bg-background/40">
            <div>
              <p className="font-semibold">Add reading entry</p>
              <p className="text-sm text-muted-foreground mt-1">
                Log what you read on a specific date.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 aurora-input rounded-xl"
                />
              </div>

              <div>
                <Label>Chapter read</Label>
                <Input
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Chapter 4"
                  className="mt-1 aurora-input rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Pages read</Label>
                <Input
                  type="number"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(e.target.value)}
                  placeholder="20"
                  className="mt-1 aurora-input rounded-xl"
                />
              </div>

              <div>
                <Label>Up to page</Label>
                <Input
                  type="number"
                  value={upToPage}
                  onChange={(e) => setUpToPage(e.target.value)}
                  placeholder="128"
                  className="mt-1 aurora-input rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What you read, thoughts, key ideas, anything important"
                className="mt-1 aurora-input rounded-xl min-h-[100px]"
              />
            </div>

            <Button onClick={handleSave} className="aurora-btn rounded-xl">
              Log reading entry
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-semibold">Reading history</p>
              <p className="text-sm text-muted-foreground">
                Full log by date for this book.
              </p>
            </div>

            {sortedLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No reading entries yet.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedLogs.map((log) => {
                  const isEditing = editingLogId === log.id;

                  return (
                    <Card key={log.id} className="aurora-card">
                      <CardContent className="p-4 space-y-3">
                        {isEditing ? (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="mt-1 aurora-input rounded-xl"
                                />
                              </div>

                              <div>
                                <Label>Chapter read</Label>
                                <Input
                                  value={editChapter}
                                  onChange={(e) => setEditChapter(e.target.value)}
                                  placeholder="Chapter 4"
                                  className="mt-1 aurora-input rounded-xl"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Pages read</Label>
                                <Input
                                  type="number"
                                  value={editPagesRead}
                                  onChange={(e) => setEditPagesRead(e.target.value)}
                                  placeholder="20"
                                  className="mt-1 aurora-input rounded-xl"
                                />
                              </div>

                              <div>
                                <Label>Up to page</Label>
                                <Input
                                  type="number"
                                  value={editUpToPage}
                                  onChange={(e) => setEditUpToPage(e.target.value)}
                                  placeholder="128"
                                  className="mt-1 aurora-input rounded-xl"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Notes</Label>
                              <Textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Update notes"
                                className="mt-1 aurora-input rounded-xl min-h-[100px]"
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button onClick={handleUpdate} className="aurora-btn rounded-lg text-xs">
                                Save changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={cancelEditing}
                                className="aurora-btn-secondary rounded-lg text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">{log.date}</p>

                              <div className="flex flex-wrap gap-2 text-xs">
                                {log.chapter && (
                                  <span className="rounded-full border px-2 py-1 text-muted-foreground">
                                    {log.chapter}
                                  </span>
                                )}
                                {log.pagesRead != null && (
                                  <span className="rounded-full border px-2 py-1 text-muted-foreground">
                                    {log.pagesRead} pages
                                  </span>
                                )}
                                {log.upToPage != null && (
                                  <span className="rounded-full border px-2 py-1 text-muted-foreground">
                                    up to p. {log.upToPage}
                                  </span>
                                )}
                              </div>
                            </div>

                            {log.notes && (
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {log.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(log)}
                                className="aurora-btn-secondary rounded-lg text-xs"
                              >
                                Edit log
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(log.id)}
                                className="rounded-lg text-xs"
                              >
                                Delete log
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="aurora-btn-secondary rounded-xl">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePicker } from "@/components/shared/ImagePicker";
import type { Book, BookType, BookStatus } from "@/types/reading";
import { useState, useEffect } from "react";

interface ReadingBookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  onSave: (data: Omit<Book, "id" | "createdAt" | "updatedAt">) => void;
}

export function ReadingBookDrawer({ open, onOpenChange, book, onSave }: ReadingBookDrawerProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState<BookType>("nonacademic");
  const [status, setStatus] = useState<BookStatus>("want");
  const [pages, setPages] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [link, setLink] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setType(book.type);
      setStatus(book.status);
      setPages(book.pages?.toString() ?? "");
      setTagsStr(book.tags.join(", "));
      setLink(book.link ?? "");
      setImageDataUrl(book.imageDataUrl);
      setImageUrl(book.imageUrl);
    } else {
      setTitle("");
      setAuthor("");
      setType("nonacademic");
      setStatus("want");
      setPages("");
      setTagsStr("");
      setLink("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
    }
  }, [book, open]);

  const handleSave = () => {
    const t = title.trim();
    const a = author.trim();
    if (!t || !a) return;
    onSave({
      title: t,
      author: a,
      type,
      status,
      pages: pages ? parseInt(pages, 10) : undefined,
      tags: tagsStr ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      link: link.trim() || undefined,
      imageDataUrl,
      imageUrl,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="aurora-drawer">
        <DrawerHeader>
          <DrawerTitle>{book ? "Edit book" : "Add book"}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
            label="Cover photo"
          />
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" className="mt-1 aurora-input rounded-xl" />
          </div>
          <div>
            <Label>Author</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="mt-1 aurora-input rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as BookType)}>
                <SelectTrigger className="mt-1 aurora-input rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nonacademic">Non-academic</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BookStatus)}>
                <SelectTrigger className="mt-1 aurora-input rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want">Want</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Pages (optional)</Label>
            <Input type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="280" className="mt-1 aurora-input rounded-xl" />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="productivity, habits" className="mt-1 aurora-input rounded-xl" />
          </div>
          <div>
            <Label>Link (optional)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1 aurora-input rounded-xl" />
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="aurora-btn-secondary rounded-xl">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSave} className="aurora-btn rounded-xl">Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePicker } from "@/components/shared/ImagePicker";
import type { Fragrance, FragranceSeason } from "@/types/fragrances";
import { useState, useEffect } from "react";

const SEASONS: FragranceSeason[] = ["spring", "summer", "fall", "winter", "all"];

interface FragranceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fragrance: Fragrance | null;
  onSave: (data: Omit<Fragrance, "id">) => void;
  mode?: "form" | "detail";
  onEditClick?: () => void;
}

export function FragranceDrawer({ open, onOpenChange, fragrance, onSave, mode = "form", onEditClick }: FragranceDrawerProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [notesTopStr, setNotesTopStr] = useState("");
  const [notesMidStr, setNotesMidStr] = useState("");
  const [notesBaseStr, setNotesBaseStr] = useState("");
  const [season, setSeason] = useState<FragranceSeason>("all");
  const [vibeStr, setVibeStr] = useState("");
  const [longevity, setLongevity] = useState(3);
  const [projection, setProjection] = useState(3);
  const [priceRange, setPriceRange] = useState("");
  const [link, setLink] = useState("");
  const [sampled, setSampled] = useState(false);
  const [wouldBuy, setWouldBuy] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (fragrance) {
      setName(fragrance.name);
      setBrand(fragrance.brand);
      setNotesTopStr(fragrance.notesTop.join(", "));
      setNotesMidStr(fragrance.notesMid.join(", "));
      setNotesBaseStr(fragrance.notesBase.join(", "));
      setSeason(fragrance.season);
      setVibeStr(fragrance.vibeTags.join(", "));
      setLongevity(fragrance.longevity);
      setProjection(fragrance.projection);
      setPriceRange(fragrance.priceRange ?? "");
      setLink(fragrance.link ?? "");
      setSampled(fragrance.sampled);
      setWouldBuy(fragrance.wouldBuy);
      setPersonalNotes(fragrance.personalNotes ?? "");
      setImageDataUrl(fragrance.imageDataUrl);
      setImageUrl(fragrance.imageUrl);
    } else {
      setName("");
      setBrand("");
      setNotesTopStr("");
      setNotesMidStr("");
      setNotesBaseStr("");
      setSeason("all");
      setVibeStr("");
      setLongevity(3);
      setProjection(3);
      setPriceRange("");
      setLink("");
      setSampled(false);
      setWouldBuy(false);
      setPersonalNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
    }
  }, [fragrance, open]);

  const handleSave = () => {
    const n = name.trim();
    const b = brand.trim();
    if (!n || !b) return;
    onSave({
      name: n,
      brand: b,
      notesTop: notesTopStr ? notesTopStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      notesMid: notesMidStr ? notesMidStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      notesBase: notesBaseStr ? notesBaseStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      season,
      vibeTags: vibeStr ? vibeStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      longevity,
      projection,
      priceRange: priceRange.trim() || undefined,
      link: link.trim() || undefined,
      sampled,
      wouldBuy,
      personalNotes: personalNotes.trim() || undefined,
      imageDataUrl,
      imageUrl,
    });
    onOpenChange(false);
  };

  const isDetail = mode === "detail" && fragrance;

  if (isDetail) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{fragrance.name}</DrawerTitle>
            <p className="text-sm text-muted-foreground">{fragrance.brand}</p>
          </DrawerHeader>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg border border-border bg-muted overflow-hidden shrink-0">
                {fragrance.imageDataUrl || fragrance.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fragrance.imageDataUrl ?? fragrance.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                )}
              </div>
              <div>
                <p><strong>Season:</strong> {fragrance.season}</p>
                <p><strong>Longevity:</strong> {fragrance.longevity}/5</p>
                <p><strong>Projection:</strong> {fragrance.projection}/5</p>
                {fragrance.priceRange && <p><strong>Price:</strong> {fragrance.priceRange}</p>}
                <p>Sampled: {fragrance.sampled ? "Yes" : "No"} · Would buy: {fragrance.wouldBuy ? "Yes" : "No"}</p>
              </div>
            </div>
            {fragrance.notesTop.length > 0 && <p><strong>Top:</strong> {fragrance.notesTop.join(", ")}</p>}
            {fragrance.notesMid.length > 0 && <p><strong>Mid:</strong> {fragrance.notesMid.join(", ")}</p>}
            {fragrance.notesBase.length > 0 && <p><strong>Base:</strong> {fragrance.notesBase.join(", ")}</p>}
            {fragrance.vibeTags.length > 0 && <p><strong>Vibe:</strong> {fragrance.vibeTags.join(", ")}</p>}
            {fragrance.personalNotes && <p className="text-sm text-muted-foreground">{fragrance.personalNotes}</p>}
            {fragrance.link && (
              <Button asChild size="sm" variant="outline">
                <a href={fragrance.link} target="_blank" rel="noopener noreferrer">Open link</a>
              </Button>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
            <Button onClick={onEditClick}>Edit</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{fragrance ? "Edit fragrance" : "Add fragrance"}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <ImagePicker value={{ imageDataUrl, imageUrl }} onChange={({ imageDataUrl: d, imageUrl: u }) => { setImageDataUrl(d); setImageUrl(u); }} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fragrance name" className="mt-1" />
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Top notes (comma separated)</Label>
            <Input value={notesTopStr} onChange={(e) => setNotesTopStr(e.target.value)} placeholder="Citrus, Bergamot" className="mt-1" />
          </div>
          <div>
            <Label>Mid notes (comma separated)</Label>
            <Input value={notesMidStr} onChange={(e) => setNotesMidStr(e.target.value)} placeholder="Lavender, Jasmine" className="mt-1" />
          </div>
          <div>
            <Label>Base notes (comma separated)</Label>
            <Input value={notesBaseStr} onChange={(e) => setNotesBaseStr(e.target.value)} placeholder="Sandalwood, Musk" className="mt-1" />
          </div>
          <div>
            <Label>Season</Label>
            <Select value={season} onValueChange={(v) => setSeason(v as FragranceSeason)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vibe tags (comma separated)</Label>
            <Input value={vibeStr} onChange={(e) => setVibeStr(e.target.value)} placeholder="fresh, minimal" className="mt-1" />
          </div>
          <div>
            <Label>Longevity (1-5)</Label>
            <Slider value={longevity} onChange={setLongevity} min={1} max={5} step={1} className="mt-1" />
          </div>
          <div>
            <Label>Projection (1-5)</Label>
            <Slider value={projection} onChange={setProjection} min={1} max={5} step={1} className="mt-1" />
          </div>
          <div>
            <Label>Price range (optional)</Label>
            <Input value={priceRange} onChange={(e) => setPriceRange(e.target.value)} placeholder="e.g. $50-80" className="mt-1" />
          </div>
          <div>
            <Label>Link (optional)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sampled} onChange={(e) => setSampled(e.target.checked)} className="rounded border-input" />
              <span className="text-sm">Sampled</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={wouldBuy} onChange={(e) => setWouldBuy(e.target.checked)} className="rounded border-input" />
              <span className="text-sm">Would buy</span>
            </label>
          </div>
          <div>
            <Label>Personal notes</Label>
            <Textarea value={personalNotes} onChange={(e) => setPersonalNotes(e.target.value)} placeholder="Optional" className="mt-1" />
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

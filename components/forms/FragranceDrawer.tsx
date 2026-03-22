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
import { ImagePicker } from "@/components/shared/ImagePicker";
import type { Fragrance, FragranceSeason } from "@/types/fragrances";
import { useState, useEffect } from "react";

const SEASONS: FragranceSeason[] = ["spring", "summer", "fall", "winter"];

function getInitialSeasons(fragrance: Fragrance | null): FragranceSeason[] {
  if (!fragrance) return [];
  if (Array.isArray(fragrance.seasons) && fragrance.seasons.length > 0) return fragrance.seasons;
  if (fragrance.season) return [fragrance.season];
  return [];
}

interface FragranceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fragrance: Fragrance | null;
  onSave: (data: Omit<Fragrance, "id">) => void;
  mode?: "form" | "detail";
  onEditClick?: () => void;
}

export function FragranceDrawer({
  open,
  onOpenChange,
  fragrance,
  onSave,
  mode = "form",
  onEditClick,
}: FragranceDrawerProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [notesTopStr, setNotesTopStr] = useState("");
  const [notesMidStr, setNotesMidStr] = useState("");
  const [notesBaseStr, setNotesBaseStr] = useState("");
  const [seasons, setSeasons] = useState<FragranceSeason[]>([]);
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
      setSeasons(getInitialSeasons(fragrance));
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
      setSeasons([]);
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

  const toggleSeason = (season: FragranceSeason) => {
    setSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );
  };

  const handleSave = () => {
    const n = name.trim();
    const b = brand.trim();
    if (!n || !b) return;

    onSave({
      name: n,
      brand: b,
      notesTop: notesTopStr
        ? notesTopStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      notesMid: notesMidStr
        ? notesMidStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      notesBase: notesBaseStr
        ? notesBaseStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      seasons,
      season: seasons[0],
      vibeTags: vibeStr
        ? vibeStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      longevity: Number(longevity.toFixed(1)),
      projection: Number(projection.toFixed(1)),
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
  const detailSeasons = fragrance ? getInitialSeasons(fragrance) : [];

  if (isDetail) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{fragrance.name}</DrawerTitle>
            <p className="text-sm text-muted-foreground">{fragrance.brand}</p>
          </DrawerHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {fragrance.imageDataUrl || fragrance.imageUrl ? (
                  <img
                    src={fragrance.imageDataUrl ?? fragrance.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    —
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p>
                  <strong>Seasons:</strong>{" "}
                  {detailSeasons.length > 0 ? detailSeasons.join(", ") : "—"}
                </p>
                <p>
                  <strong>Longevity:</strong> {fragrance.longevity.toFixed(1)}/5
                </p>
                <p>
                  <strong>Projection:</strong> {fragrance.projection.toFixed(1)}/5
                </p>
                {fragrance.priceRange && (
                  <p>
                    <strong>Price:</strong> {fragrance.priceRange}
                  </p>
                )}
                <p>
                  Sampled: {fragrance.sampled ? "Yes" : "No"} · Would buy:{" "}
                  {fragrance.wouldBuy ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {fragrance.notesTop.length > 0 && (
              <p>
                <strong>Top:</strong> {fragrance.notesTop.join(", ")}
              </p>
            )}
            {fragrance.notesMid.length > 0 && (
              <p>
                <strong>Mid:</strong> {fragrance.notesMid.join(", ")}
              </p>
            )}
            {fragrance.notesBase.length > 0 && (
              <p>
                <strong>Base:</strong> {fragrance.notesBase.join(", ")}
              </p>
            )}
            {fragrance.vibeTags.length > 0 && (
              <p>
                <strong>Vibe:</strong> {fragrance.vibeTags.join(", ")}
              </p>
            )}
            {fragrance.personalNotes && (
              <p className="text-sm text-muted-foreground">{fragrance.personalNotes}</p>
            )}
            {fragrance.link && (
              <Button asChild size="sm" variant="outline">
                <a href={fragrance.link} target="_blank" rel="noopener noreferrer">
                  Open link
                </a>
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

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fragrance name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Top notes (comma separated)</Label>
            <Input
              value={notesTopStr}
              onChange={(e) => setNotesTopStr(e.target.value)}
              placeholder="Citrus, Bergamot"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Mid notes (comma separated)</Label>
            <Input
              value={notesMidStr}
              onChange={(e) => setNotesMidStr(e.target.value)}
              placeholder="Lavender, Jasmine"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Base notes (comma separated)</Label>
            <Input
              value={notesBaseStr}
              onChange={(e) => setNotesBaseStr(e.target.value)}
              placeholder="Sandalwood, Musk"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Seasons</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SEASONS.map((season) => {
                const selected = seasons.includes(season);
                return (
                  <button
                    key={season}
                    type="button"
                    onClick={() => toggleSeason(season)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground"
                    }`}
                  >
                    {season}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              You can select more than one season.
            </p>
          </div>

          <div>
            <Label>Vibe tags (comma separated)</Label>
            <Input
              value={vibeStr}
              onChange={(e) => setVibeStr(e.target.value)}
              placeholder="fresh, minimal"
              className="mt-1"
            />
          </div>

          <Slider
            value={longevity}
            onChange={(value: number) => setLongevity(value)}
            min={1}
            max={5}
            step={0.1}
            className="mt-3"
          />

          <Slider
            value={projection}
            onChange={(value: number) => setProjection(value)}
            min={1}
            max={5}
            step={0.1}
            className="mt-3"
          />

          <div>
            <Label>Price range (optional)</Label>
            <Input
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              placeholder="e.g. $50-80"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Link (optional)</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sampled}
                onChange={(e) => setSampled(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Sampled</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wouldBuy}
                onChange={(e) => setWouldBuy(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Would buy</span>
            </label>
          </div>

          <div>
            <Label>Personal notes</Label>
            <Textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Optional"
              className="mt-1"
            />
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
export type FragranceSeason = "spring" | "summer" | "fall" | "winter" | "all";

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  notesTop: string[];
  notesMid: string[];
  notesBase: string[];
  season: FragranceSeason;
  vibeTags: string[];
  longevity: number; // 1-5
  projection: number; // 1-5
  priceRange?: string;
  link?: string;
  sampled: boolean;
  wouldBuy: boolean;
  personalNotes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
}

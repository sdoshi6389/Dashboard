export type FragranceSeason = "spring" | "summer" | "fall" | "winter";

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  notesTop: string[];
  notesMid: string[];
  notesBase: string[];
  seasons: FragranceSeason[];
  season?: FragranceSeason;
  vibeTags: string[];
  longevity: number; // 1.0 - 5.0
  projection: number; // 1.0 - 5.0
  priceRange?: string;
  link?: string;
  sampled: boolean;
  wouldBuy: boolean;
  personalNotes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
}
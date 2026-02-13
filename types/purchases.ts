export type PurchaseRecurrence = "none" | "monthly";

export interface PurchaseItem {
  id: string;
  name: string;
  category: string;
  estPrice?: number;
  recurrence: PurchaseRecurrence;
  lastPurchasedAt?: string; // ISO date
  nextPurchaseAt?: string; // ISO date
  link?: string;
  priority: number;
  notes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
}

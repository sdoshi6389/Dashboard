export type PackageStatus = "ordered" | "shipped" | "delivered";

export interface Package {
  id: string;
  itemName: string;
  carrier?: string;
  trackingNumber?: string;
  orderDate?: string; // ISO date
  expectedDeliveryDate?: string; // ISO date
  status: PackageStatus;
  link?: string;
  notes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
}

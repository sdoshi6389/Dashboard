export type TravelStatus = "future" | "progress" | "completed";

export type TravelPlanItemType =
  | "flight"
  | "hotel"
  | "food"
  | "activity"
  | "transport"
  | "note";

export interface TravelPlanItem {
  id: string;
  time: string;
  title: string;
  details?: string;
  location?: string;
  type: TravelPlanItemType;
}

export interface TravelDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
  items: TravelPlanItem[];
}

export interface TravelTrip {
  id: string;
  title: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TravelStatus;
  tags: string[];
  imageDataUrl?: string;
  imageUrl?: string;
  days: TravelDay[];
}
export type VisionCategory =
  | "Fitness"
  | "Career"
  | "Relationships"
  | "Money"
  | "Creativity"
  | "Other";

export interface VisionTile {
  id: string;
  title: string;
  category: VisionCategory;
  imageDataUrl?: string;
  notes?: string;
  createdAt: string;
}

export type VisionGoalStatus = "active" | "achieved" | "paused";

export interface VisionGoal {
  id: string;
  title: string;
  category: VisionCategory;
  why?: string;
  targetDate?: string; // ISO date
  status: VisionGoalStatus;
  progress?: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

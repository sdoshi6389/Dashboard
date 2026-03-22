export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: string;
  title: string;
  date: string; // ISO date
  mealType: MealType;
  time?: string; // "08:30"
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
}
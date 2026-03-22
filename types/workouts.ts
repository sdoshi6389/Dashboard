export type WorkoutType =
  | "abs"
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full-body"
  | "cardio"
  | "mobility"
  | "custom";

export type WorkoutDifficulty = "easy" | "medium" | "hard";

export type WorkoutDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface WorkoutExercise {
  id: string;
  name: string;
  reps?: string;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  workoutType: WorkoutType;
  targetMuscles: string[];
  day?: WorkoutDay;
  durationMinutes?: number;
  difficulty?: WorkoutDifficulty;
  notes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  exercises: WorkoutExercise[];
}
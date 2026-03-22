import type { FullState } from "@/types/state";

const STORAGE_KEY = "doshi-dashboard-state";
const SCHEMA_VERSION = 2;

export interface PersistedState extends FullState {
  version: number;
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (typeof parsed.version !== "number") return null;
    if (parsed.version !== SCHEMA_VERSION) return null;

    return {
      version: SCHEMA_VERSION,
      tasks: parsed.tasks ?? [],
      visionTiles: parsed.visionTiles ?? [],
      visionGoals: parsed.visionGoals ?? [],
      books: parsed.books ?? [],
      reviews: parsed.reviews ?? [],
      readingLogs: parsed.readingLogs ?? [],
      purchaseItems: parsed.purchaseItems ?? [],
      fragrances: parsed.fragrances ?? [],
      packages: parsed.packages ?? [],
      meals: parsed.meals ?? [],
      workouts: parsed.workouts ?? [],
      routines: parsed.routines ?? [],
      trips: parsed.trips ?? [],
    };
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;

  try {
    const toSave: PersistedState = {
      version: SCHEMA_VERSION,
      tasks: state.tasks ?? [],
      visionTiles: state.visionTiles ?? [],
      visionGoals: state.visionGoals ?? [],
      books: state.books ?? [],
      reviews: state.reviews ?? [],
      readingLogs: state.readingLogs ?? [],
      purchaseItems: state.purchaseItems ?? [],
      fragrances: state.fragrances ?? [],
      packages: state.packages ?? [],
      meals: state.meals ?? [],
      workouts: state.workouts ?? [],
      routines: state.routines ?? [],
      trips: state.trips ?? [],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function exportJSON(state: PersistedState): string {
  return JSON.stringify(
    {
      version: SCHEMA_VERSION,
      tasks: state.tasks ?? [],
      visionTiles: state.visionTiles ?? [],
      visionGoals: state.visionGoals ?? [],
      books: state.books ?? [],
      reviews: state.reviews ?? [],
      readingLogs: state.readingLogs ?? [],
      purchaseItems: state.purchaseItems ?? [],
      fragrances: state.fragrances ?? [],
      packages: state.packages ?? [],
      meals: state.meals ?? [],
      workouts: state.workouts ?? [],
      routines: state.routines ?? [],
      trips: state.trips ?? [],
    },
    null,
    2
  );
}

export function importJSON(json: string): PersistedState | null {
  try {
    const parsed = JSON.parse(json) as Partial<PersistedState>;
    if (!parsed || typeof parsed.version !== "number") return null;
    if (parsed.version !== SCHEMA_VERSION) return null;

    return {
      version: SCHEMA_VERSION,
      tasks: parsed.tasks ?? [],
      visionTiles: parsed.visionTiles ?? [],
      visionGoals: parsed.visionGoals ?? [],
      books: parsed.books ?? [],
      reviews: parsed.reviews ?? [],
      readingLogs: parsed.readingLogs ?? [],
      purchaseItems: parsed.purchaseItems ?? [],
      fragrances: parsed.fragrances ?? [],
      packages: parsed.packages ?? [],
      meals: parsed.meals ?? [],
      workouts: parsed.workouts ?? [],
      routines: parsed.routines ?? [],
      trips: parsed.trips ?? [],
    };
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
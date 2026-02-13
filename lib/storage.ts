const STORAGE_KEY = "doshi-dashboard-state";
const SCHEMA_VERSION = 1;

export interface PersistedState {
  version: number;
  tasks: import("@/types").Task[];
  visionTiles: import("@/types").VisionTile[];
  visionGoals: import("@/types").VisionGoal[];
  books: import("@/types").Book[];
  reviews: import("@/types").Review[];
  purchaseItems: import("@/types").PurchaseItem[];
  fragrances: import("@/types").Fragrance[];
  packages: import("@/types").Package[];
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    const toSave = { ...state, version: SCHEMA_VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function exportJSON(state: PersistedState): string {
  return JSON.stringify({ ...state, version: SCHEMA_VERSION }, null, 2);
}

export function importJSON(json: string): PersistedState | null {
  try {
    const parsed = JSON.parse(json) as PersistedState;
    if (!parsed || typeof parsed.version !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

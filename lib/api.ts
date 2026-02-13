import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance } from "@/types/fragrances";
import type { Package } from "@/types/packages";
import type { FullState } from "@/types/state";

const BASE = "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function patchReq(path: string, id: string, body: unknown): Promise<void> {
  const res = await fetch(`${BASE}/api${path}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}
async function del(path: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/api${path}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export const api = {
  getFullState: () => get<FullState>("/data"),

  postData: (action: "reset" | "clear" | "import", state?: FullState) =>
    post<FullState>("/data", { action, state }),

  tasks: {
    create: (task: Task) => post<Task>("/tasks", task),
    update: (id: string, updates: Partial<Task>) => patchReq("/tasks", id, updates),
    delete: (id: string) => del("/tasks", id),
  },
  visionTiles: {
    create: (tile: VisionTile) => post<VisionTile>("/vision-tiles", tile),
    update: (id: string, updates: Partial<VisionTile>) => patchReq("/vision-tiles", id, updates),
    delete: (id: string) => del("/vision-tiles", id),
  },
  visionGoals: {
    create: (goal: VisionGoal) => post<VisionGoal>("/vision-goals", goal),
    update: (id: string, updates: Partial<VisionGoal>) => patchReq("/vision-goals", id, updates),
    delete: (id: string) => del("/vision-goals", id),
  },
  books: {
    create: (book: Book) => post<Book>("/books", book),
    update: (id: string, updates: Partial<Book>) => patchReq("/books", id, updates),
    delete: (id: string) => del("/books", id),
  },
  reviews: {
    create: (review: Review) => post<Review>("/reviews", review),
    update: (id: string, updates: Partial<Review>) => patchReq("/reviews", id, updates),
    delete: (id: string) => del("/reviews", id),
  },
  purchases: {
    create: (item: PurchaseItem) => post<PurchaseItem>("/purchases", item),
    update: (id: string, updates: Partial<PurchaseItem>) => patchReq("/purchases", id, updates),
    delete: (id: string) => del("/purchases", id),
  },
  fragrances: {
    create: (f: Fragrance) => post<Fragrance>("/fragrances", f),
    update: (id: string, updates: Partial<Fragrance>) => patchReq("/fragrances", id, updates),
    delete: (id: string) => del("/fragrances", id),
  },
  packages: {
    create: (p: Package) => post<Package>("/packages", p),
    update: (id: string, updates: Partial<Package>) => patchReq("/packages", id, updates),
    delete: (id: string) => del("/packages", id),
  },
};

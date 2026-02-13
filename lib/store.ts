import { create } from "zustand";
import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance } from "@/types/fragrances";
import type { Package } from "@/types/packages";
import type { FullState } from "@/types/state";
import { api } from "./api";
import { uid } from "./utils";
import { addMonths, toISODate } from "./date";

export interface AppState extends FullState {
  _hydrated: boolean;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => void;
  resetToDemo: () => Promise<void>;
  clearAll: () => Promise<void>;
  importState: (state: FullState) => Promise<void>;

  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: Task["status"]) => void;

  addTile: (tile: Omit<VisionTile, "id" | "createdAt">) => void;
  updateTile: (id: string, patch: Partial<VisionTile>) => void;
  deleteTile: (id: string) => void;
  addGoal: (goal: Omit<VisionGoal, "id" | "createdAt" | "updatedAt">) => void;
  updateGoal: (id: string, patch: Partial<VisionGoal>) => void;
  deleteGoal: (id: string) => void;

  addBook: (book: Omit<Book, "id" | "createdAt" | "updatedAt">) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  updateReview: (id: string, patch: Partial<Review>) => void;
  deleteReview: (id: string) => void;

  addPurchase: (item: Omit<PurchaseItem, "id">) => void;
  updatePurchase: (id: string, patch: Partial<PurchaseItem>) => void;
  deletePurchase: (id: string) => void;
  markPurchased: (id: string) => void;

  addFragrance: (f: Omit<Fragrance, "id">) => void;
  updateFragrance: (id: string, patch: Partial<Fragrance>) => void;
  deleteFragrance: (id: string) => void;

  addPackage: (p: Omit<Package, "id">) => void;
  updatePackage: (id: string, patch: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  markDelivered: (id: string) => void;
}

const now = () => new Date().toISOString();

function handleErr(e: unknown) {
  console.error(e);
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  visionTiles: [],
  visionGoals: [],
  books: [],
  reviews: [],
  purchaseItems: [],
  fragrances: [],
  packages: [],
  _hydrated: false,

  loadFromStorage: async () => {
    try {
      const state = await api.getFullState();
      set({ ...state, _hydrated: true });
    } catch (e) {
      handleErr(e);
      set({ _hydrated: true });
    }
  },

  saveToStorage: () => {},

  resetToDemo: async () => {
    try {
      const state = await api.postData("reset");
      set(state);
    } catch (e) {
      handleErr(e);
    }
  },

  clearAll: async () => {
    try {
      const state = await api.postData("clear");
      set(state);
    } catch (e) {
      handleErr(e);
    }
  },

  importState: async (state) => {
    try {
      const next = await api.postData("import", state);
      set(next);
    } catch (e) {
      handleErr(e);
    }
  },

  addTask: (task) => {
    const t: Task = { ...task, id: uid(), createdAt: now(), updatedAt: now() };
    api.tasks.create(t).then((created) => set((s) => ({ tasks: [...s.tasks, created] }))).catch(handleErr);
  },
  updateTask: (id, patch) => {
    api.tasks.update(id, patch)
      .then(() => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)) })))
      .catch(handleErr);
  },
  deleteTask: (id) => {
    api.tasks.delete(id).then(() => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))).catch(handleErr);
  },
  setTaskStatus: (id, status) => get().updateTask(id, { status }),

  addTile: (tile) => {
    const t: VisionTile = { ...tile, id: uid(), createdAt: now() };
    api.visionTiles.create(t).then((created) => set((s) => ({ visionTiles: [...s.visionTiles, created] }))).catch(handleErr);
  },
  updateTile: (id, patch) => {
    api.visionTiles.update(id, patch)
      .then(() => set((s) => ({ visionTiles: s.visionTiles.map((t) => (t.id === id ? { ...t, ...patch } : t)) })))
      .catch(handleErr);
  },
  deleteTile: (id) => {
    api.visionTiles.delete(id).then(() => set((s) => ({ visionTiles: s.visionTiles.filter((t) => t.id !== id) }))).catch(handleErr);
  },
  addGoal: (goal) => {
    const g: VisionGoal = { ...goal, id: uid(), createdAt: now(), updatedAt: now() };
    api.visionGoals.create(g).then((created) => set((s) => ({ visionGoals: [...s.visionGoals, created] }))).catch(handleErr);
  },
  updateGoal: (id, patch) => {
    api.visionGoals.update(id, patch)
      .then(() => set((s) => ({ visionGoals: s.visionGoals.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: now() } : g)) })))
      .catch(handleErr);
  },
  deleteGoal: (id) => {
    api.visionGoals.delete(id).then(() => set((s) => ({ visionGoals: s.visionGoals.filter((g) => g.id !== id) }))).catch(handleErr);
  },

  addBook: (book) => {
    const b: Book = { ...book, id: uid(), createdAt: now(), updatedAt: now() };
    api.books.create(b).then((created) => set((s) => ({ books: [...s.books, created] }))).catch(handleErr);
  },
  updateBook: (id, patch) => {
    api.books.update(id, patch)
      .then(() => set((s) => ({ books: s.books.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now() } : b)) })))
      .catch(handleErr);
  },
  deleteBook: (id) => {
    api.books.delete(id)
      .then(() => set((s) => ({ books: s.books.filter((b) => b.id !== id), reviews: s.reviews.filter((r) => r.bookId !== id) })))
      .catch(handleErr);
  },
  addReview: (review) => {
    const r: Review = { ...review, id: uid(), createdAt: now() };
    api.reviews.create(r).then((created) => set((s) => ({ reviews: [...s.reviews, created] }))).catch(handleErr);
  },
  updateReview: (id, patch) => {
    api.reviews.update(id, patch)
      .then(() => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) })))
      .catch(handleErr);
  },
  deleteReview: (id) => {
    api.reviews.delete(id).then(() => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }))).catch(handleErr);
  },

  addPurchase: (item) => {
    const p: PurchaseItem = { ...item, id: uid() };
    api.purchases.create(p).then((created) => set((s) => ({ purchaseItems: [...s.purchaseItems, created] }))).catch(handleErr);
  },
  updatePurchase: (id, patch) => {
    api.purchases.update(id, patch)
      .then(() => set((s) => ({ purchaseItems: s.purchaseItems.map((p) => (p.id === id ? { ...p, ...patch } : p)) })))
      .catch(handleErr);
  },
  deletePurchase: (id) => {
    api.purchases.delete(id).then(() => set((s) => ({ purchaseItems: s.purchaseItems.filter((p) => p.id !== id) }))).catch(handleErr);
  },
  markPurchased: (id) => {
    const item = get().purchaseItems.find((p) => p.id === id);
    if (!item) return;
    const today = toISODate(new Date());
    const next = item.recurrence === "monthly" ? toISODate(addMonths(new Date(), 1)) : undefined;
    get().updatePurchase(id, { lastPurchasedAt: today, nextPurchaseAt: next });
  },

  addFragrance: (f) => {
    const frag: Fragrance = { ...f, id: uid() };
    api.fragrances.create(frag).then((created) => set((s) => ({ fragrances: [...s.fragrances, created] }))).catch(handleErr);
  },
  updateFragrance: (id, patch) => {
    api.fragrances.update(id, patch)
      .then(() => set((s) => ({ fragrances: s.fragrances.map((f) => (f.id === id ? { ...f, ...patch } : f)) })))
      .catch(handleErr);
  },
  deleteFragrance: (id) => {
    api.fragrances.delete(id).then(() => set((s) => ({ fragrances: s.fragrances.filter((f) => f.id !== id) }))).catch(handleErr);
  },

  addPackage: (p) => {
    const pk: Package = { ...p, id: uid() };
    api.packages.create(pk).then((created) => set((s) => ({ packages: [...s.packages, created] }))).catch(handleErr);
  },
  updatePackage: (id, patch) => {
    api.packages.update(id, patch)
      .then(() => set((s) => ({ packages: s.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })))
      .catch(handleErr);
  },
  deletePackage: (id) => {
    api.packages.delete(id).then(() => set((s) => ({ packages: s.packages.filter((p) => p.id !== id) }))).catch(handleErr);
  },
  markDelivered: (id) => get().updatePackage(id, { status: "delivered" }),
}));

//cloud storage
//cloud storage
import { create } from "zustand";
import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance } from "@/types/fragrances";
import type { Package } from "@/types/packages";
import type { FullState } from "@/types/state";
import { uid } from "./utils";
import { addMonths, toISODate } from "./date";

import { loadState, saveState, clearStorage } from "./storage";
import { supabase } from "@/lib/supabase";
import { loadCloudState, saveCloudState } from "@/lib/cloudState";

export interface AppState extends FullState {
  _hydrated: boolean;
  _syncing: boolean;
  _authed: boolean;

  loadFromStorage: () => Promise<void>;
  pushToCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

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

function getFullStateFromStore(get: () => AppState): FullState {
  const s = get();
  return {
    tasks: s.tasks,
    visionTiles: s.visionTiles,
    visionGoals: s.visionGoals,
    books: s.books,
    reviews: s.reviews,
    purchaseItems: s.purchaseItems,
    fragrances: s.fragrances,
    packages: s.packages,
  };
}

// debounced cloud save (prevents spamming supabase on every keystroke)
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleCloudSave(get: () => AppState, set: (fn: any) => void) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return; // not logged in
      set(() => ({ _syncing: true }));
      await saveCloudState(getFullStateFromStore(get));
    } catch (e) {
      handleErr(e);
    } finally {
      set(() => ({ _syncing: false }));
    }
  }, 600);
}

function persistLocal(get: () => AppState) {
  const s = getFullStateFromStore(get);
  saveState({ version: 1, ...s });
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
  _syncing: false,
  _authed: false,

  loadFromStorage: async () => {
    try {
      // 1) local cache first
      const local = loadState();
      if (local) {
        set({
          tasks: local.tasks ?? [],
          visionTiles: local.visionTiles ?? [],
          visionGoals: local.visionGoals ?? [],
          books: local.books ?? [],
          reviews: local.reviews ?? [],
          purchaseItems: local.purchaseItems ?? [],
          fragrances: local.fragrances ?? [],
          packages: local.packages ?? [],
        });
      }

      // 2) if logged in, cloud overrides
      const { data } = await supabase.auth.getSession();
      set({ _authed: !!data.session });

      if (data.session) {
        const cloud = await loadCloudState();
        if (cloud) {
          set({ ...cloud });
          saveState({ version: 1, ...cloud });
        }
      }
    } catch (e) {
      handleErr(e);
    } finally {
      set({ _hydrated: true });
    }
  },

  pullFromCloud: async () => {
    const cloud = await loadCloudState();
    if (cloud) {
      set({ ...cloud });
      saveState({ version: 1, ...cloud });
    }
  },

  pushToCloud: async () => {
    await saveCloudState(getFullStateFromStore(get));
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    set({ _authed: true });
    await get().pullFromCloud();
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    set({ _authed: true });
    // first-time users: push whatever local state they have
    await get().pushToCloud();
  },

  // ✅ FIXED SIGN OUT: clear auth + cancel sync + wipe local cache + wipe in-memory state
  signOut: async () => {
    // cancel any pending cloud save
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);

    // clear browser cache
    clearStorage();

    // wipe in-memory state so UI clears immediately
    set({
      _authed: false,
      _syncing: false,
      tasks: [],
      visionTiles: [],
      visionGoals: [],
      books: [],
      reviews: [],
      purchaseItems: [],
      fragrances: [],
      packages: [],
    });
  },

  resetToDemo: async () => {
    // keep your demo logic if you have it elsewhere; for now just clear
    await get().clearAll();
  },

  clearAll: async () => {
    set({
      tasks: [],
      visionTiles: [],
      visionGoals: [],
      books: [],
      reviews: [],
      purchaseItems: [],
      fragrances: [],
      packages: [],
    });
    clearStorage();
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  importState: async (state) => {
    set({ ...state });
    saveState({ version: 1, ...state });
    scheduleCloudSave(get, set);
  },

  // ---- TASKS ----
  addTask: (task) => {
    const t: Task = { ...task, id: uid(), createdAt: now(), updatedAt: now() };
    set((s) => ({ tasks: [...s.tasks, t] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateTask: (id, patch) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  setTaskStatus: (id, status) => get().updateTask(id, { status }),

  // ---- VISION ----
  addTile: (tile) => {
    const t: VisionTile = { ...tile, id: uid(), createdAt: now() };
    set((s) => ({ visionTiles: [...s.visionTiles, t] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateTile: (id, patch) => {
    set((s) => ({ visionTiles: s.visionTiles.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteTile: (id) => {
    set((s) => ({ visionTiles: s.visionTiles.filter((t) => t.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  addGoal: (goal) => {
    const g: VisionGoal = { ...goal, id: uid(), createdAt: now(), updatedAt: now() };
    set((s) => ({ visionGoals: [...s.visionGoals, g] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateGoal: (id, patch) => {
    set((s) => ({
      visionGoals: s.visionGoals.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: now() } : g)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteGoal: (id) => {
    set((s) => ({ visionGoals: s.visionGoals.filter((g) => g.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  // ---- READING ----
  addBook: (book) => {
    const b: Book = { ...book, id: uid(), createdAt: now(), updatedAt: now() };
    set((s) => ({ books: [...s.books, b] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateBook: (id, patch) => {
    set((s) => ({
      books: s.books.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now() } : b)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteBook: (id) => {
    set((s) => ({
      books: s.books.filter((b) => b.id !== id),
      reviews: s.reviews.filter((r) => r.bookId !== id),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  addReview: (review) => {
    const r: Review = { ...review, id: uid(), createdAt: now() };
    set((s) => ({ reviews: [...s.reviews, r] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateReview: (id, patch) => {
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteReview: (id) => {
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  // ---- PURCHASES ----
  addPurchase: (item) => {
    const p: PurchaseItem = { ...item, id: uid() };
    set((s) => ({ purchaseItems: [...s.purchaseItems, p] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updatePurchase: (id, patch) => {
    set((s) => ({ purchaseItems: s.purchaseItems.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deletePurchase: (id) => {
    set((s) => ({ purchaseItems: s.purchaseItems.filter((p) => p.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  markPurchased: (id) => {
    const item = get().purchaseItems.find((p) => p.id === id);
    if (!item) return;
    const today = toISODate(new Date());
    const next = item.recurrence === "monthly" ? toISODate(addMonths(new Date(), 1)) : undefined;
    get().updatePurchase(id, { lastPurchasedAt: today, nextPurchaseAt: next });
  },

  // ---- FRAGRANCES ----
  addFragrance: (f) => {
    const frag: Fragrance = { ...f, id: uid() };
    set((s) => ({ fragrances: [...s.fragrances, frag] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateFragrance: (id, patch) => {
    set((s) => ({ fragrances: s.fragrances.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteFragrance: (id) => {
    set((s) => ({ fragrances: s.fragrances.filter((f) => f.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  // ---- PACKAGES ----
  addPackage: (p) => {
    const pk: Package = { ...p, id: uid() };
    set((s) => ({ packages: [...s.packages, pk] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updatePackage: (id, patch) => {
    set((s) => ({ packages: s.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deletePackage: (id) => {
    set((s) => ({ packages: s.packages.filter((p) => p.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  markDelivered: (id) => get().updatePackage(id, { status: "delivered" }),
}));



//local storage
// import { create } from "zustand";
// import type { Task } from "@/types/todo";
// import type { VisionTile, VisionGoal } from "@/types/vision";
// import type { Book, Review } from "@/types/reading";
// import type { PurchaseItem } from "@/types/purchases";
// import type { Fragrance } from "@/types/fragrances";
// import type { Package } from "@/types/packages";
// import type { FullState } from "@/types/state";
// import { api } from "./api";
// import { uid } from "./utils";
// import { addMonths, toISODate } from "./date";

// export interface AppState extends FullState {
//   _hydrated: boolean;
//   loadFromStorage: () => Promise<void>;
//   saveToStorage: () => void;
//   resetToDemo: () => Promise<void>;
//   clearAll: () => Promise<void>;
//   importState: (state: FullState) => Promise<void>;

//   addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
//   updateTask: (id: string, patch: Partial<Task>) => void;
//   deleteTask: (id: string) => void;
//   setTaskStatus: (id: string, status: Task["status"]) => void;

//   addTile: (tile: Omit<VisionTile, "id" | "createdAt">) => void;
//   updateTile: (id: string, patch: Partial<VisionTile>) => void;
//   deleteTile: (id: string) => void;
//   addGoal: (goal: Omit<VisionGoal, "id" | "createdAt" | "updatedAt">) => void;
//   updateGoal: (id: string, patch: Partial<VisionGoal>) => void;
//   deleteGoal: (id: string) => void;

//   addBook: (book: Omit<Book, "id" | "createdAt" | "updatedAt">) => void;
//   updateBook: (id: string, patch: Partial<Book>) => void;
//   deleteBook: (id: string) => void;
//   addReview: (review: Omit<Review, "id" | "createdAt">) => void;
//   updateReview: (id: string, patch: Partial<Review>) => void;
//   deleteReview: (id: string) => void;

//   addPurchase: (item: Omit<PurchaseItem, "id">) => void;
//   updatePurchase: (id: string, patch: Partial<PurchaseItem>) => void;
//   deletePurchase: (id: string) => void;
//   markPurchased: (id: string) => void;

//   addFragrance: (f: Omit<Fragrance, "id">) => void;
//   updateFragrance: (id: string, patch: Partial<Fragrance>) => void;
//   deleteFragrance: (id: string) => void;

//   addPackage: (p: Omit<Package, "id">) => void;
//   updatePackage: (id: string, patch: Partial<Package>) => void;
//   deletePackage: (id: string) => void;
//   markDelivered: (id: string) => void;
// }

// const now = () => new Date().toISOString();

// function handleErr(e: unknown) {
//   console.error(e);
// }

// export const useStore = create<AppState>((set, get) => ({
//   tasks: [],
//   visionTiles: [],
//   visionGoals: [],
//   books: [],
//   reviews: [],
//   purchaseItems: [],
//   fragrances: [],
//   packages: [],
//   _hydrated: false,

//   loadFromStorage: async () => {
//     try {
//       const state = await api.getFullState();
//       set({ ...state, _hydrated: true });
//     } catch (e) {
//       handleErr(e);
//       set({ _hydrated: true });
//     }
//   },

//   saveToStorage: () => {},

//   resetToDemo: async () => {
//     try {
//       const state = await api.postData("reset");
//       set(state);
//     } catch (e) {
//       handleErr(e);
//     }
//   },

//   clearAll: async () => {
//     try {
//       const state = await api.postData("clear");
//       set(state);
//     } catch (e) {
//       handleErr(e);
//     }
//   },

//   importState: async (state) => {
//     try {
//       const next = await api.postData("import", state);
//       set(next);
//     } catch (e) {
//       handleErr(e);
//     }
//   },

//   addTask: (task) => {
//     const t: Task = { ...task, id: uid(), createdAt: now(), updatedAt: now() };
//     api.tasks.create(t).then((created) => set((s) => ({ tasks: [...s.tasks, created] }))).catch(handleErr);
//   },
//   updateTask: (id, patch) => {
//     api.tasks.update(id, patch)
//       .then(() => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)) })))
//       .catch(handleErr);
//   },
//   deleteTask: (id) => {
//     api.tasks.delete(id).then(() => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))).catch(handleErr);
//   },
//   setTaskStatus: (id, status) => get().updateTask(id, { status }),

//   addTile: (tile) => {
//     const t: VisionTile = { ...tile, id: uid(), createdAt: now() };
//     api.visionTiles.create(t).then((created) => set((s) => ({ visionTiles: [...s.visionTiles, created] }))).catch(handleErr);
//   },
//   updateTile: (id, patch) => {
//     api.visionTiles.update(id, patch)
//       .then(() => set((s) => ({ visionTiles: s.visionTiles.map((t) => (t.id === id ? { ...t, ...patch } : t)) })))
//       .catch(handleErr);
//   },
//   deleteTile: (id) => {
//     api.visionTiles.delete(id).then(() => set((s) => ({ visionTiles: s.visionTiles.filter((t) => t.id !== id) }))).catch(handleErr);
//   },
//   addGoal: (goal) => {
//     const g: VisionGoal = { ...goal, id: uid(), createdAt: now(), updatedAt: now() };
//     api.visionGoals.create(g).then((created) => set((s) => ({ visionGoals: [...s.visionGoals, created] }))).catch(handleErr);
//   },
//   updateGoal: (id, patch) => {
//     api.visionGoals.update(id, patch)
//       .then(() => set((s) => ({ visionGoals: s.visionGoals.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: now() } : g)) })))
//       .catch(handleErr);
//   },
//   deleteGoal: (id) => {
//     api.visionGoals.delete(id).then(() => set((s) => ({ visionGoals: s.visionGoals.filter((g) => g.id !== id) }))).catch(handleErr);
//   },

//   addBook: (book) => {
//     const b: Book = { ...book, id: uid(), createdAt: now(), updatedAt: now() };
//     api.books.create(b).then((created) => set((s) => ({ books: [...s.books, created] }))).catch(handleErr);
//   },
//   updateBook: (id, patch) => {
//     api.books.update(id, patch)
//       .then(() => set((s) => ({ books: s.books.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now() } : b)) })))
//       .catch(handleErr);
//   },
//   deleteBook: (id) => {
//     api.books.delete(id)
//       .then(() => set((s) => ({ books: s.books.filter((b) => b.id !== id), reviews: s.reviews.filter((r) => r.bookId !== id) })))
//       .catch(handleErr);
//   },
//   addReview: (review) => {
//     const r: Review = { ...review, id: uid(), createdAt: now() };
//     api.reviews.create(r).then((created) => set((s) => ({ reviews: [...s.reviews, created] }))).catch(handleErr);
//   },
//   updateReview: (id, patch) => {
//     api.reviews.update(id, patch)
//       .then(() => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) })))
//       .catch(handleErr);
//   },
//   deleteReview: (id) => {
//     api.reviews.delete(id).then(() => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }))).catch(handleErr);
//   },

//   addPurchase: (item) => {
//     const p: PurchaseItem = { ...item, id: uid() };
//     api.purchases.create(p).then((created) => set((s) => ({ purchaseItems: [...s.purchaseItems, created] }))).catch(handleErr);
//   },
//   updatePurchase: (id, patch) => {
//     api.purchases.update(id, patch)
//       .then(() => set((s) => ({ purchaseItems: s.purchaseItems.map((p) => (p.id === id ? { ...p, ...patch } : p)) })))
//       .catch(handleErr);
//   },
//   deletePurchase: (id) => {
//     api.purchases.delete(id).then(() => set((s) => ({ purchaseItems: s.purchaseItems.filter((p) => p.id !== id) }))).catch(handleErr);
//   },
//   markPurchased: (id) => {
//     const item = get().purchaseItems.find((p) => p.id === id);
//     if (!item) return;
//     const today = toISODate(new Date());
//     const next = item.recurrence === "monthly" ? toISODate(addMonths(new Date(), 1)) : undefined;
//     get().updatePurchase(id, { lastPurchasedAt: today, nextPurchaseAt: next });
//   },

//   addFragrance: (f) => {
//     const frag: Fragrance = { ...f, id: uid() };
//     api.fragrances.create(frag).then((created) => set((s) => ({ fragrances: [...s.fragrances, created] }))).catch(handleErr);
//   },
//   updateFragrance: (id, patch) => {
//     api.fragrances.update(id, patch)
//       .then(() => set((s) => ({ fragrances: s.fragrances.map((f) => (f.id === id ? { ...f, ...patch } : f)) })))
//       .catch(handleErr);
//   },
//   deleteFragrance: (id) => {
//     api.fragrances.delete(id).then(() => set((s) => ({ fragrances: s.fragrances.filter((f) => f.id !== id) }))).catch(handleErr);
//   },

//   addPackage: (p) => {
//     const pk: Package = { ...p, id: uid() };
//     api.packages.create(pk).then((created) => set((s) => ({ packages: [...s.packages, created] }))).catch(handleErr);
//   },
//   updatePackage: (id, patch) => {
//     api.packages.update(id, patch)
//       .then(() => set((s) => ({ packages: s.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })))
//       .catch(handleErr);
//   },
//   deletePackage: (id) => {
//     api.packages.delete(id).then(() => set((s) => ({ packages: s.packages.filter((p) => p.id !== id) }))).catch(handleErr);
//   },
//   markDelivered: (id) => get().updatePackage(id, { status: "delivered" }),
// }));

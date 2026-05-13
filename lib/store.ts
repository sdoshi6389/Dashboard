import { create } from "zustand";
import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review, ReadingLog } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance, FragranceSeason } from "@/types/fragrances";
import type { Package } from "@/types/packages";
import type { Meal } from "@/types/meals";
import type { WorkoutPlan } from "@/types/workouts";
import type { Routine } from "@/types/routines";
import type { TravelTrip } from "@/types/travel";
import type {
  FinancialAccount,
  SinkingFund,
  Paycheck,
  InvestmentHolding,
  MonthlyFinancialReview,
  BudgetCategory,
  MonthlyBudgetActual,
  AccountPartition,
  FinancialPurchase,
} from "@/types/finances";
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

  addReadingLog: (log: Omit<ReadingLog, "id" | "createdAt">) => void;
  updateReadingLog: (id: string, patch: Partial<ReadingLog>) => void;
  deleteReadingLog: (id: string) => void;

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

  addMeal: (meal: Omit<Meal, "id">) => void;
  updateMeal: (id: string, patch: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;

  addWorkout: (workout: Omit<WorkoutPlan, "id">) => void;
  updateWorkout: (id: string, patch: Partial<WorkoutPlan>) => void;
  deleteWorkout: (id: string) => void;

  addRoutine: (routine: Omit<Routine, "id">) => void;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;

  addTrip: (trip: Omit<TravelTrip, "id">) => void;
  updateTrip: (id: string, patch: Partial<TravelTrip>) => void;
  deleteTrip: (id: string) => void;

  addFinancialAccount: (account: Omit<FinancialAccount, "id">) => void;
  updateFinancialAccount: (id: string, patch: Partial<FinancialAccount>) => void;
  deleteFinancialAccount: (id: string) => void;

  addSinkingFund: (fund: Omit<SinkingFund, "id">) => void;
  updateSinkingFund: (id: string, patch: Partial<SinkingFund>) => void;
  deleteSinkingFund: (id: string) => void;

  addPaycheck: (paycheck: Omit<Paycheck, "id">) => void;
  updatePaycheck: (id: string, patch: Partial<Paycheck>) => void;
  deletePaycheck: (id: string) => void;

  addInvestmentHolding: (holding: Omit<InvestmentHolding, "id">) => void;
  updateInvestmentHolding: (id: string, patch: Partial<InvestmentHolding>) => void;
  deleteInvestmentHolding: (id: string) => void;

  addMonthlyFinancialReview: (review: Omit<MonthlyFinancialReview, "id">) => void;
  updateMonthlyFinancialReview: (id: string, patch: Partial<MonthlyFinancialReview>) => void;
  deleteMonthlyFinancialReview: (id: string) => void;

  addBudgetCategory: (cat: Omit<BudgetCategory, "id">) => void;
  updateBudgetCategory: (id: string, patch: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (id: string) => void;

  addMonthlyBudgetActual: (actual: Omit<MonthlyBudgetActual, "id">) => void;
  updateMonthlyBudgetActual: (id: string, patch: Partial<MonthlyBudgetActual>) => void;
  deleteMonthlyBudgetActual: (id: string) => void;
  upsertMonthlyBudgetActual: (month: string, categoryId: string, amountSpent: number, notes?: string) => void;

  addAccountPartition: (partition: Omit<AccountPartition, "id">) => void;
  updateAccountPartition: (id: string, patch: Partial<AccountPartition>) => void;
  deleteAccountPartition: (id: string) => void;

  addFinancialPurchase: (purchase: Omit<FinancialPurchase, "id">) => void;
  updateFinancialPurchase: (id: string, patch: Partial<FinancialPurchase>) => void;
  deleteFinancialPurchase: (id: string) => void;
}

const now = () => new Date().toISOString();

function handleErr(e: unknown) {
  console.error(e);
}

function normalizeFragrance(raw: Fragrance): Fragrance {
  const seasons =
    Array.isArray(raw.seasons) && raw.seasons.length > 0
      ? Array.from(new Set(raw.seasons))
      : raw.season
      ? [raw.season]
      : [];

  return {
    ...raw,
    seasons,
    season: raw.season ?? seasons[0],
    longevity: typeof raw.longevity === "number" ? Number(raw.longevity) : 3,
    projection: typeof raw.projection === "number" ? Number(raw.projection) : 3,
  };
}

function normalizeFragrancePatch(patch: Partial<Fragrance>): Partial<Fragrance> {
  const normalized: Partial<Fragrance> = { ...patch };

  if ("seasons" in patch || "season" in patch) {
    const seasons =
      Array.isArray(patch.seasons) && patch.seasons.length > 0
        ? Array.from(new Set(patch.seasons))
        : patch.season
        ? [patch.season]
        : [];

    normalized.seasons = seasons;
    normalized.season = patch.season ?? seasons[0];
  }

  if (typeof patch.longevity === "number") {
    normalized.longevity = Number(patch.longevity);
  }

  if (typeof patch.projection === "number") {
    normalized.projection = Number(patch.projection);
  }

  return normalized;
}

function normalizeFragrances(fragrances: Fragrance[] | null | undefined): Fragrance[] {
  return (fragrances ?? []).map(normalizeFragrance);
}

function getFullStateFromStore(get: () => AppState): FullState {
  const s = get();
  return {
    tasks: s.tasks,
    visionTiles: s.visionTiles,
    visionGoals: s.visionGoals,
    books: s.books,
    reviews: s.reviews,
    readingLogs: s.readingLogs,
    purchaseItems: s.purchaseItems,
    fragrances: normalizeFragrances(s.fragrances),
    packages: s.packages,
    meals: s.meals,
    workouts: s.workouts,
    routines: s.routines,
    trips: s.trips,
    financialAccounts: s.financialAccounts,
    sinkingFunds: s.sinkingFunds,
    paychecks: s.paychecks,
    investmentHoldings: s.investmentHoldings,
    monthlyFinancialReviews: s.monthlyFinancialReviews,
    budgetCategories: s.budgetCategories,
    monthlyBudgetActuals: s.monthlyBudgetActuals,
    accountPartitions: s.accountPartitions,
    financialPurchases: s.financialPurchases,
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleCloudSave(
  get: () => AppState,
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void
) {
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      set({ _syncing: true });
      await saveCloudState(getFullStateFromStore(get));
    } catch (e) {
      handleErr(e);
    } finally {
      set({ _syncing: false });
    }
  }, 600);
}

function persistLocal(get: () => AppState) {
  const s = getFullStateFromStore(get);
  saveState({ version: 2, ...s });
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  visionTiles: [],
  visionGoals: [],
  books: [],
  reviews: [],
  readingLogs: [],
  purchaseItems: [],
  fragrances: [],
  packages: [],
  meals: [],
  workouts: [],
  routines: [],
  trips: [],
  financialAccounts: [],
  sinkingFunds: [],
  paychecks: [],
  investmentHoldings: [],
  monthlyFinancialReviews: [],
  budgetCategories: [],
  monthlyBudgetActuals: [],
  accountPartitions: [],
  financialPurchases: [],
  _hydrated: false,
  _syncing: false,
  _authed: false,

  loadFromStorage: async () => {
    try {
      const local = loadState();
      if (local) {
        set({
          tasks: local.tasks ?? [],
          visionTiles: local.visionTiles ?? [],
          visionGoals: local.visionGoals ?? [],
          books: local.books ?? [],
          reviews: local.reviews ?? [],
          readingLogs: local.readingLogs ?? [],
          purchaseItems: local.purchaseItems ?? [],
          fragrances: normalizeFragrances(local.fragrances),
          packages: local.packages ?? [],
          meals: local.meals ?? [],
          workouts: local.workouts ?? [],
          routines: local.routines ?? [],
          trips: local.trips ?? [],
          financialAccounts: local.financialAccounts ?? [],
          sinkingFunds: local.sinkingFunds ?? [],
          paychecks: local.paychecks ?? [],
          investmentHoldings: local.investmentHoldings ?? [],
          monthlyFinancialReviews: local.monthlyFinancialReviews ?? [],
          budgetCategories: local.budgetCategories ?? [],
          monthlyBudgetActuals: local.monthlyBudgetActuals ?? [],
          accountPartitions: local.accountPartitions ?? [],
          financialPurchases: local.financialPurchases ?? [],
        });
      }

      const { data } = await supabase.auth.getSession();
      set({ _authed: !!data.session });

      if (data.session) {
        const cloud = await loadCloudState();
        if (cloud) {
          set({
            tasks: cloud.tasks ?? [],
            visionTiles: cloud.visionTiles ?? [],
            visionGoals: cloud.visionGoals ?? [],
            books: cloud.books ?? [],
            reviews: cloud.reviews ?? [],
            readingLogs: cloud.readingLogs ?? [],
            purchaseItems: cloud.purchaseItems ?? [],
            fragrances: normalizeFragrances(cloud.fragrances),
            packages: cloud.packages ?? [],
            meals: cloud.meals ?? [],
            workouts: cloud.workouts ?? [],
            routines: cloud.routines ?? [],
            trips: cloud.trips ?? [],
            financialAccounts: cloud.financialAccounts ?? [],
            sinkingFunds: cloud.sinkingFunds ?? [],
            paychecks: cloud.paychecks ?? [],
            investmentHoldings: cloud.investmentHoldings ?? [],
            monthlyFinancialReviews: cloud.monthlyFinancialReviews ?? [],
            budgetCategories: cloud.budgetCategories ?? [],
            monthlyBudgetActuals: cloud.monthlyBudgetActuals ?? [],
            accountPartitions: cloud.accountPartitions ?? [],
            financialPurchases: cloud.financialPurchases ?? [],
          });
          saveState({
            version: 2,
            ...cloud,
            fragrances: normalizeFragrances(cloud.fragrances),
          });
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
      set({
        tasks: cloud.tasks ?? [],
        visionTiles: cloud.visionTiles ?? [],
        visionGoals: cloud.visionGoals ?? [],
        books: cloud.books ?? [],
        reviews: cloud.reviews ?? [],
        readingLogs: cloud.readingLogs ?? [],
        purchaseItems: cloud.purchaseItems ?? [],
        fragrances: normalizeFragrances(cloud.fragrances),
        packages: cloud.packages ?? [],
        meals: cloud.meals ?? [],
        workouts: cloud.workouts ?? [],
        routines: cloud.routines ?? [],
        trips: cloud.trips ?? [],
        financialAccounts: cloud.financialAccounts ?? [],
        sinkingFunds: cloud.sinkingFunds ?? [],
        paychecks: cloud.paychecks ?? [],
        investmentHoldings: cloud.investmentHoldings ?? [],
        monthlyFinancialReviews: cloud.monthlyFinancialReviews ?? [],
      });
      saveState({
        version: 2,
        ...cloud,
        fragrances: normalizeFragrances(cloud.fragrances),
      });
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
    await get().pushToCloud();
  },

  signOut: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);

    clearStorage();

    set({
      _authed: false,
      _syncing: false,
      tasks: [],
      visionTiles: [],
      visionGoals: [],
      books: [],
      reviews: [],
      readingLogs: [],
      purchaseItems: [],
      fragrances: [],
      packages: [],
      meals: [],
      workouts: [],
      routines: [],
      trips: [],
      financialAccounts: [],
      sinkingFunds: [],
      paychecks: [],
      investmentHoldings: [],
      monthlyFinancialReviews: [],
      budgetCategories: [],
      monthlyBudgetActuals: [],
      accountPartitions: [],
      financialPurchases: [],
    });
  },

  resetToDemo: async () => {
    await get().clearAll();
  },

  clearAll: async () => {
    set({
      tasks: [],
      visionTiles: [],
      visionGoals: [],
      books: [],
      reviews: [],
      readingLogs: [],
      purchaseItems: [],
      fragrances: [],
      packages: [],
      meals: [],
      workouts: [],
      routines: [],
      trips: [],
      financialAccounts: [],
      sinkingFunds: [],
      paychecks: [],
      investmentHoldings: [],
      monthlyFinancialReviews: [],
      budgetCategories: [],
      monthlyBudgetActuals: [],
      accountPartitions: [],
      financialPurchases: [],
    });
    clearStorage();
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  importState: async (state) => {
    set({
      tasks: state.tasks ?? [],
      visionTiles: state.visionTiles ?? [],
      visionGoals: state.visionGoals ?? [],
      books: state.books ?? [],
      reviews: state.reviews ?? [],
      readingLogs: state.readingLogs ?? [],
      purchaseItems: state.purchaseItems ?? [],
      fragrances: normalizeFragrances(state.fragrances),
      packages: state.packages ?? [],
      meals: state.meals ?? [],
      workouts: state.workouts ?? [],
      routines: state.routines ?? [],
      trips: state.trips ?? [],
      financialAccounts: state.financialAccounts ?? [],
      sinkingFunds: state.sinkingFunds ?? [],
      paychecks: state.paychecks ?? [],
      investmentHoldings: state.investmentHoldings ?? [],
      monthlyFinancialReviews: state.monthlyFinancialReviews ?? [],
      budgetCategories: state.budgetCategories ?? [],
      monthlyBudgetActuals: state.monthlyBudgetActuals ?? [],
      accountPartitions: state.accountPartitions ?? [],
      financialPurchases: state.financialPurchases ?? [],
    });
    saveState({
      version: 2,
      ...state,
      fragrances: normalizeFragrances(state.fragrances),
    });
    scheduleCloudSave(get, set);
  },

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

  addTile: (tile) => {
    const t: VisionTile = { ...tile, id: uid(), createdAt: now() };
    set((s) => ({ visionTiles: [...s.visionTiles, t] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateTile: (id, patch) => {
    set((s) => ({
      visionTiles: s.visionTiles.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
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
      readingLogs: s.readingLogs.filter((log) => log.bookId !== id),
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
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteReview: (id) => {
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addReadingLog: (log) => {
    const nextLog: ReadingLog = { ...log, id: uid(), createdAt: now() };
    set((s) => ({
      readingLogs: [...s.readingLogs, nextLog],
      books: s.books.map((b) =>
        b.id === log.bookId
          ? {
              ...b,
              status: b.status === "want" ? "reading" : b.status,
              updatedAt: now(),
            }
          : b
      ),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateReadingLog: (id, patch) => {
    set((s) => ({
      readingLogs: s.readingLogs.map((log) => (log.id === id ? { ...log, ...patch } : log)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteReadingLog: (id) => {
    set((s) => ({ readingLogs: s.readingLogs.filter((log) => log.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addPurchase: (item) => {
    const p: PurchaseItem = { ...item, id: uid() };
    set((s) => ({ purchaseItems: [...s.purchaseItems, p] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updatePurchase: (id, patch) => {
    set((s) => ({
      purchaseItems: s.purchaseItems.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
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

  addFragrance: (f) => {
    const frag: Fragrance = normalizeFragrance({ ...f, id: uid() });
    set((s) => ({ fragrances: [...s.fragrances, frag] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateFragrance: (id, patch) => {
    const normalizedPatch = normalizeFragrancePatch(patch);
    set((s) => ({
      fragrances: s.fragrances.map((f) =>
        f.id === id ? normalizeFragrance({ ...f, ...normalizedPatch }) : f
      ),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteFragrance: (id) => {
    set((s) => ({ fragrances: s.fragrances.filter((f) => f.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addMeal: (meal) => {
    const m: Meal = { ...meal, id: uid() };
    set((s) => ({ meals: [...s.meals, m] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateMeal: (id, patch) => {
    set((s) => ({
      meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteMeal: (id) => {
    set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addWorkout: (workout) => {
    const w: WorkoutPlan = { ...workout, id: uid() };
    set((s) => ({ workouts: [...s.workouts, w] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateWorkout: (id, patch) => {
    set((s) => ({
      workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteWorkout: (id) => {
    set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addRoutine: (routine) => {
    const r: Routine = { ...routine, id: uid() };
    set((s) => ({ routines: [...s.routines, r] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateRoutine: (id, patch) => {
    set((s) => ({
      routines: s.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteRoutine: (id) => {
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addTrip: (trip) => {
    const t: TravelTrip = { ...trip, id: uid() };
    set((s) => ({ trips: [...s.trips, t] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updateTrip: (id, patch) => {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deleteTrip: (id) => {
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addPackage: (p) => {
    const pk: Package = { ...p, id: uid() };
    set((s) => ({ packages: [...s.packages, pk] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  updatePackage: (id, patch) => {
    set((s) => ({
      packages: s.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  deletePackage: (id) => {
    set((s) => ({ packages: s.packages.filter((p) => p.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  markDelivered: (id) => get().updatePackage(id, { status: "delivered" }),

  addFinancialAccount: (account) => {
    const a: FinancialAccount = { ...account, id: uid() };
    set((s) => ({ financialAccounts: [...s.financialAccounts, a] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateFinancialAccount: (id, patch) => {
    set((s) => ({
      financialAccounts: s.financialAccounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteFinancialAccount: (id) => {
    set((s) => ({ financialAccounts: s.financialAccounts.filter((a) => a.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addSinkingFund: (fund) => {
    const f: SinkingFund = { ...fund, id: uid() };
    set((s) => ({ sinkingFunds: [...s.sinkingFunds, f] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateSinkingFund: (id, patch) => {
    set((s) => ({
      sinkingFunds: s.sinkingFunds.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteSinkingFund: (id) => {
    set((s) => ({ sinkingFunds: s.sinkingFunds.filter((f) => f.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addPaycheck: (paycheck) => {
    const p: Paycheck = { ...paycheck, id: uid() };
    set((s) => ({ paychecks: [...s.paychecks, p] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updatePaycheck: (id, patch) => {
    set((s) => ({
      paychecks: s.paychecks.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deletePaycheck: (id) => {
    set((s) => ({ paychecks: s.paychecks.filter((p) => p.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addInvestmentHolding: (holding) => {
    const h: InvestmentHolding = { ...holding, id: uid() };
    set((s) => ({ investmentHoldings: [...s.investmentHoldings, h] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateInvestmentHolding: (id, patch) => {
    set((s) => ({
      investmentHoldings: s.investmentHoldings.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteInvestmentHolding: (id) => {
    set((s) => ({ investmentHoldings: s.investmentHoldings.filter((h) => h.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addMonthlyFinancialReview: (review) => {
    const r: MonthlyFinancialReview = { ...review, id: uid() };
    set((s) => ({ monthlyFinancialReviews: [...s.monthlyFinancialReviews, r] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateMonthlyFinancialReview: (id, patch) => {
    set((s) => ({
      monthlyFinancialReviews: s.monthlyFinancialReviews.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteMonthlyFinancialReview: (id) => {
    set((s) => ({ monthlyFinancialReviews: s.monthlyFinancialReviews.filter((r) => r.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addAccountPartition: (partition) => {
    const p: AccountPartition = { ...partition, id: uid() };
    set((s) => ({ accountPartitions: [...s.accountPartitions, p] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateAccountPartition: (id, patch) => {
    set((s) => ({
      accountPartitions: s.accountPartitions.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteAccountPartition: (id) => {
    set((s) => ({ accountPartitions: s.accountPartitions.filter((p) => p.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addFinancialPurchase: (purchase) => {
    const p: FinancialPurchase = { ...purchase, id: uid() };
    set((s) => {
      let accounts = s.financialAccounts;
      if (p.accountId) {
        const acct = accounts.find((a) => a.id === p.accountId);
        if (acct) {
          const delta = acct.type === "credit_card" ? p.amount : -p.amount;
          accounts = accounts.map((a) => a.id === p.accountId ? { ...a, balance: Math.max(0, a.balance + delta) } : a);
        }
      }
      return { financialPurchases: [...s.financialPurchases, p], financialAccounts: accounts };
    });
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateFinancialPurchase: (id, patch) => {
    const old = get().financialPurchases.find((p) => p.id === id);
    set((s) => {
      let accounts = s.financialAccounts;
      // Reverse the old purchase effect
      if (old?.accountId && old.amount) {
        const acct = accounts.find((a) => a.id === old.accountId);
        if (acct) {
          const delta = acct.type === "credit_card" ? -old.amount : old.amount;
          accounts = accounts.map((a) => a.id === old.accountId ? { ...a, balance: Math.max(0, a.balance + delta) } : a);
        }
      }
      const updated = { ...old!, ...patch };
      // Apply the new purchase effect
      if (updated.accountId && updated.amount) {
        const acct = accounts.find((a) => a.id === updated.accountId);
        if (acct) {
          const delta = acct.type === "credit_card" ? updated.amount : -updated.amount;
          accounts = accounts.map((a) => a.id === updated.accountId ? { ...a, balance: Math.max(0, a.balance + delta) } : a);
        }
      }
      return {
        financialPurchases: s.financialPurchases.map((p) => (p.id === id ? updated : p)),
        financialAccounts: accounts,
      };
    });
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteFinancialPurchase: (id) => {
    const p = get().financialPurchases.find((fp) => fp.id === id);
    set((s) => {
      let accounts = s.financialAccounts;
      if (p?.accountId && p.amount) {
        const acct = accounts.find((a) => a.id === p.accountId);
        if (acct) {
          const delta = acct.type === "credit_card" ? -p.amount : p.amount;
          accounts = accounts.map((a) => a.id === p.accountId ? { ...a, balance: Math.max(0, a.balance + delta) } : a);
        }
      }
      return { financialPurchases: s.financialPurchases.filter((fp) => fp.id !== id), financialAccounts: accounts };
    });
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addBudgetCategory: (cat) => {
    const c: BudgetCategory = { ...cat, id: uid() };
    set((s) => ({ budgetCategories: [...s.budgetCategories, c] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateBudgetCategory: (id, patch) => {
    set((s) => ({
      budgetCategories: s.budgetCategories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteBudgetCategory: (id) => {
    set((s) => ({
      budgetCategories: s.budgetCategories.filter((c) => c.id !== id),
      monthlyBudgetActuals: s.monthlyBudgetActuals.filter((a) => a.categoryId !== id),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },

  addMonthlyBudgetActual: (actual) => {
    const a: MonthlyBudgetActual = { ...actual, id: uid() };
    set((s) => ({ monthlyBudgetActuals: [...s.monthlyBudgetActuals, a] }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  updateMonthlyBudgetActual: (id, patch) => {
    set((s) => ({
      monthlyBudgetActuals: s.monthlyBudgetActuals.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  deleteMonthlyBudgetActual: (id) => {
    set((s) => ({ monthlyBudgetActuals: s.monthlyBudgetActuals.filter((a) => a.id !== id) }));
    persistLocal(get);
    scheduleCloudSave(get, set);
  },
  upsertMonthlyBudgetActual: (month, categoryId, amountSpent, notes) => {
    const existing = get().monthlyBudgetActuals.find(
      (a) => a.month === month && a.categoryId === categoryId
    );
    if (existing) {
      get().updateMonthlyBudgetActual(existing.id, { amountSpent, notes });
    } else {
      get().addMonthlyBudgetActual({ month, categoryId, amountSpent, notes });
    }
  },
}));
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import type { FullState } from "@/types/state";
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

import {
  seedTasks,
  seedVisionTiles,
  seedVisionGoals,
  seedBooks,
  seedReviews,
  seedPurchaseItems,
  seedFragrances,
  seedPackages,
} from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "dashboard.sqlite");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  seedIfEmpty(db);
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      due_date TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vision_tiles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_data_url TEXT,
      image_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vision_goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      why TEXT,
      target_date TEXT,
      status TEXT NOT NULL,
      progress INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      pages INTEGER,
      tags TEXT NOT NULL DEFAULT '[]',
      link TEXT,
      image_data_url TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      rating REAL NOT NULL,
      summary TEXT,
      takeaways TEXT NOT NULL DEFAULT '[]',
      favorite_quote TEXT,
      apply_this TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS reading_logs (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      date TEXT NOT NULL,
      chapter TEXT,
      pages_read INTEGER,
      up_to_page INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      est_price REAL,
      recurrence TEXT NOT NULL,
      last_purchased_at TEXT,
      next_purchase_at TEXT,
      link TEXT,
      priority INTEGER NOT NULL,
      notes TEXT,
      image_data_url TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS fragrances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      notes_top TEXT NOT NULL DEFAULT '[]',
      notes_mid TEXT NOT NULL DEFAULT '[]',
      notes_base TEXT NOT NULL DEFAULT '[]',
      season TEXT,
      seasons TEXT NOT NULL DEFAULT '[]',
      vibe_tags TEXT NOT NULL DEFAULT '[]',
      longevity REAL NOT NULL,
      projection REAL NOT NULL,
      price_range TEXT,
      link TEXT,
      sampled INTEGER NOT NULL DEFAULT 0,
      would_buy INTEGER NOT NULL DEFAULT 0,
      personal_notes TEXT,
      image_data_url TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      carrier TEXT,
      tracking_number TEXT,
      order_date TEXT,
      expected_delivery_date TEXT,
      status TEXT NOT NULL,
      link TEXT,
      notes TEXT,
      image_data_url TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      time TEXT,
      description TEXT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      notes TEXT,
      image_data_url TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      workout_type TEXT NOT NULL,
      target_muscles TEXT NOT NULL DEFAULT '[]',
      day TEXT,
      duration_minutes INTEGER,
      difficulty TEXT,
      notes TEXT,
      image_data_url TEXT,
      image_url TEXT,
      exercises TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      routine_type TEXT NOT NULL,
      day TEXT,
      start_time TEXT,
      end_time TEXT,
      notes TEXT,
      image_data_url TEXT,
      image_url TEXT,
      tasks TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      image_data_url TEXT,
      image_url TEXT,
      days TEXT NOT NULL DEFAULT '[]'
    );
  `);

  migrateBooks(database);
  migrateReadingLogs(database);
  migrateFragrances(database);
  migrateMeals(database);
  migrateWorkouts(database);
  migrateRoutines(database);
  migrateTrips(database);
}

function getColumnNames(database: Database.Database, table: string): Set<string> {
  const info = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return new Set(info.map((col) => col.name));
}

function migrateBooks(database: Database.Database) {
  const names = getColumnNames(database, "books");

  if (!names.has("image_data_url")) {
    database.prepare("ALTER TABLE books ADD COLUMN image_data_url TEXT").run();
  }
  if (!names.has("image_url")) {
    database.prepare("ALTER TABLE books ADD COLUMN image_url TEXT").run();
  }
}

function migrateReadingLogs(database: Database.Database) {
  const names = getColumnNames(database, "reading_logs");

  if (!names.has("chapter")) {
    database.prepare("ALTER TABLE reading_logs ADD COLUMN chapter TEXT").run();
  }
  if (!names.has("pages_read")) {
    database.prepare("ALTER TABLE reading_logs ADD COLUMN pages_read INTEGER").run();
  }
  if (!names.has("up_to_page")) {
    database.prepare("ALTER TABLE reading_logs ADD COLUMN up_to_page INTEGER").run();
  }
  if (!names.has("notes")) {
    database.prepare("ALTER TABLE reading_logs ADD COLUMN notes TEXT").run();
  }
  if (!names.has("created_at")) {
    database
      .prepare("ALTER TABLE reading_logs ADD COLUMN created_at TEXT NOT NULL DEFAULT ''")
      .run();
  }
}

function migrateFragrances(database: Database.Database) {
  const names = getColumnNames(database, "fragrances");

  if (!names.has("seasons")) {
    database
      .prepare("ALTER TABLE fragrances ADD COLUMN seasons TEXT NOT NULL DEFAULT '[]'")
      .run();
  }

  const rows = database.prepare("SELECT id, season, seasons FROM fragrances").all() as {
    id: string;
    season: string | null;
    seasons: string | null;
  }[];

  const update = database.prepare("UPDATE fragrances SET seasons = ? WHERE id = ?");

  for (const row of rows) {
    let parsed: unknown = [];

    try {
      parsed = JSON.parse(row.seasons || "[]");
    } catch {
      parsed = [];
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fallback = row.season ? JSON.stringify([row.season]) : JSON.stringify([]);
      update.run(fallback, row.id);
    }
  }
}

function migrateMeals(database: Database.Database) {
  const names = getColumnNames(database, "meals");

  if (!names.has("image_data_url")) {
    database.prepare("ALTER TABLE meals ADD COLUMN image_data_url TEXT").run();
  }
  if (!names.has("image_url")) {
    database.prepare("ALTER TABLE meals ADD COLUMN image_url TEXT").run();
  }
}

function migrateWorkouts(database: Database.Database) {
  const names = getColumnNames(database, "workouts");

  if (!names.has("target_muscles")) {
    database
      .prepare("ALTER TABLE workouts ADD COLUMN target_muscles TEXT NOT NULL DEFAULT '[]'")
      .run();
  }
  if (!names.has("day")) {
    database.prepare("ALTER TABLE workouts ADD COLUMN day TEXT").run();
  }
  if (!names.has("duration_minutes")) {
    database.prepare("ALTER TABLE workouts ADD COLUMN duration_minutes INTEGER").run();
  }
  if (!names.has("difficulty")) {
    database.prepare("ALTER TABLE workouts ADD COLUMN difficulty TEXT").run();
  }
  if (!names.has("notes")) {
    database.prepare("ALTER TABLE workouts ADD COLUMN notes TEXT").run();
  }
  if (!names.has("image_data_url")) {
    database.prepare("ALTER TABLE workouts ADD COLUMN image_data_url TEXT").run();
  }
  if (!names.has("image_url")) {
    database.prepare("ALTER TABLE workouts ADD COLUMN image_url TEXT").run();
  }
  if (!names.has("exercises")) {
    database
      .prepare("ALTER TABLE workouts ADD COLUMN exercises TEXT NOT NULL DEFAULT '[]'")
      .run();
  }
}

function migrateRoutines(database: Database.Database) {
  const names = getColumnNames(database, "routines");

  if (!names.has("day")) {
    database.prepare("ALTER TABLE routines ADD COLUMN day TEXT").run();
  }
  if (!names.has("start_time")) {
    database.prepare("ALTER TABLE routines ADD COLUMN start_time TEXT").run();
  }
  if (!names.has("end_time")) {
    database.prepare("ALTER TABLE routines ADD COLUMN end_time TEXT").run();
  }
  if (!names.has("notes")) {
    database.prepare("ALTER TABLE routines ADD COLUMN notes TEXT").run();
  }
  if (!names.has("image_data_url")) {
    database.prepare("ALTER TABLE routines ADD COLUMN image_data_url TEXT").run();
  }
  if (!names.has("image_url")) {
    database.prepare("ALTER TABLE routines ADD COLUMN image_url TEXT").run();
  }
  if (!names.has("tasks")) {
    database
      .prepare("ALTER TABLE routines ADD COLUMN tasks TEXT NOT NULL DEFAULT '[]'")
      .run();
  }
}

function migrateTrips(database: Database.Database) {
  const names = getColumnNames(database, "trips");

  if (!names.has("description")) {
    database.prepare("ALTER TABLE trips ADD COLUMN description TEXT").run();
  }
  if (!names.has("tags")) {
    database.prepare("ALTER TABLE trips ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'").run();
  }
  if (!names.has("image_data_url")) {
    database.prepare("ALTER TABLE trips ADD COLUMN image_data_url TEXT").run();
  }
  if (!names.has("image_url")) {
    database.prepare("ALTER TABLE trips ADD COLUMN image_url TEXT").run();
  }
  if (!names.has("days")) {
    database.prepare("ALTER TABLE trips ADD COLUMN days TEXT NOT NULL DEFAULT '[]'").run();
  }
}

function seedIfEmpty(database: Database.Database) {
  const count = database.prepare("SELECT COUNT(*) as c FROM tasks").get() as { c: number };
  if (count.c > 0) return;

  const insTask = database.prepare(
    "INSERT INTO tasks (id, title, notes, due_date, priority, status, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedTasks.forEach((t) =>
    insTask.run(
      t.id,
      t.title,
      t.notes ?? null,
      t.dueDate ?? null,
      t.priority,
      t.status,
      JSON.stringify(t.tags),
      t.createdAt,
      t.updatedAt
    )
  );

  const insTile = database.prepare(
    "INSERT INTO vision_tiles (id, title, category, image_data_url, image_url, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  seedVisionTiles.forEach((t) =>
    insTile.run(
      t.id,
      t.title,
      t.category,
      t.imageDataUrl ?? null,
      t.imageUrl ?? null,
      t.notes ?? null,
      t.createdAt
    )
  );

  const insGoal = database.prepare(
    "INSERT INTO vision_goals (id, title, category, why, target_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedVisionGoals.forEach((g) =>
    insGoal.run(
      g.id,
      g.title,
      g.category,
      g.why ?? null,
      g.targetDate ?? null,
      g.status,
      g.progress ?? null,
      g.createdAt,
      g.updatedAt
    )
  );

  const insBook = database.prepare(
    "INSERT INTO books (id, title, author, type, status, pages, tags, link, image_data_url, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedBooks.forEach((b) =>
    insBook.run(
      b.id,
      b.title,
      b.author,
      b.type,
      b.status,
      b.pages ?? null,
      JSON.stringify(b.tags),
      b.link ?? null,
      b.imageDataUrl ?? null,
      b.imageUrl ?? null,
      b.createdAt,
      b.updatedAt
    )
  );

  const insReview = database.prepare(
    "INSERT INTO reviews (id, book_id, rating, summary, takeaways, favorite_quote, apply_this, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedReviews.forEach((r) =>
    insReview.run(
      r.id,
      r.bookId,
      r.rating,
      r.summary ?? null,
      JSON.stringify(r.takeaways),
      r.favoriteQuote ?? null,
      r.applyThis ?? null,
      r.createdAt
    )
  );

  const insPurchase = database.prepare(
    "INSERT INTO purchase_items (id, name, category, est_price, recurrence, last_purchased_at, next_purchase_at, link, priority, notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedPurchaseItems.forEach((p) =>
    insPurchase.run(
      p.id,
      p.name,
      p.category,
      p.estPrice ?? null,
      p.recurrence,
      p.lastPurchasedAt ?? null,
      p.nextPurchaseAt ?? null,
      p.link ?? null,
      p.priority,
      p.notes ?? null,
      p.imageDataUrl ?? null,
      p.imageUrl ?? null
    )
  );

  const insFragrance = database.prepare(
    "INSERT INTO fragrances (id, name, brand, notes_top, notes_mid, notes_base, season, seasons, vibe_tags, longevity, projection, price_range, link, sampled, would_buy, personal_notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedFragrances.forEach((f) => {
    const seasons =
      Array.isArray(f.seasons) && f.seasons.length > 0
        ? f.seasons
        : f.season
          ? [f.season]
          : [];

    insFragrance.run(
      f.id,
      f.name,
      f.brand,
      JSON.stringify(f.notesTop),
      JSON.stringify(f.notesMid),
      JSON.stringify(f.notesBase),
      seasons[0] ?? null,
      JSON.stringify(seasons),
      JSON.stringify(f.vibeTags),
      f.longevity,
      f.projection,
      f.priceRange ?? null,
      f.link ?? null,
      f.sampled ? 1 : 0,
      f.wouldBuy ? 1 : 0,
      f.personalNotes ?? null,
      f.imageDataUrl ?? null,
      f.imageUrl ?? null
    );
  });

  const insPackage = database.prepare(
    "INSERT INTO packages (id, item_name, carrier, tracking_number, order_date, expected_delivery_date, status, link, notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedPackages.forEach((p) =>
    insPackage.run(
      p.id,
      p.itemName,
      p.carrier ?? null,
      p.trackingNumber ?? null,
      p.orderDate ?? null,
      p.expectedDeliveryDate ?? null,
      p.status,
      p.link ?? null,
      p.notes ?? null,
      p.imageDataUrl ?? null,
      p.imageUrl ?? null
    )
  );
}

function parseJsonArray<T>(value: unknown, fallback: T[] = []): T[] {
  try {
    const parsed = JSON.parse((value as string) || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function rowToTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    notes: (r.notes as string) ?? undefined,
    dueDate: (r.due_date as string) ?? undefined,
    priority: r.priority as Task["priority"],
    status: r.status as Task["status"],
    tags: parseJsonArray<string>(r.tags),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToVisionTile(r: Record<string, unknown>): VisionTile {
  return {
    id: r.id as string,
    title: r.title as string,
    category: r.category as VisionTile["category"],
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function rowToVisionGoal(r: Record<string, unknown>): VisionGoal {
  return {
    id: r.id as string,
    title: r.title as string,
    category: r.category as VisionGoal["category"],
    why: (r.why as string) ?? undefined,
    targetDate: (r.target_date as string) ?? undefined,
    status: r.status as VisionGoal["status"],
    progress: (r.progress as number) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToBook(r: Record<string, unknown>): Book {
  return {
    id: r.id as string,
    title: r.title as string,
    author: r.author as string,
    type: r.type as Book["type"],
    status: r.status as Book["status"],
    pages: (r.pages as number) ?? undefined,
    tags: parseJsonArray<string>(r.tags),
    link: (r.link as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    bookId: r.book_id as string,
    rating: r.rating as number,
    summary: (r.summary as string) ?? undefined,
    takeaways: parseJsonArray<string>(r.takeaways),
    favoriteQuote: (r.favorite_quote as string) ?? undefined,
    applyThis: (r.apply_this as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function rowToReadingLog(r: Record<string, unknown>): ReadingLog {
  return {
    id: r.id as string,
    bookId: r.book_id as string,
    date: r.date as string,
    chapter: (r.chapter as string) ?? undefined,
    pagesRead: (r.pages_read as number) ?? undefined,
    upToPage: (r.up_to_page as number) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function rowToPurchase(r: Record<string, unknown>): PurchaseItem {
  return {
    id: r.id as string,
    name: r.name as string,
    category: r.category as string,
    estPrice: (r.est_price as number) ?? undefined,
    recurrence: r.recurrence as PurchaseItem["recurrence"],
    lastPurchasedAt: (r.last_purchased_at as string) ?? undefined,
    nextPurchaseAt: (r.next_purchase_at as string) ?? undefined,
    link: (r.link as string) ?? undefined,
    priority: r.priority as number,
    notes: (r.notes as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
  };
}

function rowToFragrance(r: Record<string, unknown>): Fragrance {
  const seasons = parseJsonArray<FragranceSeason>(r.seasons);

  return {
    id: r.id as string,
    name: r.name as string,
    brand: r.brand as string,
    notesTop: parseJsonArray<string>(r.notes_top),
    notesMid: parseJsonArray<string>(r.notes_mid),
    notesBase: parseJsonArray<string>(r.notes_base),
    season: ((r.season as FragranceSeason | null) ?? seasons[0]) ?? undefined,
    seasons,
    vibeTags: parseJsonArray<string>(r.vibe_tags),
    longevity: r.longevity as number,
    projection: r.projection as number,
    priceRange: (r.price_range as string) ?? undefined,
    link: (r.link as string) ?? undefined,
    sampled: (r.sampled as number) === 1,
    wouldBuy: (r.would_buy as number) === 1,
    personalNotes: (r.personal_notes as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
  };
}

function rowToPackage(r: Record<string, unknown>): Package {
  return {
    id: r.id as string,
    itemName: r.item_name as string,
    carrier: (r.carrier as string) ?? undefined,
    trackingNumber: (r.tracking_number as string) ?? undefined,
    orderDate: (r.order_date as string) ?? undefined,
    expectedDeliveryDate: (r.expected_delivery_date as string) ?? undefined,
    status: r.status as Package["status"],
    link: (r.link as string) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
  };
}

function rowToMeal(r: Record<string, unknown>): Meal {
  return {
    id: r.id as string,
    title: r.title as string,
    date: r.date as string,
    mealType: r.meal_type as Meal["mealType"],
    time: (r.time as string) ?? undefined,
    description: (r.description as string) ?? undefined,
    calories: (r.calories as number) ?? undefined,
    protein: (r.protein as number) ?? undefined,
    carbs: (r.carbs as number) ?? undefined,
    fat: (r.fat as number) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
  };
}

function rowToWorkout(r: Record<string, unknown>): WorkoutPlan {
  return {
    id: r.id as string,
    title: r.title as string,
    workoutType: r.workout_type as WorkoutPlan["workoutType"],
    targetMuscles: parseJsonArray<string>(r.target_muscles),
    day: (r.day as WorkoutPlan["day"]) ?? undefined,
    durationMinutes: (r.duration_minutes as number) ?? undefined,
    difficulty: (r.difficulty as WorkoutPlan["difficulty"]) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    exercises: parseJsonArray<WorkoutPlan["exercises"][number]>(r.exercises),
  };
}

function rowToRoutine(r: Record<string, unknown>): Routine {
  return {
    id: r.id as string,
    title: r.title as string,
    routineType: r.routine_type as Routine["routineType"],
    day: (r.day as Routine["day"]) ?? undefined,
    startTime: (r.start_time as string) ?? undefined,
    endTime: (r.end_time as string) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    tasks: parseJsonArray<Routine["tasks"][number]>(r.tasks),
  };
}

function rowToTrip(r: Record<string, unknown>): TravelTrip {
  return {
    id: r.id as string,
    title: r.title as string,
    destination: r.destination as string,
    description: (r.description as string) ?? undefined,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    status: r.status as TravelTrip["status"],
    tags: parseJsonArray<string>(r.tags),
    imageDataUrl: (r.image_data_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    days: parseJsonArray<TravelTrip["days"][number]>(r.days),
  };
}

export type { FullState };

export function loadFullState(): FullState {
  const database = getDb();

  const tasks = (database.prepare("SELECT * FROM tasks").all() as Record<string, unknown>[]).map(rowToTask);
  const visionTiles = (database.prepare("SELECT * FROM vision_tiles").all() as Record<string, unknown>[]).map(rowToVisionTile);
  const visionGoals = (database.prepare("SELECT * FROM vision_goals").all() as Record<string, unknown>[]).map(rowToVisionGoal);
  const books = (database.prepare("SELECT * FROM books").all() as Record<string, unknown>[]).map(rowToBook);
  const reviews = (database.prepare("SELECT * FROM reviews").all() as Record<string, unknown>[]).map(rowToReview);
  const readingLogs = (database.prepare("SELECT * FROM reading_logs").all() as Record<string, unknown>[]).map(rowToReadingLog);
  const purchaseItems = (database.prepare("SELECT * FROM purchase_items").all() as Record<string, unknown>[]).map(rowToPurchase);
  const fragrances = (database.prepare("SELECT * FROM fragrances").all() as Record<string, unknown>[]).map(rowToFragrance);
  const packages = (database.prepare("SELECT * FROM packages").all() as Record<string, unknown>[]).map(rowToPackage);
  const meals = (database.prepare("SELECT * FROM meals").all() as Record<string, unknown>[]).map(rowToMeal);
  const workouts = (database.prepare("SELECT * FROM workouts").all() as Record<string, unknown>[]).map(rowToWorkout);
  const routines = (database.prepare("SELECT * FROM routines").all() as Record<string, unknown>[]).map(rowToRoutine);
  const trips = (database.prepare("SELECT * FROM trips").all() as Record<string, unknown>[]).map(rowToTrip);

  return {
    tasks,
    visionTiles,
    visionGoals,
    books,
    reviews,
    readingLogs,
    purchaseItems,
    fragrances,
    packages,
    meals,
    workouts,
    routines,
    trips,
  };
}

export function insertTask(task: Task): void {
  getDb()
    .prepare(
      "INSERT INTO tasks (id, title, notes, due_date, priority, status, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      task.id,
      task.title,
      task.notes ?? null,
      task.dueDate ?? null,
      task.priority,
      task.status,
      JSON.stringify(task.tags),
      task.createdAt,
      task.updatedAt
    );
}

export function updateTask(id: string, patch: Partial<Task>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Task = {
    ...rowToTask(row),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  database
    .prepare(
      "UPDATE tasks SET title=?, notes=?, due_date=?, priority=?, status=?, tags=?, updated_at=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.notes ?? null,
      updated.dueDate ?? null,
      updated.priority,
      updated.status,
      JSON.stringify(updated.tags),
      updated.updatedAt,
      id
    );
}

export function deleteTask(id: string): void {
  getDb().prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

export function insertVisionTile(tile: VisionTile): void {
  getDb()
    .prepare(
      "INSERT INTO vision_tiles (id, title, category, image_data_url, image_url, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      tile.id,
      tile.title,
      tile.category,
      tile.imageDataUrl ?? null,
      tile.imageUrl ?? null,
      tile.notes ?? null,
      tile.createdAt
    );
}

export function updateVisionTile(id: string, patch: Partial<VisionTile>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM vision_tiles WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated = { ...rowToVisionTile(row), ...patch };

  database
    .prepare("UPDATE vision_tiles SET title=?, category=?, image_data_url=?, image_url=?, notes=? WHERE id=?")
    .run(
      updated.title,
      updated.category,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      updated.notes ?? null,
      id
    );
}

export function deleteVisionTile(id: string): void {
  getDb().prepare("DELETE FROM vision_tiles WHERE id = ?").run(id);
}

export function insertVisionGoal(goal: VisionGoal): void {
  getDb()
    .prepare(
      "INSERT INTO vision_goals (id, title, category, why, target_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      goal.id,
      goal.title,
      goal.category,
      goal.why ?? null,
      goal.targetDate ?? null,
      goal.status,
      goal.progress ?? null,
      goal.createdAt,
      goal.updatedAt
    );
}

export function updateVisionGoal(id: string, patch: Partial<VisionGoal>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM vision_goals WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: VisionGoal = {
    ...rowToVisionGoal(row),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  database
    .prepare(
      "UPDATE vision_goals SET title=?, category=?, why=?, target_date=?, status=?, progress=?, updated_at=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.category,
      updated.why ?? null,
      updated.targetDate ?? null,
      updated.status,
      updated.progress ?? null,
      updated.updatedAt,
      id
    );
}

export function deleteVisionGoal(id: string): void {
  getDb().prepare("DELETE FROM vision_goals WHERE id = ?").run(id);
}

export function insertBook(book: Book): void {
  getDb()
    .prepare(
      "INSERT INTO books (id, title, author, type, status, pages, tags, link, image_data_url, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      book.id,
      book.title,
      book.author,
      book.type,
      book.status,
      book.pages ?? null,
      JSON.stringify(book.tags),
      book.link ?? null,
      book.imageDataUrl ?? null,
      book.imageUrl ?? null,
      book.createdAt,
      book.updatedAt
    );
}

export function updateBook(id: string, patch: Partial<Book>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM books WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Book = {
    ...rowToBook(row),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  database
    .prepare(
      "UPDATE books SET title=?, author=?, type=?, status=?, pages=?, tags=?, link=?, image_data_url=?, image_url=?, updated_at=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.author,
      updated.type,
      updated.status,
      updated.pages ?? null,
      JSON.stringify(updated.tags),
      updated.link ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      updated.updatedAt,
      id
    );
}

export function deleteBook(id: string): void {
  const database = getDb();
  database.prepare("DELETE FROM reading_logs WHERE book_id = ?").run(id);
  database.prepare("DELETE FROM reviews WHERE book_id = ?").run(id);
  database.prepare("DELETE FROM books WHERE id = ?").run(id);
}

export function insertReview(review: Review): void {
  getDb()
    .prepare(
      "INSERT INTO reviews (id, book_id, rating, summary, takeaways, favorite_quote, apply_this, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      review.id,
      review.bookId,
      review.rating,
      review.summary ?? null,
      JSON.stringify(review.takeaways),
      review.favoriteQuote ?? null,
      review.applyThis ?? null,
      review.createdAt
    );
}

export function updateReview(id: string, patch: Partial<Review>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM reviews WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Review = {
    ...rowToReview(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE reviews SET book_id=?, rating=?, summary=?, takeaways=?, favorite_quote=?, apply_this=? WHERE id=?"
    )
    .run(
      updated.bookId,
      updated.rating,
      updated.summary ?? null,
      JSON.stringify(updated.takeaways),
      updated.favoriteQuote ?? null,
      updated.applyThis ?? null,
      id
    );
}

export function deleteReview(id: string): void {
  getDb().prepare("DELETE FROM reviews WHERE id = ?").run(id);
}

export function insertReadingLog(log: ReadingLog): void {
  getDb()
    .prepare(
      "INSERT INTO reading_logs (id, book_id, date, chapter, pages_read, up_to_page, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      log.id,
      log.bookId,
      log.date,
      log.chapter ?? null,
      log.pagesRead ?? null,
      log.upToPage ?? null,
      log.notes ?? null,
      log.createdAt
    );
}

export function updateReadingLog(id: string, patch: Partial<ReadingLog>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM reading_logs WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: ReadingLog = {
    ...rowToReadingLog(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE reading_logs SET book_id=?, date=?, chapter=?, pages_read=?, up_to_page=?, notes=?, created_at=? WHERE id=?"
    )
    .run(
      updated.bookId,
      updated.date,
      updated.chapter ?? null,
      updated.pagesRead ?? null,
      updated.upToPage ?? null,
      updated.notes ?? null,
      updated.createdAt,
      id
    );
}

export function deleteReadingLog(id: string): void {
  getDb().prepare("DELETE FROM reading_logs WHERE id = ?").run(id);
}

export function insertPurchase(item: PurchaseItem): void {
  getDb()
    .prepare(
      "INSERT INTO purchase_items (id, name, category, est_price, recurrence, last_purchased_at, next_purchase_at, link, priority, notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      item.id,
      item.name,
      item.category,
      item.estPrice ?? null,
      item.recurrence,
      item.lastPurchasedAt ?? null,
      item.nextPurchaseAt ?? null,
      item.link ?? null,
      item.priority,
      item.notes ?? null,
      item.imageDataUrl ?? null,
      item.imageUrl ?? null
    );
}

export function updatePurchase(id: string, patch: Partial<PurchaseItem>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM purchase_items WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: PurchaseItem = {
    ...rowToPurchase(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE purchase_items SET name=?, category=?, est_price=?, recurrence=?, last_purchased_at=?, next_purchase_at=?, link=?, priority=?, notes=?, image_data_url=?, image_url=? WHERE id=?"
    )
    .run(
      updated.name,
      updated.category,
      updated.estPrice ?? null,
      updated.recurrence,
      updated.lastPurchasedAt ?? null,
      updated.nextPurchaseAt ?? null,
      updated.link ?? null,
      updated.priority,
      updated.notes ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      id
    );
}

export function deletePurchase(id: string): void {
  getDb().prepare("DELETE FROM purchase_items WHERE id = ?").run(id);
}

export function insertFragrance(fragrance: Fragrance): void {
  const seasons =
    Array.isArray(fragrance.seasons) && fragrance.seasons.length > 0
      ? fragrance.seasons
      : fragrance.season
        ? [fragrance.season]
        : [];

  getDb()
    .prepare(
      "INSERT INTO fragrances (id, name, brand, notes_top, notes_mid, notes_base, season, seasons, vibe_tags, longevity, projection, price_range, link, sampled, would_buy, personal_notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      fragrance.id,
      fragrance.name,
      fragrance.brand,
      JSON.stringify(fragrance.notesTop),
      JSON.stringify(fragrance.notesMid),
      JSON.stringify(fragrance.notesBase),
      seasons[0] ?? null,
      JSON.stringify(seasons),
      JSON.stringify(fragrance.vibeTags),
      fragrance.longevity,
      fragrance.projection,
      fragrance.priceRange ?? null,
      fragrance.link ?? null,
      fragrance.sampled ? 1 : 0,
      fragrance.wouldBuy ? 1 : 0,
      fragrance.personalNotes ?? null,
      fragrance.imageDataUrl ?? null,
      fragrance.imageUrl ?? null
    );
}

export function updateFragrance(id: string, patch: Partial<Fragrance>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM fragrances WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Fragrance = {
    ...rowToFragrance(row),
    ...patch,
  };

  const seasons =
    Array.isArray(updated.seasons) && updated.seasons.length > 0
      ? updated.seasons
      : updated.season
        ? [updated.season]
        : [];

  database
    .prepare(
      "UPDATE fragrances SET name=?, brand=?, notes_top=?, notes_mid=?, notes_base=?, season=?, seasons=?, vibe_tags=?, longevity=?, projection=?, price_range=?, link=?, sampled=?, would_buy=?, personal_notes=?, image_data_url=?, image_url=? WHERE id=?"
    )
    .run(
      updated.name,
      updated.brand,
      JSON.stringify(updated.notesTop),
      JSON.stringify(updated.notesMid),
      JSON.stringify(updated.notesBase),
      seasons[0] ?? null,
      JSON.stringify(seasons),
      JSON.stringify(updated.vibeTags),
      updated.longevity,
      updated.projection,
      updated.priceRange ?? null,
      updated.link ?? null,
      updated.sampled ? 1 : 0,
      updated.wouldBuy ? 1 : 0,
      updated.personalNotes ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      id
    );
}

export function deleteFragrance(id: string): void {
  getDb().prepare("DELETE FROM fragrances WHERE id = ?").run(id);
}

export function insertPackage(pkg: Package): void {
  getDb()
    .prepare(
      "INSERT INTO packages (id, item_name, carrier, tracking_number, order_date, expected_delivery_date, status, link, notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      pkg.id,
      pkg.itemName,
      pkg.carrier ?? null,
      pkg.trackingNumber ?? null,
      pkg.orderDate ?? null,
      pkg.expectedDeliveryDate ?? null,
      pkg.status,
      pkg.link ?? null,
      pkg.notes ?? null,
      pkg.imageDataUrl ?? null,
      pkg.imageUrl ?? null
    );
}

export function updatePackage(id: string, patch: Partial<Package>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM packages WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Package = {
    ...rowToPackage(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE packages SET item_name=?, carrier=?, tracking_number=?, order_date=?, expected_delivery_date=?, status=?, link=?, notes=?, image_data_url=?, image_url=? WHERE id=?"
    )
    .run(
      updated.itemName,
      updated.carrier ?? null,
      updated.trackingNumber ?? null,
      updated.orderDate ?? null,
      updated.expectedDeliveryDate ?? null,
      updated.status,
      updated.link ?? null,
      updated.notes ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      id
    );
}

export function deletePackage(id: string): void {
  getDb().prepare("DELETE FROM packages WHERE id = ?").run(id);
}

export function insertMeal(meal: Meal): void {
  getDb()
    .prepare(
      "INSERT INTO meals (id, title, date, meal_type, time, description, calories, protein, carbs, fat, notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      meal.id,
      meal.title,
      meal.date,
      meal.mealType,
      meal.time ?? null,
      meal.description ?? null,
      meal.calories ?? null,
      meal.protein ?? null,
      meal.carbs ?? null,
      meal.fat ?? null,
      meal.notes ?? null,
      meal.imageDataUrl ?? null,
      meal.imageUrl ?? null
    );
}

export function updateMeal(id: string, patch: Partial<Meal>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM meals WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Meal = {
    ...rowToMeal(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE meals SET title=?, date=?, meal_type=?, time=?, description=?, calories=?, protein=?, carbs=?, fat=?, notes=?, image_data_url=?, image_url=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.date,
      updated.mealType,
      updated.time ?? null,
      updated.description ?? null,
      updated.calories ?? null,
      updated.protein ?? null,
      updated.carbs ?? null,
      updated.fat ?? null,
      updated.notes ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      id
    );
}

export function deleteMeal(id: string): void {
  getDb().prepare("DELETE FROM meals WHERE id = ?").run(id);
}

export function insertWorkout(workout: WorkoutPlan): void {
  getDb()
    .prepare(
      "INSERT INTO workouts (id, title, workout_type, target_muscles, day, duration_minutes, difficulty, notes, image_data_url, image_url, exercises) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      workout.id,
      workout.title,
      workout.workoutType,
      JSON.stringify(workout.targetMuscles),
      workout.day ?? null,
      workout.durationMinutes ?? null,
      workout.difficulty ?? null,
      workout.notes ?? null,
      workout.imageDataUrl ?? null,
      workout.imageUrl ?? null,
      JSON.stringify(workout.exercises)
    );
}

export function updateWorkout(id: string, patch: Partial<WorkoutPlan>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM workouts WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: WorkoutPlan = {
    ...rowToWorkout(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE workouts SET title=?, workout_type=?, target_muscles=?, day=?, duration_minutes=?, difficulty=?, notes=?, image_data_url=?, image_url=?, exercises=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.workoutType,
      JSON.stringify(updated.targetMuscles),
      updated.day ?? null,
      updated.durationMinutes ?? null,
      updated.difficulty ?? null,
      updated.notes ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      JSON.stringify(updated.exercises),
      id
    );
}

export function deleteWorkout(id: string): void {
  getDb().prepare("DELETE FROM workouts WHERE id = ?").run(id);
}

export function insertRoutine(routine: Routine): void {
  getDb()
    .prepare(
      "INSERT INTO routines (id, title, routine_type, day, start_time, end_time, notes, image_data_url, image_url, tasks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      routine.id,
      routine.title,
      routine.routineType,
      routine.day ?? null,
      routine.startTime ?? null,
      routine.endTime ?? null,
      routine.notes ?? null,
      routine.imageDataUrl ?? null,
      routine.imageUrl ?? null,
      JSON.stringify(routine.tasks)
    );
}

export function updateRoutine(id: string, patch: Partial<Routine>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM routines WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: Routine = {
    ...rowToRoutine(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE routines SET title=?, routine_type=?, day=?, start_time=?, end_time=?, notes=?, image_data_url=?, image_url=?, tasks=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.routineType,
      updated.day ?? null,
      updated.startTime ?? null,
      updated.endTime ?? null,
      updated.notes ?? null,
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      JSON.stringify(updated.tasks),
      id
    );
}

export function deleteRoutine(id: string): void {
  getDb().prepare("DELETE FROM routines WHERE id = ?").run(id);
}

export function insertTrip(trip: TravelTrip): void {
  getDb()
    .prepare(
      "INSERT INTO trips (id, title, destination, description, start_date, end_date, status, tags, image_data_url, image_url, days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      trip.id,
      trip.title,
      trip.destination,
      trip.description ?? null,
      trip.startDate,
      trip.endDate,
      trip.status,
      JSON.stringify(trip.tags),
      trip.imageDataUrl ?? null,
      trip.imageUrl ?? null,
      JSON.stringify(trip.days)
    );
}

export function updateTrip(id: string, patch: Partial<TravelTrip>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM trips WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;

  const updated: TravelTrip = {
    ...rowToTrip(row),
    ...patch,
  };

  database
    .prepare(
      "UPDATE trips SET title=?, destination=?, description=?, start_date=?, end_date=?, status=?, tags=?, image_data_url=?, image_url=?, days=? WHERE id=?"
    )
    .run(
      updated.title,
      updated.destination,
      updated.description ?? null,
      updated.startDate,
      updated.endDate,
      updated.status,
      JSON.stringify(updated.tags),
      updated.imageDataUrl ?? null,
      updated.imageUrl ?? null,
      JSON.stringify(updated.days),
      id
    );
}

export function deleteTrip(id: string): void {
  getDb().prepare("DELETE FROM trips WHERE id = ?").run(id);
}

export function clearAllData(): void {
  const database = getDb();
  database.exec(`
    DELETE FROM reading_logs;
    DELETE FROM reviews;
    DELETE FROM books;
    DELETE FROM tasks;
    DELETE FROM vision_tiles;
    DELETE FROM vision_goals;
    DELETE FROM purchase_items;
    DELETE FROM fragrances;
    DELETE FROM packages;
    DELETE FROM meals;
    DELETE FROM workouts;
    DELETE FROM routines;
    DELETE FROM trips;
  `);
}

export function resetToSeed(): void {
  clearAllData();
  seedIfEmpty(getDb());
}
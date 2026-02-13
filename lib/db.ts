import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { FullState } from "@/types/state";
import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance } from "@/types/fragrances";
import type { Package } from "@/types/packages";
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

function getDb(): Database.Database {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
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
      rating INTEGER NOT NULL,
      summary TEXT,
      takeaways TEXT NOT NULL DEFAULT '[]',
      favorite_quote TEXT,
      apply_this TEXT,
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
      season TEXT NOT NULL,
      vibe_tags TEXT NOT NULL DEFAULT '[]',
      longevity INTEGER NOT NULL,
      projection INTEGER NOT NULL,
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
  `);
  migrateBooks(database);
}

function migrateBooks(database: Database.Database) {
  const info = database.prepare("PRAGMA table_info(books)").all() as { name: string }[];
  const names = new Set(info.map((c) => c.name));
  if (!names.has("image_data_url")) database.prepare("ALTER TABLE books ADD COLUMN image_data_url TEXT").run();
  if (!names.has("image_url")) database.prepare("ALTER TABLE books ADD COLUMN image_url TEXT").run();
}

function seedIfEmpty(database: Database.Database) {
  const count = database.prepare("SELECT COUNT(*) as c FROM tasks").get() as { c: number };
  if (count.c > 0) return;
  const insTask = database.prepare(
    "INSERT INTO tasks (id, title, notes, due_date, priority, status, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedTasks.forEach((t) =>
    insTask.run(t.id, t.title, t.notes ?? null, t.dueDate ?? null, t.priority, t.status, JSON.stringify(t.tags), t.createdAt, t.updatedAt)
  );
  const insTile = database.prepare(
    "INSERT INTO vision_tiles (id, title, category, image_data_url, image_url, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  seedVisionTiles.forEach((t) =>
    insTile.run(t.id, t.title, t.category, t.imageDataUrl ?? null, t.imageUrl ?? null, t.notes ?? null, t.createdAt)
  );
  const insGoal = database.prepare(
    "INSERT INTO vision_goals (id, title, category, why, target_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedVisionGoals.forEach((g) =>
    insGoal.run(g.id, g.title, g.category, g.why ?? null, g.targetDate ?? null, g.status, g.progress ?? null, g.createdAt, g.updatedAt)
  );
  const insBook = database.prepare(
    "INSERT INTO books (id, title, author, type, status, pages, tags, link, image_data_url, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedBooks.forEach((b) =>
    insBook.run(b.id, b.title, b.author, b.type, b.status, b.pages ?? null, JSON.stringify(b.tags), b.link ?? null, b.imageDataUrl ?? null, b.imageUrl ?? null, b.createdAt, b.updatedAt)
  );
  const insReview = database.prepare(
    "INSERT INTO reviews (id, book_id, rating, summary, takeaways, favorite_quote, apply_this, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedReviews.forEach((r) =>
    insReview.run(r.id, r.bookId, r.rating, r.summary ?? null, JSON.stringify(r.takeaways), r.favoriteQuote ?? null, r.applyThis ?? null, r.createdAt)
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
    "INSERT INTO fragrances (id, name, brand, notes_top, notes_mid, notes_base, season, vibe_tags, longevity, projection, price_range, link, sampled, would_buy, personal_notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  seedFragrances.forEach((f) =>
    insFragrance.run(
      f.id,
      f.name,
      f.brand,
      JSON.stringify(f.notesTop),
      JSON.stringify(f.notesMid),
      JSON.stringify(f.notesBase),
      f.season,
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
    )
  );
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

// Row to type helpers
function rowToTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    notes: (r.notes as string) ?? undefined,
    dueDate: (r.due_date as string) ?? undefined,
    priority: r.priority as Task["priority"],
    status: r.status as Task["status"],
    tags: JSON.parse((r.tags as string) || "[]"),
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
    tags: JSON.parse((r.tags as string) || "[]"),
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
    takeaways: JSON.parse((r.takeaways as string) || "[]"),
    favoriteQuote: (r.favorite_quote as string) ?? undefined,
    applyThis: (r.apply_this as string) ?? undefined,
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
  return {
    id: r.id as string,
    name: r.name as string,
    brand: r.brand as string,
    notesTop: JSON.parse((r.notes_top as string) || "[]"),
    notesMid: JSON.parse((r.notes_mid as string) || "[]"),
    notesBase: JSON.parse((r.notes_base as string) || "[]"),
    season: r.season as Fragrance["season"],
    vibeTags: JSON.parse((r.vibe_tags as string) || "[]"),
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

export type { FullState };
export function loadFullState(): FullState {
  const database = getDb();
  const tasks = (database.prepare("SELECT * FROM tasks").all() as Record<string, unknown>[]).map(rowToTask);
  const visionTiles = (database.prepare("SELECT * FROM vision_tiles").all() as Record<string, unknown>[]).map(rowToVisionTile);
  const visionGoals = (database.prepare("SELECT * FROM vision_goals").all() as Record<string, unknown>[]).map(rowToVisionGoal);
  const books = (database.prepare("SELECT * FROM books").all() as Record<string, unknown>[]).map(rowToBook);
  const reviews = (database.prepare("SELECT * FROM reviews").all() as Record<string, unknown>[]).map(rowToReview);
  const purchaseItems = (database.prepare("SELECT * FROM purchase_items").all() as Record<string, unknown>[]).map(rowToPurchase);
  const fragrances = (database.prepare("SELECT * FROM fragrances").all() as Record<string, unknown>[]).map(rowToFragrance);
  const packages = (database.prepare("SELECT * FROM packages").all() as Record<string, unknown>[]).map(rowToPackage);
  return {
    tasks,
    visionTiles,
    visionGoals,
    books,
    reviews,
    purchaseItems,
    fragrances,
    packages,
  };
}

export function insertTask(task: Task): void {
  const database = getDb();
  database
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
  const updated: Task = { ...rowToTask(row), ...patch, updatedAt: new Date().toISOString() };
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
  const database = getDb();
  database
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
  const database = getDb();
  database
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
  const updated = { ...rowToVisionGoal(row), ...patch, updatedAt: new Date().toISOString() };
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
  const database = getDb();
  database
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
  const updated = { ...rowToBook(row), ...patch, updatedAt: new Date().toISOString() };
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
  getDb().prepare("DELETE FROM reviews WHERE book_id = ?").run(id);
  getDb().prepare("DELETE FROM books WHERE id = ?").run(id);
}

export function insertReview(review: Review): void {
  const database = getDb();
  database
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
  const updated = { ...rowToReview(row), ...patch };
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

export function insertPurchase(item: PurchaseItem): void {
  const database = getDb();
  database
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
  const updated = { ...rowToPurchase(row), ...patch };
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

export function insertFragrance(f: Fragrance): void {
  const database = getDb();
  database
    .prepare(
      "INSERT INTO fragrances (id, name, brand, notes_top, notes_mid, notes_base, season, vibe_tags, longevity, projection, price_range, link, sampled, would_buy, personal_notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      f.id,
      f.name,
      f.brand,
      JSON.stringify(f.notesTop),
      JSON.stringify(f.notesMid),
      JSON.stringify(f.notesBase),
      f.season,
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
}
export function updateFragrance(id: string, patch: Partial<Fragrance>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM fragrances WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;
  const updated = { ...rowToFragrance(row), ...patch };
  database
    .prepare(
      "UPDATE fragrances SET name=?, brand=?, notes_top=?, notes_mid=?, notes_base=?, season=?, vibe_tags=?, longevity=?, projection=?, price_range=?, link=?, sampled=?, would_buy=?, personal_notes=?, image_data_url=?, image_url=? WHERE id=?"
    )
    .run(
      updated.name,
      updated.brand,
      JSON.stringify(updated.notesTop),
      JSON.stringify(updated.notesMid),
      JSON.stringify(updated.notesBase),
      updated.season,
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

export function insertPackage(p: Package): void {
  const database = getDb();
  database
    .prepare(
      "INSERT INTO packages (id, item_name, carrier, tracking_number, order_date, expected_delivery_date, status, link, notes, image_data_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
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
    );
}
export function updatePackage(id: string, patch: Partial<Package>): void {
  const database = getDb();
  const row = database.prepare("SELECT * FROM packages WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return;
  const updated = { ...rowToPackage(row), ...patch };
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

export function clearAllData(): void {
  const database = getDb();
  database.exec(`
    DELETE FROM tasks;
    DELETE FROM vision_tiles;
    DELETE FROM vision_goals;
    DELETE FROM reviews;
    DELETE FROM books;
    DELETE FROM purchase_items;
    DELETE FROM fragrances;
    DELETE FROM packages;
  `);
}

export function resetToSeed(): void {
  clearAllData();
  seedIfEmpty(getDb());
}

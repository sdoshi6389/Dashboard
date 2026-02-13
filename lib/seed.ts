import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance } from "@/types/fragrances";
import type { Package } from "@/types/packages";
import { todayISO } from "./date";

// Placeholder image URLs for demo (public, no API)
const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop";
const PLACEHOLDER2 = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&h=200&fit=crop";
const PLACEHOLDER3 = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop";

const now = new Date().toISOString();
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

export const seedTasks: Task[] = [
  { id: "t1", title: "Review project specs", notes: "", dueDate: todayISO(), priority: "high", status: "todo", tags: ["work"], createdAt: now, updatedAt: now },
  { id: "t2", title: "Call dentist", notes: "", dueDate: todayISO(), priority: "med", status: "doing", tags: ["personal"], createdAt: now, updatedAt: now },
  { id: "t3", title: "Grocery run", notes: "", dueDate: todayISO(), priority: "med", status: "todo", tags: [], createdAt: now, updatedAt: now },
  { id: "t4", title: "Send invoice", notes: "", dueDate: tomorrow, priority: "high", status: "todo", tags: ["work"], createdAt: now, updatedAt: now },
  { id: "t5", title: "Plan weekend", notes: "", dueDate: nextWeek, priority: "low", status: "todo", tags: [], createdAt: now, updatedAt: now },
  { id: "t6", title: "Done task example", notes: "", dueDate: todayISO(), priority: "low", status: "done", tags: [], createdAt: now, updatedAt: now },
];

export const seedVisionTiles: VisionTile[] = [
  { id: "vt1", title: "Morning run", category: "Fitness", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&fit=crop", notes: "", createdAt: now },
  { id: "vt2", title: "Remote work setup", category: "Career", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&fit=crop", notes: "", createdAt: now },
  { id: "vt3", title: "Family dinner", category: "Relationships", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&fit=crop", notes: "", createdAt: now },
  { id: "vt4", title: "Savings goal", category: "Money", imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&fit=crop", notes: "", createdAt: now },
  { id: "vt5", title: "Learn piano", category: "Creativity", imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&fit=crop", notes: "", createdAt: now },
  { id: "vt6", title: "Meditation", category: "Other", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&fit=crop", notes: "", createdAt: now },
];

export const seedVisionGoals: VisionGoal[] = [
  { id: "vg1", title: "Run 5K without stopping", category: "Fitness", why: "Feel stronger", targetDate: nextWeek, status: "active", progress: 60, createdAt: now, updatedAt: now },
  { id: "vg2", title: "Complete certification", category: "Career", why: "Career growth", targetDate: "2025-06-01", status: "active", progress: 25, createdAt: now, updatedAt: now },
  { id: "vg3", title: "Save $5K emergency fund", category: "Money", why: "Security", targetDate: "2025-12-01", status: "active", progress: 40, createdAt: now, updatedAt: now },
];

const BOOK_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop";
const BOOK_COVER2 = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop";
const BOOK_COVER3 = "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop";

export const seedBooks: Book[] = [
  { id: "b1", title: "Deep Work", author: "Cal Newport", type: "nonacademic", status: "reading", pages: 280, tags: ["productivity"], imageUrl: BOOK_COVER, createdAt: now, updatedAt: now },
  { id: "b2", title: "Atomic Habits", author: "James Clear", type: "nonacademic", status: "want", tags: ["habits"], imageUrl: BOOK_COVER2, createdAt: now, updatedAt: now },
  { id: "b3", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", type: "academic", status: "done", pages: 600, tags: ["tech"], imageUrl: BOOK_COVER3, createdAt: now, updatedAt: now },
];

export const seedReviews: Review[] = [
  { id: "r1", bookId: "b3", rating: 5, summary: "Comprehensive and clear.", takeaways: ["Systems thinking", "Trade-offs matter"], favoriteQuote: "Data is the truth.", applyThis: "Document decisions.", createdAt: now },
];

export const seedPurchaseItems: PurchaseItem[] = [
  { id: "p1", name: "Coffee beans", category: "Food", estPrice: 18, recurrence: "monthly", nextPurchaseAt: tomorrow, link: "", priority: 1, imageUrl: PLACEHOLDER },
  { id: "p2", name: "Vitamins", category: "Health", estPrice: 25, recurrence: "monthly", nextPurchaseAt: nextWeek, link: "", priority: 2, imageUrl: PLACEHOLDER2 },
  { id: "p3", name: "Monitor stand", category: "Office", estPrice: 80, recurrence: "none", link: "", priority: 1, imageUrl: PLACEHOLDER3 },
  { id: "p4", name: "Running shoes", category: "Fitness", estPrice: 120, recurrence: "none", link: "", priority: 2, imageUrl: PLACEHOLDER },
];

export const seedFragrances: Fragrance[] = [
  { id: "f1", name: "Bleu de Chanel", brand: "Chanel", notesTop: ["Citrus", "Mint"], notesMid: ["Ginger", "Iso E Super"], notesBase: ["Sandalwood", "Cedar"], season: "all", vibeTags: ["fresh", "versatile"], longevity: 4, projection: 3, sampled: true, wouldBuy: true, imageUrl: PLACEHOLDER },
  { id: "f2", name: "Sauvage", brand: "Dior", notesTop: ["Bergamot"], notesMid: ["Lavender", "Pepper"], notesBase: ["Ambroxan"], season: "summer", vibeTags: ["sharp"], longevity: 5, projection: 5, sampled: false, wouldBuy: false, imageUrl: PLACEHOLDER2 },
  { id: "f3", name: "Wood Sage & Sea Salt", brand: "Jo Malone", notesTop: ["Ambrette"], notesMid: ["Sage"], notesBase: ["Grapefruit"], season: "summer", vibeTags: ["clean", "minimal"], longevity: 2, projection: 2, sampled: false, wouldBuy: false, imageUrl: PLACEHOLDER3 },
];

export const seedPackages: Package[] = [
  { id: "pk1", itemName: "Wireless earbuds", carrier: "UPS", trackingNumber: "1Z999AA10123456784", orderDate: todayISO(), expectedDeliveryDate: tomorrow, status: "shipped", link: "", imageUrl: PLACEHOLDER },
  { id: "pk2", itemName: "Desk lamp", carrier: "FedEx", expectedDeliveryDate: nextWeek, status: "ordered", imageUrl: PLACEHOLDER2 },
];

export function getSeedState(): import("./storage").PersistedState {
  return {
    version: 1,
    tasks: seedTasks,
    visionTiles: seedVisionTiles,
    visionGoals: seedVisionGoals,
    books: seedBooks,
    reviews: seedReviews,
    purchaseItems: seedPurchaseItems,
    fragrances: seedFragrances,
    packages: seedPackages,
  };
}

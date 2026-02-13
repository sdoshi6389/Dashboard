import type { FullState } from "./db";
import {
  insertTask,
  insertVisionTile,
  insertVisionGoal,
  insertBook,
  insertReview,
  insertPurchase,
  insertFragrance,
  insertPackage,
  clearAllData,
} from "./db";

export function importState(state: FullState): void {
  clearAllData();
  const database = getDb();
  const run = database.transaction(() => {
    for (const t of state.tasks) insertTask(t);
    for (const t of state.visionTiles) insertVisionTile(t);
    for (const g of state.visionGoals) insertVisionGoal(g);
    for (const b of state.books) insertBook(b);
    for (const r of state.reviews) insertReview(r);
    for (const p of state.purchaseItems) insertPurchase(p);
    for (const f of state.fragrances) insertFragrance(f);
    for (const p of state.packages) insertPackage(p);
  });
  run();
}

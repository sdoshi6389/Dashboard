import type { Task } from "./todo";
import type { VisionTile, VisionGoal } from "./vision";
import type { Book, Review } from "./reading";
import type { PurchaseItem } from "./purchases";
import type { Fragrance } from "./fragrances";
import type { Package } from "./packages";

export interface FullState {
  tasks: Task[];
  visionTiles: VisionTile[];
  visionGoals: VisionGoal[];
  books: Book[];
  reviews: Review[];
  purchaseItems: PurchaseItem[];
  fragrances: Fragrance[];
  packages: Package[];
}

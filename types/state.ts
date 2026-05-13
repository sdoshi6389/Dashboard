import type { Task } from "@/types/todo";
import type { VisionTile, VisionGoal } from "@/types/vision";
import type { Book, Review, ReadingLog } from "@/types/reading";
import type { PurchaseItem } from "@/types/purchases";
import type { Fragrance } from "@/types/fragrances";
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

export interface FullState {
  tasks: Task[];
  visionTiles: VisionTile[];
  visionGoals: VisionGoal[];
  books: Book[];
  reviews: Review[];
  readingLogs: ReadingLog[];
  purchaseItems: PurchaseItem[];
  fragrances: Fragrance[];
  packages: Package[];
  meals: Meal[];
  workouts: WorkoutPlan[];
  routines: Routine[];
  trips: TravelTrip[];
  financialAccounts: FinancialAccount[];
  sinkingFunds: SinkingFund[];
  paychecks: Paycheck[];
  investmentHoldings: InvestmentHolding[];
  monthlyFinancialReviews: MonthlyFinancialReview[];
  budgetCategories: BudgetCategory[];
  monthlyBudgetActuals: MonthlyBudgetActual[];
  accountPartitions: AccountPartition[];
  financialPurchases: FinancialPurchase[];
}

//before meals
// import type { Task } from "./todo";
// import type { VisionTile, VisionGoal } from "./vision";
// import type { Book, Review } from "./reading";
// import type { PurchaseItem } from "./purchases";
// import type { Fragrance } from "./fragrances";
// import type { Package } from "./packages";

// export interface FullState {
//   tasks: Task[];
//   visionTiles: VisionTile[];
//   visionGoals: VisionGoal[];
//   books: Book[];
//   reviews: Review[];
//   purchaseItems: PurchaseItem[];
//   fragrances: Fragrance[];
//   packages: Package[];
// }

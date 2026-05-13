export type AccountType =
  | "checking"
  | "savings"
  | "brokerage"
  | "roth_ira"
  | "credit_card"
  | "venmo"
  | "other";

export interface FinancialAccount {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
  statementDate?: number; // day of month 1-31
  dueDate?: number; // day of month 1-31
  autopay?: boolean;
  notes?: string;
}

export type SinkingFundCategory =
  | "tech"
  | "travel"
  | "gift"
  | "experience"
  | "lifestyle"
  | "other";

export interface SinkingFund {
  id: string;
  name: string;
  emoji?: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate?: string; // YYYY-MM-DD
  category: SinkingFundCategory;
  completed?: boolean;
}

export interface Paycheck {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  grossAmount: number;
  netAmount: number;
  paycheckNumber?: number;
  notes?: string;
}

export type HoldingCategory = "stock" | "etf" | "crypto" | "other";

export interface InvestmentHolding {
  id: string;
  accountType: "brokerage" | "roth_ira";
  ticker: string;
  name?: string;
  shares: number;
  currentPrice: number;
  category: HoldingCategory;
  notes?: string;
}

export interface MonthlyFinancialReview {
  id: string;
  month: string; // YYYY-MM
  totalIncome: number;
  totalSpent: number;
  totalInvested: number;
  investmentRate: number; // 0-100
  reflection: string;
  highlights: string;
  improvements: string;
}

export interface AccountPartition {
  id: string;
  accountId: string;
  label: string;
  amount: number;
  sinkingFundId?: string; // optional link to a goal
  notes?: string;
}

export interface FinancialPurchase {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  categoryId?: string; // from BudgetCategory
  accountId?: string;  // which account/card was charged
  notes?: string;
}

export type BudgetCategoryType = "fixed" | "variable" | "investing";

export interface BudgetCategory {
  id: string;
  name: string;
  emoji?: string;
  monthlyBudget: number;
  type: BudgetCategoryType;
  notes?: string;
  sortOrder?: number;
}

export interface MonthlyBudgetActual {
  id: string;
  month: string; // YYYY-MM
  categoryId: string;
  amountSpent: number;
  notes?: string;
}

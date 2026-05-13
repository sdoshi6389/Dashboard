"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Target,
  CreditCard,
  Wallet,
  BarChart3,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Briefcase,
  Upload,
  LayoutList,
  CheckCircle2,
  Receipt,
  SplitSquareVertical,
} from "lucide-react";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";

import { FinancialAccountDrawer } from "@/components/forms/FinancialAccountDrawer";
import { SinkingFundDrawer } from "@/components/forms/SinkingFundDrawer";
import { PaycheckDrawer } from "@/components/forms/PaycheckDrawer";
import { InvestmentHoldingDrawer } from "@/components/forms/InvestmentHoldingDrawer";
import { MonthlyFinancialReviewDrawer } from "@/components/forms/MonthlyFinancialReviewDrawer";
import { BudgetCategoryDrawer } from "@/components/forms/BudgetCategoryDrawer";
import { AccountPartitionDrawer } from "@/components/forms/AccountPartitionDrawer";
import { FinancialPurchaseDrawer } from "@/components/forms/FinancialPurchaseDrawer";

import { useStore } from "@/lib/store";
import { parseHoldingsFile } from "@/lib/parseHoldings";
import type {
  FinancialAccount,
  SinkingFund,
  Paycheck,
  InvestmentHolding,
  MonthlyFinancialReview,
  BudgetCategory,
  AccountType,
  AccountPartition,
  FinancialPurchase,
} from "@/types/finances";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${fmt(n)}`;
}

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(ym: string) {
  return new Date(ym + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  brokerage: "Brokerage",
  roth_ira: "Roth IRA",
  credit_card: "Credit Card",
  venmo: "Venmo",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  stock: "text-aurora-teal",
  etf: "text-aurora-purple",
  crypto: "text-amber-400",
  other: "text-muted-foreground",
};

const BUDGET_TYPE_COLORS: Record<string, string> = {
  fixed: "bg-aurora-teal/20 text-aurora-teal border-aurora-teal/30",
  variable: "bg-aurora-purple/20 text-aurora-purple border-aurora-purple/30",
  investing: "bg-amber-400/20 text-amber-400 border-amber-400/30",
};

// (Cisco-specific constants removed — income is now general-purpose)

// Chart color palettes
const STOCK_COLORS = [
  "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e",
  "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8",
  "#34d399", "#10b981", "#059669", "#047857",
];
const CRYPTO_COLORS = [
  "#fbbf24", "#f59e0b", "#d97706", "#b45309",
  "#fb923c", "#f97316", "#ea580c", "#c2410c",
];
const ROTH_COLORS = [
  "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9",
  "#e879f9", "#d946ef", "#c026d3", "#a21caf",
];

// ── Donut chart ───────────────────────────────────────────────────────────────

interface ChartSlice { ticker: string; value: number; pct: number }

function AllocationDonutChart({
  slices,
  colors,
  total,
}: {
  slices: ChartSlice[];
  colors: string[];
  total: number;
}) {
  const data = slices.map((s) => ({ name: s.ticker, value: s.value }));

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 200, height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`$${fmt(Number(v ?? 0))}`, ""]}
              contentStyle={{
                background: "hsl(222 16% 11%)",
                border: "1px solid hsl(215 18% 20%)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "hsl(210 20% 98%)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Mini legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 max-w-[200px]">
        {slices.map((s, i) => (
          <div key={s.ticker} className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-muted-foreground">{s.ticker}</span>
            <span className="font-medium">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── MetricCard ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <Card className="aurora-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="rounded-xl bg-accent p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FinancesClient() {
  const [tab, setTab] = useState("overview");

  // store reads
  const financialAccounts = useStore((s) => s.financialAccounts);
  const sinkingFunds = useStore((s) => s.sinkingFunds);
  const paychecks = useStore((s) => s.paychecks);
  const investmentHoldings = useStore((s) => s.investmentHoldings);
  const monthlyFinancialReviews = useStore((s) => s.monthlyFinancialReviews);
  const budgetCategories = useStore((s) => s.budgetCategories);
  const monthlyBudgetActuals = useStore((s) => s.monthlyBudgetActuals);
  const accountPartitions = useStore((s) => s.accountPartitions);
  const financialPurchases = useStore((s) => s.financialPurchases);

  // store actions
  const addFinancialAccount = useStore((s) => s.addFinancialAccount);
  const updateFinancialAccount = useStore((s) => s.updateFinancialAccount);
  const deleteFinancialAccount = useStore((s) => s.deleteFinancialAccount);
  const addSinkingFund = useStore((s) => s.addSinkingFund);
  const updateSinkingFund = useStore((s) => s.updateSinkingFund);
  const deleteSinkingFund = useStore((s) => s.deleteSinkingFund);
  const addPaycheck = useStore((s) => s.addPaycheck);
  const updatePaycheck = useStore((s) => s.updatePaycheck);
  const deletePaycheck = useStore((s) => s.deletePaycheck);
  const addInvestmentHolding = useStore((s) => s.addInvestmentHolding);
  const updateInvestmentHolding = useStore((s) => s.updateInvestmentHolding);
  const deleteInvestmentHolding = useStore((s) => s.deleteInvestmentHolding);
  const addMonthlyFinancialReview = useStore((s) => s.addMonthlyFinancialReview);
  const updateMonthlyFinancialReview = useStore((s) => s.updateMonthlyFinancialReview);
  const deleteMonthlyFinancialReview = useStore((s) => s.deleteMonthlyFinancialReview);
  const addBudgetCategory = useStore((s) => s.addBudgetCategory);
  const updateBudgetCategory = useStore((s) => s.updateBudgetCategory);
  const deleteBudgetCategory = useStore((s) => s.deleteBudgetCategory);
  const upsertMonthlyBudgetActual = useStore((s) => s.upsertMonthlyBudgetActual);
  const addAccountPartition = useStore((s) => s.addAccountPartition);
  const updateAccountPartition = useStore((s) => s.updateAccountPartition);
  const deleteAccountPartition = useStore((s) => s.deleteAccountPartition);
  const addFinancialPurchase = useStore((s) => s.addFinancialPurchase);
  const updateFinancialPurchase = useStore((s) => s.updateFinancialPurchase);
  const deleteFinancialPurchase = useStore((s) => s.deleteFinancialPurchase);

  // drawer state
  const [accountDrawer, setAccountDrawer] = useState(false);
  const [editAccount, setEditAccount] = useState<FinancialAccount | null>(null);
  const [fundDrawer, setFundDrawer] = useState(false);
  const [editFund, setEditFund] = useState<SinkingFund | null>(null);
  const [paycheckDrawer, setPaycheckDrawer] = useState(false);
  const [editPaycheck, setEditPaycheck] = useState<Paycheck | null>(null);
  const [holdingDrawer, setHoldingDrawer] = useState(false);
  const [editHolding, setEditHolding] = useState<InvestmentHolding | null>(null);
  const [reviewDrawer, setReviewDrawer] = useState(false);
  const [editReview, setEditReview] = useState<MonthlyFinancialReview | null>(null);
  const [budgetCatDrawer, setBudgetCatDrawer] = useState(false);
  const [editBudgetCat, setEditBudgetCat] = useState<BudgetCategory | null>(null);

  // CSV import state — two separate inputs
  const brokerageCsvRef = useRef<HTMLInputElement>(null);
  const rothCsvRef = useRef<HTMLInputElement>(null);
  const [csvImporting, setCsvImporting] = useState<"brokerage" | "roth_ira" | null>(null);
  const [csvResult, setCsvResult] = useState<string | null>(null);

  // Partition + purchase drawer state
  const [partitionDrawer, setPartitionDrawer] = useState(false);
  const [partitionAccountId, setPartitionAccountId] = useState("");
  const [editPartition, setEditPartition] = useState<AccountPartition | null>(null);
  const [purchaseDrawer, setPurchaseDrawer] = useState(false);
  const [editPurchase, setEditPurchase] = useState<FinancialPurchase | null>(null);

  // Budget month selector
  const [budgetMonth, setBudgetMonth] = useState(currentMonthStr);

  // ── derived metrics ─────────────────────────────────────────────────────────

  const { netWorth, liquidCash, investmentTotal, creditUtilization } = useMemo(() => {
    const ccAccounts = financialAccounts.filter((a) => a.type === "credit_card");
    const nonCC = financialAccounts.filter((a) => a.type !== "credit_card");
    const ccDebt = ccAccounts.reduce((s, a) => s + a.balance, 0);
    const assets = nonCC.reduce((s, a) => s + a.balance, 0);
    const liquid = financialAccounts
      .filter((a) => ["checking", "savings", "venmo"].includes(a.type))
      .reduce((s, a) => s + a.balance, 0);
    const investTotal = investmentHoldings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
    const totalCCLimit = ccAccounts.reduce((s, a) => s + (a.creditLimit ?? 0), 0);
    const utilization = totalCCLimit > 0 ? Math.round((ccDebt / totalCCLimit) * 100) : null;
    return { netWorth: assets + investTotal - ccDebt, liquidCash: liquid, investmentTotal: investTotal, creditUtilization: utilization };
  }, [financialAccounts, investmentHoldings]);

  const brokerageTotal = useMemo(
    () => investmentHoldings.filter((h) => h.accountType === "brokerage").reduce((s, h) => s + h.shares * h.currentPrice, 0),
    [investmentHoldings]
  );
  const rothTotal = useMemo(
    () => investmentHoldings.filter((h) => h.accountType === "roth_ira").reduce((s, h) => s + h.shares * h.currentPrice, 0),
    [investmentHoldings]
  );
  const totalNetReceived = useMemo(() => paychecks.reduce((s, p) => s + p.netAmount, 0), [paychecks]);
  const activeFunds = sinkingFunds.filter((f) => !f.completed);
  const completedFunds = sinkingFunds.filter((f) => f.completed);
  const avgGoalCompletion =
    activeFunds.length > 0
      ? Math.round((activeFunds.reduce((s, f) => s + Math.min(f.currentAmount / f.targetAmount, 1), 0) / activeFunds.length) * 100)
      : 0;
  const latestReview = [...monthlyFinancialReviews].sort((a, b) => b.month.localeCompare(a.month))[0];

  // ── budget derived ──────────────────────────────────────────────────────────

  const budgetActualsForMonth = useMemo(
    () => monthlyBudgetActuals.filter((a) => a.month === budgetMonth),
    [monthlyBudgetActuals, budgetMonth]
  );

  const budgetSummary = useMemo(() => {
    const fixed = budgetCategories.filter((c) => c.type === "fixed");
    const variable = budgetCategories.filter((c) => c.type === "variable");
    const investing = budgetCategories.filter((c) => c.type === "investing");
    const sinkingTotal = activeFunds.reduce((s, f) => s + f.monthlyContribution, 0);

    const totalBudgeted = budgetCategories.reduce((s, c) => s + c.monthlyBudget, 0);
    const totalActual = budgetActualsForMonth.reduce((s, a) => s + a.amountSpent, 0);

    const fixedBudgeted = fixed.reduce((s, c) => s + c.monthlyBudget, 0);
    const variableBudgeted = variable.reduce((s, c) => s + c.monthlyBudget, 0);
    const investingBudgeted = investing.reduce((s, c) => s + c.monthlyBudget, 0);

    // Monthly net income: sum income logged for this month; fall back to overall average
    const monthIncome = paychecks
      .filter((p) => p.date.startsWith(budgetMonth))
      .reduce((s, p) => s + p.netAmount, 0);
    const uniqueMonths = new Set(paychecks.map((p) => p.date.slice(0, 7))).size;
    const monthlyNetIncome =
      monthIncome > 0
        ? monthIncome
        : uniqueMonths > 0
        ? totalNetReceived / uniqueMonths
        : 0;

    const surplus = monthlyNetIncome - totalBudgeted - sinkingTotal;

    return {
      fixed, variable, investing,
      sinkingTotal, totalBudgeted, totalActual,
      fixedBudgeted, variableBudgeted, investingBudgeted,
      monthlyNetIncome, surplus,
    };
  }, [budgetCategories, budgetActualsForMonth, activeFunds, paychecks, totalNetReceived]);

  // ── CSV import handler ──────────────────────────────────────────────────────

  const handleImport = useCallback(async (file: File, accountType: "brokerage" | "roth_ira") => {
    setCsvImporting(accountType);
    setCsvResult(null);
    try {
      const parsed = await parseHoldingsFile(file);

      if (parsed.length === 0) {
        setCsvResult("No holdings found. Make sure you're uploading a Robinhood statement PDF or positions CSV.");
        return;
      }

      let created = 0, updated = 0;
      for (const row of parsed) {
        const existing = investmentHoldings.find(
          (h) => h.accountType === accountType && h.ticker === row.ticker
        );
        if (existing) {
          updateInvestmentHolding(existing.id, {
            shares: row.shares,
            currentPrice: row.currentPrice,
            name: row.name || existing.name,
          });
          updated++;
        } else {
          addInvestmentHolding({
            accountType,
            ticker: row.ticker,
            name: row.name || undefined,
            shares: row.shares,
            currentPrice: row.currentPrice,
            category: row.category,
          });
          created++;
        }
      }

      const label = accountType === "brokerage" ? "Brokerage" : "Roth IRA";
      setCsvResult(`${label}: imported ${parsed.length} holdings (${created} new, ${updated} updated).`);
    } catch (err) {
      setCsvResult(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setCsvImporting(null);
    }
  }, [investmentHoldings, addInvestmentHolding, updateInvestmentHolding]);

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <SectionHeader title="Finances" description="Your personal financial operating system" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="review">Monthly Review</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Net Worth" value={fmtShort(netWorth)} sub="assets + investments − debt" icon={TrendingUp} accent="text-aurora-teal" />
            <MetricCard label="Liquid Cash" value={fmtShort(liquidCash)} sub="checking + savings + venmo" icon={Wallet} />
            <MetricCard label="Investments" value={fmtShort(investmentTotal)} sub={`Brokerage ${fmtShort(brokerageTotal)} · Roth ${fmtShort(rothTotal)}`} icon={BarChart3} accent="text-aurora-purple" />
            <MetricCard
              label="Credit Utilization"
              value={creditUtilization !== null ? `${creditUtilization}%` : "—"}
              sub={creditUtilization !== null && creditUtilization > 30 ? "⚠ above 30% target" : "on track"}
              icon={CreditCard}
              accent={creditUtilization !== null && creditUtilization > 30 ? "text-amber-400" : undefined}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Investment Rate" value={latestReview ? `${latestReview.investmentRate}%` : "—"} sub={latestReview ? `${latestReview.month} · of post-tax income` : "Log a monthly review"} icon={Target} />
            <MetricCard label="Goal Completion" value={`${avgGoalCompletion}%`} sub={`${activeFunds.length} active · ${completedFunds.length} done`} icon={Target} accent="text-aurora-teal" />
            <MetricCard label="Net Income Logged" value={fmtShort(totalNetReceived)} sub={`${paychecks.length} entr${paychecks.length === 1 ? "y" : "ies"} · gross $${fmt(paychecks.reduce((s, p) => s + p.grossAmount, 0))}`} icon={Briefcase} />
          </div>

          {activeFunds.length > 0 && (
            <Card className="aurora-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Active Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeFunds.slice(0, 5).map((f) => {
                  const pct = Math.min((f.currentAmount / f.targetAmount) * 100, 100);
                  return (
                    <div key={f.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{f.emoji && `${f.emoji} `}{f.name}</span>
                        <span className="text-muted-foreground">${fmt(f.currentAmount)} / ${fmt(f.targetAmount)}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
                {activeFunds.length > 5 && (
                  <button onClick={() => setTab("goals")} className="text-xs text-aurora-teal hover:underline flex items-center gap-1">
                    View all {activeFunds.length} goals <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── BUDGET ────────────────────────────────────────────────────── */}
        <TabsContent value="budget" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Monthly Budget</h2>
              <p className="text-sm text-muted-foreground">Set monthly allocations and track actual spending</p>
            </div>
            <div className="flex gap-2">
              <input
                type="month"
                value={budgetMonth}
                onChange={(e) => setBudgetMonth(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button onClick={() => { setEditBudgetCat(null); setBudgetCatDrawer(true); }} className="aurora-btn rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </div>
          </div>

          {/* Income Allocation Bar */}
          {budgetSummary.monthlyNetIncome > 0 && (
            <Card className="aurora-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">Income Allocation — {monthLabel(budgetMonth)}</p>
                  <p className="text-sm text-muted-foreground">
                    Est. monthly net: <span className="text-foreground font-medium">${fmt(budgetSummary.monthlyNetIncome)}</span>
                  </p>
                </div>

                {/* Stacked allocation bar */}
                {budgetSummary.totalBudgeted > 0 && (
                  <div className="rounded-xl overflow-hidden h-6 flex mb-3" style={{ width: "100%" }}>
                    {budgetSummary.fixedBudgeted > 0 && (
                      <div
                        className="bg-aurora-teal/70 flex items-center justify-center text-xs font-medium text-background"
                        style={{ width: `${(budgetSummary.fixedBudgeted / budgetSummary.monthlyNetIncome) * 100}%` }}
                        title={`Fixed: $${fmt(budgetSummary.fixedBudgeted)}`}
                      >
                        {((budgetSummary.fixedBudgeted / budgetSummary.monthlyNetIncome) * 100).toFixed(0)}%
                      </div>
                    )}
                    {budgetSummary.variableBudgeted > 0 && (
                      <div
                        className="bg-aurora-purple/70 flex items-center justify-center text-xs font-medium text-background"
                        style={{ width: `${(budgetSummary.variableBudgeted / budgetSummary.monthlyNetIncome) * 100}%` }}
                        title={`Variable: $${fmt(budgetSummary.variableBudgeted)}`}
                      >
                        {((budgetSummary.variableBudgeted / budgetSummary.monthlyNetIncome) * 100).toFixed(0)}%
                      </div>
                    )}
                    {budgetSummary.sinkingTotal > 0 && (
                      <div
                        className="bg-amber-400/70 flex items-center justify-center text-xs font-medium text-background"
                        style={{ width: `${(budgetSummary.sinkingTotal / budgetSummary.monthlyNetIncome) * 100}%` }}
                        title={`Goals: $${fmt(budgetSummary.sinkingTotal)}`}
                      >
                        {((budgetSummary.sinkingTotal / budgetSummary.monthlyNetIncome) * 100).toFixed(0)}%
                      </div>
                    )}
                    {budgetSummary.investingBudgeted > 0 && (
                      <div
                        className="bg-emerald-500/70 flex items-center justify-center text-xs font-medium text-background"
                        style={{ width: `${(budgetSummary.investingBudgeted / budgetSummary.monthlyNetIncome) * 100}%` }}
                        title={`Investing: $${fmt(budgetSummary.investingBudgeted)}`}
                      >
                        {((budgetSummary.investingBudgeted / budgetSummary.monthlyNetIncome) * 100).toFixed(0)}%
                      </div>
                    )}
                    {budgetSummary.surplus > 0 && (
                      <div
                        className="bg-muted/50 flex items-center justify-center text-xs text-muted-foreground"
                        style={{ width: `${(budgetSummary.surplus / budgetSummary.monthlyNetIncome) * 100}%` }}
                      >
                        free
                      </div>
                    )}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-aurora-teal/70" />Fixed ${fmt(budgetSummary.fixedBudgeted)}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-aurora-purple/70" />Variable ${fmt(budgetSummary.variableBudgeted)}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/70" />Goals ${fmt(budgetSummary.sinkingTotal)}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" />Investing ${fmt(budgetSummary.investingBudgeted)}</span>
                  {budgetSummary.surplus > 0 && (
                    <span className="flex items-center gap-1.5 text-aurora-teal font-medium">
                      Surplus ${fmt(budgetSummary.surplus)} → deployed to markets
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {budgetCategories.length === 0 ? (
            <EmptyState
              icon={LayoutList}
              title="No budget categories"
              description="Add categories like Rent, Food, Gym, Fragrances to track your monthly spending."
              action={
                <Button onClick={() => { setEditBudgetCat(null); setBudgetCatDrawer(true); }} className="aurora-btn rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
              }
            />
          ) : (
            <div className="space-y-5">
              {(["fixed", "variable", "investing"] as const).map((type) => {
                const cats = budgetCategories.filter((c) => c.type === type);
                if (cats.length === 0) return null;
                const typeLabels = { fixed: "Fixed Expenses", variable: "Variable Expenses", investing: "Investing" };
                return (
                  <div key={type}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{typeLabels[type]}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {cats.map((cat) => {
                        // Spending from logged purchases this month
                        const purchaseSpend = financialPurchases
                          .filter((p) => p.categoryId === cat.id && p.date.startsWith(budgetMonth))
                          .reduce((s, p) => s + p.amount, 0);
                        // Manual actual (fallback / supplement)
                        const manual = budgetActualsForMonth.find((a) => a.categoryId === cat.id);
                        // Prefer purchase-derived if any, otherwise manual
                        const spent = purchaseSpend > 0 ? purchaseSpend : (manual?.amountSpent ?? 0);
                        const hasPurchases = purchaseSpend > 0;
                        const pct = cat.monthlyBudget > 0 ? Math.min((spent / cat.monthlyBudget) * 100, 100) : 0;
                        const over = spent > cat.monthlyBudget;
                        return (
                          <Card key={cat.id} className="aurora-card">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {cat.emoji && <span className="mr-1">{cat.emoji}</span>}{cat.name}
                                  </p>
                                  <Badge variant="outline" className={`text-xs mt-0.5 ${BUDGET_TYPE_COLORS[cat.type]}`}>
                                    {cat.type}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => { setEditBudgetCat(cat); setBudgetCatDrawer(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteBudgetCategory(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                  <div>
                                    <span className={over ? "text-red-400 font-semibold" : "font-medium"}>${fmt(spent)}</span>
                                    {hasPurchases && (
                                      <span className="text-xs text-muted-foreground ml-1.5">from {financialPurchases.filter(p => p.categoryId === cat.id && p.date.startsWith(budgetMonth)).length} purchases</span>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground">${fmt(cat.monthlyBudget)} budget</span>
                                </div>
                                <Progress value={pct} className={`h-2 ${over ? "[&>div]:bg-red-400" : ""}`} />
                                {over && <p className="text-xs text-red-400 mt-1">Over by ${fmt(spent - cat.monthlyBudget)}</p>}
                              </div>

                              {!hasPurchases && (
                                <Button
                                  size="sm" variant="outline"
                                  className="w-full aurora-btn-secondary rounded-lg text-xs"
                                  onClick={() => {
                                    const input = prompt(`Actual spent on "${cat.name}" in ${monthLabel(budgetMonth)} ($):`, spent.toString());
                                    const amt = parseFloat(input ?? "");
                                    if (!isNaN(amt) && amt >= 0) upsertMonthlyBudgetActual(budgetMonth, cat.id, amt);
                                  }}
                                >
                                  {spent > 0 ? "Update Actual" : "Enter Actual"}
                                </Button>
                              )}
                              {hasPurchases && (
                                <button
                                  className="text-xs text-aurora-teal hover:underline w-full text-left"
                                  onClick={() => setTab("purchases")}
                                >
                                  View purchases →
                                </button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Sinking funds contribution row */}
              {activeFunds.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sinking Fund Contributions</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {activeFunds.map((f) => (
                      <Card key={f.id} className="aurora-card">
                        <CardContent className="p-4 flex items-center justify-between">
                          <p className="text-sm font-medium">{f.emoji && `${f.emoji} `}{f.name}</p>
                          <span className="font-semibold text-amber-400">${fmt(f.monthlyContribution)}/mo</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget summary */}
              <Card className="aurora-card border-border/60">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Budgeted</p>
                      <p className="font-bold">${fmt(budgetSummary.totalBudgeted)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className={`font-bold ${budgetSummary.totalActual > budgetSummary.totalBudgeted ? "text-red-400" : ""}`}>
                        ${fmt(budgetSummary.totalActual)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {budgetSummary.totalBudgeted > budgetSummary.totalActual ? "Under Budget" : "Over Budget"}
                      </p>
                      <p className={`font-bold ${budgetSummary.totalActual <= budgetSummary.totalBudgeted ? "text-aurora-teal" : "text-red-400"}`}>
                        ${fmt(Math.abs(budgetSummary.totalBudgeted - budgetSummary.totalActual))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── INCOME ────────────────────────────────────────────────────── */}
        <TabsContent value="income" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Income</h2>
              <p className="text-sm text-muted-foreground">Log any income — paychecks, freelance, bonuses, transfers</p>
            </div>
            <Button onClick={() => { setEditPaycheck(null); setPaycheckDrawer(true); }} className="aurora-btn rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Log Income
            </Button>
          </div>

          {(() => {
            const totalGross = paychecks.reduce((s, p) => s + p.grossAmount, 0);
            const avgNet = paychecks.length > 0 ? totalNetReceived / paychecks.length : 0;
            const thisMonth = currentMonthStr();
            const thisMonthNet = paychecks
              .filter((p) => p.date.startsWith(thisMonth))
              .reduce((s, p) => s + p.netAmount, 0);

            return (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Total Gross" value={fmtShort(totalGross)} sub="all time" icon={Briefcase} />
                  <MetricCard label="Total Net" value={fmtShort(totalNetReceived)} sub="all time" icon={TrendingUp} accent="text-aurora-teal" />
                  <MetricCard label="This Month Net" value={fmtShort(thisMonthNet)} sub={thisMonthNet === 0 ? "nothing logged yet" : "logged this month"} icon={Wallet} />
                  <MetricCard label="Avg per Entry" value={fmtShort(avgNet)} sub={`${paychecks.length} entr${paychecks.length === 1 ? "y" : "ies"} total`} icon={BarChart3} />
                </div>

                {paychecks.length === 0 ? (
                  <EmptyState icon={Briefcase} title="No income logged yet"
                    description="Log your first income entry — a paycheck, freelance payment, bonus, or any other source."
                    action={<Button onClick={() => { setEditPaycheck(null); setPaycheckDrawer(true); }} className="aurora-btn rounded-xl"><Plus className="h-4 w-4 mr-2" /> Log Income</Button>}
                  />
                ) : (
                  <Card className="aurora-card">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Income Log</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-0">
                        {[...paychecks].sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
                          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                            <div>
                              <p className="text-sm font-medium">
                                {p.notes || (p.paycheckNumber ? `Entry #${p.paycheckNumber}` : "Income")}
                              </p>
                              <p className="text-xs text-muted-foreground">{p.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-aurora-teal">${fmt(p.netAmount)} net</p>
                                <p className="text-xs text-muted-foreground">Gross: ${fmt(p.grossAmount)}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => { setEditPaycheck(p); setPaycheckDrawer(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePaycheck(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            );
          })()}
        </TabsContent>

        {/* ── GOALS ─────────────────────────────────────────────────────── */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Sinking Funds</h2>
              <p className="text-sm text-muted-foreground">Save intentionally toward each goal</p>
            </div>
            <Button onClick={() => { setEditFund(null); setFundDrawer(true); }} className="aurora-btn rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Add Goal
            </Button>
          </div>

          {sinkingFunds.length === 0 ? (
            <EmptyState icon={Target} title="No goals yet" description="Add your first sinking fund — laptop, Kyrgyzstan, Hillary's necklace…"
              action={<Button onClick={() => { setEditFund(null); setFundDrawer(true); }} className="aurora-btn rounded-xl"><Plus className="h-4 w-4 mr-2" /> Add Goal</Button>}
            />
          ) : (
            <>
              {activeFunds.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeFunds.map((f) => (
                    <GoalCard key={f.id} fund={f}
                      linkedPartitions={accountPartitions.filter((p) => p.sinkingFundId === f.id)}
                      accounts={financialAccounts}
                      onEdit={() => { setEditFund(f); setFundDrawer(true); }}
                      onDelete={() => deleteSinkingFund(f.id)}
                      onAddFunds={(amt) => updateSinkingFund(f.id, { currentAmount: Math.min(f.currentAmount + amt, f.targetAmount) })}
                    />
                  ))}
                </div>
              )}
              {completedFunds.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Completed</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completedFunds.map((f) => (
                      <GoalCard key={f.id} fund={f}
                        linkedPartitions={accountPartitions.filter((p) => p.sinkingFundId === f.id)}
                        accounts={financialAccounts}
                        onEdit={() => { setEditFund(f); setFundDrawer(true); }}
                        onDelete={() => deleteSinkingFund(f.id)}
                        onAddFunds={() => {}}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── INVESTMENTS ───────────────────────────────────────────────── */}
        <TabsContent value="investments" className="space-y-6">
          {/* Hidden file inputs — one per account type, accept PDF + CSV */}
          <input ref={brokerageCsvRef} type="file" accept=".pdf,.csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f, "brokerage"); e.target.value = ""; }}
          />
          <input ref={rothCsvRef} type="file" accept=".pdf,.csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f, "roth_ira"); e.target.value = ""; }}
          />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Portfolio</h2>
              <p className="text-sm text-muted-foreground">Track your Robinhood brokerage and Roth IRA</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="aurora-btn-secondary rounded-xl" disabled={!!csvImporting}
                onClick={() => brokerageCsvRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {csvImporting === "brokerage" ? "Importing…" : "Import Brokerage PDF / CSV"}
              </Button>
              <Button variant="outline" className="aurora-btn-secondary rounded-xl" disabled={!!csvImporting}
                onClick={() => rothCsvRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {csvImporting === "roth_ira" ? "Importing…" : "Import Roth IRA PDF / CSV"}
              </Button>
              <Button onClick={() => { setEditHolding(null); setHoldingDrawer(true); }} className="aurora-btn rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add Holding
              </Button>
            </div>
          </div>

          {/* Import result */}
          {csvResult && (
            <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${csvResult.includes("imported") ? "bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
              {csvResult.includes("imported") && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {csvResult}
              <button onClick={() => setCsvResult(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* How-to */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground transition-colors">How to get your statement from Robinhood</summary>
            <div className="mt-2 pl-3 border-l border-border space-y-2">
              <div>
                <p className="font-medium text-foreground mb-0.5">PDF (recommended)</p>
                <p>1. Robinhood app → Account → Statements &amp; History → Statements</p>
                <p>2. Download your monthly account statement PDF</p>
                <p>3. Use <strong>Import Brokerage PDF</strong> — parses all holdings + loaned shares automatically</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-0.5">CSV (if available)</p>
                <p>Account → Statements &amp; History → Export → Positions CSV</p>
              </div>
              <p className="text-muted-foreground/70">Import multiple statements freely — same ticker is updated, never duplicated.</p>
            </div>
          </details>

          {/* Summary metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Total Portfolio" value={`$${fmt(brokerageTotal + rothTotal)}`} icon={BarChart3} accent="text-aurora-teal" />
            <MetricCard label="Brokerage" value={`$${fmt(brokerageTotal)}`} icon={TrendingUp} />
            <MetricCard label="Roth IRA" value={`$${fmt(rothTotal)}`} icon={Target} accent="text-aurora-purple" />
          </div>

          {investmentHoldings.length === 0 ? (
            <EmptyState icon={BarChart3} title="No holdings yet" description="Import your Robinhood CSV or add positions manually."
              action={<Button onClick={() => { setEditHolding(null); setHoldingDrawer(true); }} className="aurora-btn rounded-xl"><Plus className="h-4 w-4 mr-2" /> Add Holding</Button>}
            />
          ) : (
            <div className="space-y-8">

              {/* ── BROKERAGE ── */}
              {(() => {
                const all = investmentHoldings.filter((h) => h.accountType === "brokerage");
                if (all.length === 0) return null;
                const stocks = all.filter((h) => h.category !== "crypto");
                const crypto = all.filter((h) => h.category === "crypto");
                const total = all.reduce((s, h) => s + h.shares * h.currentPrice, 0);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Brokerage (Robinhood)</h3>
                      <span className="text-sm font-semibold text-aurora-teal">${fmt(total)}</span>
                    </div>

                    {/* Stocks & ETFs */}
                    {stocks.length > 0 && (
                      <HoldingsSection
                        title="Stocks & ETFs"
                        holdings={stocks}
                        sectionTotal={total}
                        colors={STOCK_COLORS}
                        onEdit={(h) => { setEditHolding(h); setHoldingDrawer(true); }}
                        onDelete={deleteInvestmentHolding}
                      />
                    )}

                    {/* Crypto */}
                    {crypto.length > 0 && (
                      <HoldingsSection
                        title="Crypto"
                        holdings={crypto}
                        sectionTotal={total}
                        colors={CRYPTO_COLORS}
                        onEdit={(h) => { setEditHolding(h); setHoldingDrawer(true); }}
                        onDelete={deleteInvestmentHolding}
                      />
                    )}
                  </div>
                );
              })()}

              {/* ── ROTH IRA ── */}
              {(() => {
                const holdings = investmentHoldings.filter((h) => h.accountType === "roth_ira");
                if (holdings.length === 0) return null;
                const total = holdings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Roth IRA</h3>
                      <span className="text-sm font-semibold text-aurora-purple">${fmt(total)}</span>
                    </div>
                    <HoldingsSection
                      title="All Holdings"
                      holdings={holdings}
                      sectionTotal={total}
                      colors={ROTH_COLORS}
                      onEdit={(h) => { setEditHolding(h); setHoldingDrawer(true); }}
                      onDelete={deleteInvestmentHolding}
                    />
                  </div>
                );
              })()}

            </div>
          )}
        </TabsContent>

        {/* ── ACCOUNTS ──────────────────────────────────────────────────── */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Accounts</h2>
              <p className="text-sm text-muted-foreground">Bank accounts, credit cards, and more</p>
            </div>
            <Button onClick={() => { setEditAccount(null); setAccountDrawer(true); }} className="aurora-btn rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Add Account
            </Button>
          </div>

          {financialAccounts.length === 0 ? (
            <EmptyState icon={Wallet} title="No accounts yet" description="Add your BoFA checking, savings, Venmo, and credit cards."
              action={<Button onClick={() => { setEditAccount(null); setAccountDrawer(true); }} className="aurora-btn rounded-xl"><Plus className="h-4 w-4 mr-2" /> Add Account</Button>}
            />
          ) : (
            <div className="space-y-6">
              {(() => {
                const bankAccts = financialAccounts.filter((a) => a.type !== "credit_card");
                if (bankAccts.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Bank & Cash</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {bankAccts.map((a) => (
                        <AccountCard
                          key={a.id} account={a}
                          partitions={accountPartitions.filter((p) => p.accountId === a.id)}
                          sinkingFunds={sinkingFunds}
                          onEdit={() => { setEditAccount(a); setAccountDrawer(true); }}
                          onDelete={() => deleteFinancialAccount(a.id)}
                          onAddPartition={() => { setPartitionAccountId(a.id); setEditPartition(null); setPartitionDrawer(true); }}
                          onEditPartition={(p) => { setPartitionAccountId(a.id); setEditPartition(p); setPartitionDrawer(true); }}
                          onDeletePartition={(id) => deleteAccountPartition(id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
              {(() => {
                const ccAccts = financialAccounts.filter((a) => a.type === "credit_card");
                if (ccAccts.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Credit Cards</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {ccAccts.map((a) => (
                        <AccountCard
                          key={a.id} account={a}
                          partitions={accountPartitions.filter((p) => p.accountId === a.id)}
                          sinkingFunds={sinkingFunds}
                          onEdit={() => { setEditAccount(a); setAccountDrawer(true); }}
                          onDelete={() => deleteFinancialAccount(a.id)}
                          onAddPartition={() => { setPartitionAccountId(a.id); setEditPartition(null); setPartitionDrawer(true); }}
                          onEditPartition={(p) => { setPartitionAccountId(a.id); setEditPartition(p); setPartitionDrawer(true); }}
                          onDeletePartition={(id) => deleteAccountPartition(id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        {/* ── PURCHASES ─────────────────────────────────────────────────── */}
        <TabsContent value="purchases" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Purchase Log</h2>
              <p className="text-sm text-muted-foreground">Track spending by category and card</p>
            </div>
            <div className="flex gap-2">
              <input
                type="month"
                value={budgetMonth}
                onChange={(e) => setBudgetMonth(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button onClick={() => { setEditPurchase(null); setPurchaseDrawer(true); }} className="aurora-btn rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Log Purchase
              </Button>
            </div>
          </div>

          {/* Category spending summary for the month */}
          {(() => {
            const monthPurchases = financialPurchases.filter((p) => p.date.startsWith(budgetMonth));
            const monthTotal = monthPurchases.reduce((s, p) => s + p.amount, 0);

            if (monthPurchases.length === 0) return (
              <EmptyState icon={Receipt} title="No purchases logged"
                description={`Log your purchases for ${monthLabel(budgetMonth)} to track spending by category.`}
                action={<Button onClick={() => { setEditPurchase(null); setPurchaseDrawer(true); }} className="aurora-btn rounded-xl"><Plus className="h-4 w-4 mr-2" /> Log Purchase</Button>}
              />
            );

            // Spending by category
            const byCategory = new Map<string, number>();
            for (const p of monthPurchases) {
              const key = p.categoryId ?? "__uncategorized__";
              byCategory.set(key, (byCategory.get(key) ?? 0) + p.amount);
            }

            return (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="aurora-card"><CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-amber-400">${fmt(monthTotal)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{monthPurchases.length} purchases</p>
                  </CardContent></Card>
                  <Card className="aurora-card"><CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Largest Category</p>
                    {(() => {
                      const top = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0];
                      if (!top) return <p className="text-xl font-bold">—</p>;
                      const cat = budgetCategories.find((c) => c.id === top[0]);
                      return (
                        <>
                          <p className="text-xl font-bold">{cat ? `${cat.emoji ?? ""} ${cat.name}` : "Uncategorized"}</p>
                          <p className="text-xs text-muted-foreground mt-1">${fmt(top[1])}</p>
                        </>
                      );
                    })()}
                  </CardContent></Card>
                  <Card className="aurora-card"><CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Most Charged To</p>
                    {(() => {
                      const byAcct = new Map<string, number>();
                      for (const p of monthPurchases) if (p.accountId) byAcct.set(p.accountId, (byAcct.get(p.accountId) ?? 0) + p.amount);
                      const top = Array.from(byAcct.entries()).sort((a, b) => b[1] - a[1])[0];
                      if (!top) return <p className="text-xl font-bold">—</p>;
                      const acct = financialAccounts.find((a) => a.id === top[0]);
                      return (
                        <>
                          <p className="text-xl font-bold truncate">{acct?.name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground mt-1">${fmt(top[1])}</p>
                        </>
                      );
                    })()}
                  </CardContent></Card>
                </div>

                {/* By-category breakdown */}
                {byCategory.size > 0 && (
                  <Card className="aurora-card">
                    <CardHeader className="pb-2"><CardTitle className="text-base">By Category</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]).map(([catId, total]) => {
                        const cat = budgetCategories.find((c) => c.id === catId);
                        const budget = cat?.monthlyBudget ?? 0;
                        const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
                        const over = budget > 0 && total > budget;
                        return (
                          <div key={catId}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">
                                {cat ? `${cat.emoji ?? ""} ${cat.name}` : "Uncategorized"}
                              </span>
                              <span className={over ? "text-red-400 font-semibold" : ""}>
                                ${fmt(total)}{budget > 0 && ` / $${fmt(budget)}`}
                              </span>
                            </div>
                            {budget > 0 && <Progress value={pct} className={`h-1.5 ${over ? "[&>div]:bg-red-400" : ""}`} />}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Purchase list */}
                <Card className="aurora-card">
                  <CardHeader className="pb-2"><CardTitle className="text-base">All Purchases — {monthLabel(budgetMonth)}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {[...monthPurchases].sort((a, b) => b.date.localeCompare(a.date)).map((p) => {
                        const cat = budgetCategories.find((c) => c.id === p.categoryId);
                        const acct = financialAccounts.find((a) => a.id === p.accountId);
                        return (
                          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{p.description}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{p.date}</span>
                                {cat && <span>{cat.emoji ?? ""} {cat.name}</span>}
                                {acct && <span className="text-amber-400/80">{acct.name}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              <span className="font-semibold">${fmt(p.amount)}</span>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => { setEditPurchase(p); setPurchaseDrawer(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteFinancialPurchase(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ── MONTHLY REVIEW ────────────────────────────────────────────── */}
        <TabsContent value="review" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Monthly Review</h2>
              <p className="text-sm text-muted-foreground">Track your financial progress month by month</p>
            </div>
            <Button onClick={() => { setEditReview(null); setReviewDrawer(true); }} className="aurora-btn rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Add Review
            </Button>
          </div>

          {monthlyFinancialReviews.length === 0 ? (
            <EmptyState icon={BookOpen} title="No reviews yet" description="Log your first monthly financial review to track your investment rate."
              action={<Button onClick={() => { setEditReview(null); setReviewDrawer(true); }} className="aurora-btn rounded-xl"><Plus className="h-4 w-4 mr-2" /> Add Review</Button>}
            />
          ) : (
            <div className="space-y-4">
              {[...monthlyFinancialReviews].sort((a, b) => b.month.localeCompare(a.month)).map((r) => (
                <Card key={r.id} className="aurora-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <p className="font-semibold text-base">{monthLabel(r.month)}</p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditReview(r); setReviewDrawer(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMonthlyFinancialReview(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div><p className="text-xs text-muted-foreground">Income</p><p className="font-semibold">${fmt(r.totalIncome)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Spent</p><p className="font-semibold">${fmt(r.totalSpent)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Invested</p><p className="font-semibold text-aurora-teal">${fmt(r.totalInvested)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Invest Rate</p><p className="font-semibold text-aurora-purple">{r.investmentRate}%</p></div>
                    </div>
                    {r.highlights && <div className="mb-2"><p className="text-xs font-medium text-muted-foreground mb-1">Highlights</p><p className="text-sm">{r.highlights}</p></div>}
                    {r.improvements && <div className="mb-2"><p className="text-xs font-medium text-muted-foreground mb-1">Improvements</p><p className="text-sm">{r.improvements}</p></div>}
                    {r.reflection && <div><p className="text-xs font-medium text-muted-foreground mb-1">Reflection</p><p className="text-sm text-muted-foreground">{r.reflection}</p></div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── DRAWERS ──────────────────────────────────────────────────────── */}
      <FinancialAccountDrawer
        open={accountDrawer || !!editAccount}
        onOpenChange={(open) => { if (!open) setEditAccount(null); setAccountDrawer(open); }}
        account={editAccount}
        onSave={(data) => { if (editAccount) { updateFinancialAccount(editAccount.id, data); setEditAccount(null); } else addFinancialAccount(data); setAccountDrawer(false); }}
      />
      <SinkingFundDrawer
        open={fundDrawer || !!editFund}
        onOpenChange={(open) => { if (!open) setEditFund(null); setFundDrawer(open); }}
        fund={editFund}
        onSave={(data) => { if (editFund) { updateSinkingFund(editFund.id, data); setEditFund(null); } else addSinkingFund(data); setFundDrawer(false); }}
      />
      <PaycheckDrawer
        open={paycheckDrawer || !!editPaycheck}
        onOpenChange={(open) => { if (!open) setEditPaycheck(null); setPaycheckDrawer(open); }}
        paycheck={editPaycheck}
        onSave={(data) => { if (editPaycheck) { updatePaycheck(editPaycheck.id, data); setEditPaycheck(null); } else addPaycheck(data); setPaycheckDrawer(false); }}
      />
      <InvestmentHoldingDrawer
        open={holdingDrawer || !!editHolding}
        onOpenChange={(open) => { if (!open) setEditHolding(null); setHoldingDrawer(open); }}
        holding={editHolding}
        onSave={(data) => { if (editHolding) { updateInvestmentHolding(editHolding.id, data); setEditHolding(null); } else addInvestmentHolding(data); setHoldingDrawer(false); }}
      />
      <MonthlyFinancialReviewDrawer
        open={reviewDrawer || !!editReview}
        onOpenChange={(open) => { if (!open) setEditReview(null); setReviewDrawer(open); }}
        review={editReview}
        onSave={(data) => { if (editReview) { updateMonthlyFinancialReview(editReview.id, data); setEditReview(null); } else addMonthlyFinancialReview(data); setReviewDrawer(false); }}
      />
      <BudgetCategoryDrawer
        open={budgetCatDrawer || !!editBudgetCat}
        onOpenChange={(open) => { if (!open) setEditBudgetCat(null); setBudgetCatDrawer(open); }}
        category={editBudgetCat}
        onSave={(data) => { if (editBudgetCat) { updateBudgetCategory(editBudgetCat.id, data); setEditBudgetCat(null); } else addBudgetCategory(data); setBudgetCatDrawer(false); }}
      />
      <AccountPartitionDrawer
        open={partitionDrawer || !!editPartition}
        onOpenChange={(open) => { if (!open) setEditPartition(null); setPartitionDrawer(open); }}
        partition={editPartition}
        accountId={partitionAccountId}
        accounts={financialAccounts}
        sinkingFunds={sinkingFunds}
        onSave={(data) => {
          if (editPartition) { updateAccountPartition(editPartition.id, data); setEditPartition(null); }
          else addAccountPartition(data);
          setPartitionDrawer(false);
        }}
      />
      <FinancialPurchaseDrawer
        open={purchaseDrawer || !!editPurchase}
        onOpenChange={(open) => { if (!open) setEditPurchase(null); setPurchaseDrawer(open); }}
        purchase={editPurchase}
        budgetCategories={budgetCategories}
        accounts={financialAccounts}
        onSave={(data) => {
          if (editPurchase) { updateFinancialPurchase(editPurchase.id, data); setEditPurchase(null); }
          else addFinancialPurchase(data);
          setPurchaseDrawer(false);
        }}
      />
    </div>
  );
}

// ── HoldingsSection ──────────────────────────────────────────────────────────

function HoldingsSection({
  title,
  holdings,
  sectionTotal,
  colors,
  onEdit,
  onDelete,
}: {
  title: string;
  holdings: InvestmentHolding[];
  sectionTotal: number;
  colors: string[];
  onEdit: (h: InvestmentHolding) => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...holdings].sort(
    (a, b) => b.shares * b.currentPrice - a.shares * a.currentPrice
  );
  const subTotal = sorted.reduce((s, h) => s + h.shares * h.currentPrice, 0);

  const slices: ChartSlice[] = sorted.map((h) => {
    const value = h.shares * h.currentPrice;
    return { ticker: h.ticker, value, pct: subTotal > 0 ? (value / subTotal) * 100 : 0 };
  });

  return (
    <Card className="aurora-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
          <span className="text-sm font-semibold">${fmt(subTotal)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Donut chart */}
          <div className="shrink-0">
            <AllocationDonutChart slices={slices} colors={colors} total={subTotal} />
          </div>

          {/* Holdings table */}
          <div className="flex-1 min-w-0">
            <div className="space-y-0">
              {sorted.map((h, i) => {
                const value = h.shares * h.currentPrice;
                const pct = subTotal > 0 ? (value / subTotal) * 100 : 0;
                const pctOfTotal = sectionTotal > 0 ? (value / sectionTotal) * 100 : 0;
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: colors[i % colors.length] }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{h.ticker}</p>
                        {h.name && (
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{h.name}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${CATEGORY_COLORS[h.category]}`}>
                        {h.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium">${fmt(value)}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.shares} sh · {pct.toFixed(1)}% of section · {pctOfTotal.toFixed(1)}% of brokerage
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(h)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(h.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── GoalCard ─────────────────────────────────────────────────────────────────

function GoalCard({ fund, linkedPartitions, accounts, onEdit, onDelete, onAddFunds }: {
  fund: SinkingFund;
  linkedPartitions: AccountPartition[];
  accounts: FinancialAccount[];
  onEdit: () => void;
  onDelete: () => void;
  onAddFunds: (amt: number) => void;
}) {
  const pct = Math.min((fund.currentAmount / fund.targetAmount) * 100, 100);
  const remaining = Math.max(fund.targetAmount - fund.currentAmount, 0);
  const monthsLeft = fund.monthlyContribution > 0 && remaining > 0
    ? Math.ceil(remaining / fund.monthlyContribution)
    : null;

  return (
    <Card className={`aurora-card ${fund.completed ? "opacity-60" : ""}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-base">{fund.emoji && <span className="mr-1">{fund.emoji}</span>}{fund.name}</p>
            <Badge variant="outline" className="text-xs mt-0.5">{fund.category}</Badge>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-aurora-teal">${fmt(fund.currentAmount)}</span>
            <span className="text-muted-foreground">${fmt(fund.targetAmount)}</span>
          </div>
          <Progress value={pct} className="h-2.5" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{pct.toFixed(0)}% complete</span>
          {monthsLeft !== null && !fund.completed && <span>~{monthsLeft} mo at ${fmt(fund.monthlyContribution)}/mo</span>}
          {fund.completed && <span className="text-aurora-teal font-medium">Done!</span>}
        </div>
        {!fund.completed && (
          <Button size="sm" variant="outline" className="w-full aurora-btn-secondary rounded-lg text-xs"
            onClick={() => {
              const input = prompt(`Add funds to "${fund.name}" (current: $${fmt(fund.currentAmount)})`);
              const amt = parseFloat(input ?? "");
              if (!isNaN(amt) && amt > 0) onAddFunds(amt);
            }}
          >
            + Add Funds
          </Button>
        )}

        {/* Linked account partitions */}
        {linkedPartitions.length > 0 && (
          <div className="pt-1 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-1.5">Stored in:</p>
            <div className="space-y-1">
              {linkedPartitions.map((p) => {
                const acct = accounts.find((a) => a.id === p.accountId);
                return (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{acct?.name ?? "Unknown account"}</span>
                    <span className="font-medium text-aurora-teal">${fmt(p.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── AccountCard ───────────────────────────────────────────────────────────────

function AccountCard({
  account, partitions, sinkingFunds, onEdit, onDelete, onAddPartition, onEditPartition, onDeletePartition,
}: {
  account: FinancialAccount;
  partitions: AccountPartition[];
  sinkingFunds: SinkingFund[];
  onEdit: () => void;
  onDelete: () => void;
  onAddPartition: () => void;
  onEditPartition: (p: AccountPartition) => void;
  onDeletePartition: (id: string) => void;
}) {
  const isCC = account.type === "credit_card";
  const utilization = isCC && account.creditLimit && account.creditLimit > 0
    ? Math.round((account.balance / account.creditLimit) * 100)
    : null;
  const allocatedTotal = partitions.reduce((s, p) => s + p.amount, 0);
  const unallocated = Math.max(account.balance - allocatedTotal, 0);

  return (
    <Card className="aurora-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.institution}</p>
            <Badge variant="outline" className="text-xs mt-1">{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <div>
          {isCC ? (
            <>
              <p className="text-xs text-muted-foreground mb-1">Balance owed</p>
              <p className="text-xl font-bold text-amber-400">${fmt(account.balance)}</p>
              {account.creditLimit && <p className="text-xs text-muted-foreground">Limit: ${fmt(account.creditLimit)}</p>}
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-xl font-bold text-aurora-teal">${fmt(account.balance)}</p>
            </>
          )}
        </div>
        {utilization !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Utilization</span>
              <span className={utilization > 30 ? "text-amber-400" : "text-aurora-teal"}>{utilization}%</span>
            </div>
            <Progress value={utilization} className="h-1.5" />
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {account.dueDate && <span>Due day {account.dueDate}</span>}
          {account.autopay && <span className="text-aurora-teal">Autopay on</span>}
          {account.notes && <span className="truncate max-w-[160px]">{account.notes}</span>}
        </div>

        {/* Partitions */}
        {!isCC && (
          <div className="border-t border-border/40 pt-3 space-y-1.5">
            {partitions.map((p) => {
              const fund = sinkingFunds.find((f) => f.id === p.sinkingFundId);
              return (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {fund?.emoji && <span>{fund.emoji}</span>}
                    {p.label}
                    {fund && <span className="opacity-60">({fund.name})</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-aurora-teal">${fmt(p.amount)}</span>
                    <button onClick={() => onEditPartition(p)} className="opacity-40 hover:opacity-100"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => onDeletePartition(p.id)} className="opacity-40 hover:opacity-100 text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              );
            })}
            {partitions.length > 0 && (
              <div className="flex justify-between text-xs pt-1 border-t border-border/30">
                <span className="text-muted-foreground">Unallocated</span>
                <span className="font-medium">${fmt(unallocated)}</span>
              </div>
            )}
            <button
              onClick={onAddPartition}
              className="text-xs text-aurora-teal hover:underline flex items-center gap-1 pt-0.5"
            >
              <SplitSquareVertical className="h-3 w-3" /> Add partition
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

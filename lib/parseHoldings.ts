import type { HoldingCategory } from "@/types/finances";

export interface ParsedHolding {
  ticker: string;
  name: string;
  shares: number;
  currentPrice: number;
  category: HoldingCategory;
}

// ── Category detection ────────────────────────────────────────────────────────

const CRYPTO_TICKERS = new Set([
  "BTC", "ETH", "DOGE", "SHIB", "ADA", "SOL", "LTC", "XRP", "DOT",
  "LINK", "MATIC", "AVAX", "UNI", "AAVE", "COMP", "USDC", "USDT",
  "BCH", "ETC", "ALGO", "ATOM", "XLM", "VET", "SAND", "MANA",
]);

const ETF_NAME_KEYWORDS = [
  "etf", "fund", "trust", "proshares", "ishares", "vanguard", "spdr",
  "invesco", "direxion", "schwab", "fidelity", "blackrock",
];

function detectCategory(ticker: string, name: string): HoldingCategory {
  if (CRYPTO_TICKERS.has(ticker.toUpperCase())) return "crypto";
  const lower = name.toLowerCase();
  if (ETF_NAME_KEYWORDS.some((kw) => lower.includes(kw))) return "etf";
  return "stock";
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

export function parseRobinhoodCSV(text: string): ParsedHolding[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ""));
  const idxSymbol = headers.findIndex((h) => h === "symbol");
  const idxQty = headers.findIndex((h) => h.includes("quantity") || h === "qty");
  const idxEquity = headers.findIndex((h) => h === "equity" || h.includes("marketvalue"));
  const idxAvgCost = headers.findIndex((h) => h.includes("averagecost") || h.includes("avgcost"));
  const idxType = headers.findIndex((h) => h === "type" || h.includes("assettype"));
  const idxName = headers.findIndex((h) => h === "name" || h.includes("description"));
  if (idxSymbol < 0) return [];

  const results: ParsedHolding[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    const ticker = (cols[idxSymbol] ?? "").toUpperCase();
    if (!ticker) continue;

    const qty = parseFloat((cols[idxQty] ?? "").replace(/[$,%]/g, ""));
    const equity = parseFloat((cols[idxEquity] ?? "").replace(/[$,%]/g, ""));
    const avgCost = parseFloat((cols[idxAvgCost] ?? "").replace(/[$,%]/g, ""));
    const rawType = (cols[idxType] ?? "").toLowerCase();
    const name = idxName >= 0 ? cols[idxName] ?? ticker : ticker;

    if (isNaN(qty) || qty <= 0) continue;
    let currentPrice = 0;
    if (!isNaN(equity) && equity > 0) currentPrice = equity / qty;
    else if (!isNaN(avgCost) && avgCost > 0) currentPrice = avgCost;
    if (currentPrice <= 0) continue;

    let category: HoldingCategory = "stock";
    if (rawType.includes("etf") || rawType.includes("fund")) category = "etf";
    else if (rawType.includes("crypto") || rawType.includes("currency")) category = "crypto";

    results.push({ ticker, name, shares: qty, currentPrice, category });
  }
  return results;
}

// ── PDF parser ────────────────────────────────────────────────────────────────

function parsePrice(s: string): number {
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

// ── Brokerage statement parser (regular account statement PDF) ────────────────

const BROKERAGE_HOLDING_SECTIONS = ["Securities Held in Account", "Loaned Securities"];
const BROKERAGE_SECTION_END_MARKERS = [
  "Account Activity", "Executed Trades", "Stock Lending - Loan",
  "Stock Lending - Collateral", "Deposit Sweep", "Brokerage-held Cash Activity",
  "Important Information",
];

function parseBrokerageTokens(tokens: string[]): ParsedHolding[] {
  const holdingMap = new Map<string, ParsedHolding>();
  let inSection = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (BROKERAGE_HOLDING_SECTIONS.some((s) => t.includes(s))) { inSection = true; continue; }
    if (BROKERAGE_SECTION_END_MARKERS.some((s) => t.includes(s))) { inSection = false; continue; }
    if (!inSection) continue;

    // Anchor: each holding is preceded by "Estimated Yield: X.XX%"
    if (!t.startsWith("Estimated Yield:")) continue;

    // Walk backwards to collect the company name (everything since last "X.XX%" or section header)
    const nameTokens: string[] = [];
    let j = i - 1;
    while (j >= 0) {
      const prev = tokens[j];
      if (/^\d+\.\d+%$/.test(prev)) break;
      if (prev.includes("Securities Held") || prev.includes("Loaned Securities")) break;
      if (["Sym/Cusip", "Acct Type", "Portfolio Summary", "of"].includes(prev)) break;
      if (prev.startsWith("Page") && /\d/.test(prev)) break;
      nameTokens.unshift(prev);
      j--;
    }
    const name = nameTokens.join(" ").trim();

    // Pattern after "Estimated Yield:": TICKER → "Cash" → qty → $price → $mktValue
    const ticker = (tokens[i + 1] ?? "").toUpperCase();
    if (!/^[A-Z0-9]{1,6}$/.test(ticker)) continue;
    if (tokens[i + 2] !== "Cash") continue;

    const qty = parseFloat(tokens[i + 3] ?? "");
    if (isNaN(qty) || qty <= 0) continue;

    const price = parsePrice(tokens[i + 4] ?? "");
    if (price <= 0) continue;

    const category = detectCategory(ticker, name);

    // Accumulate — loaned securities are the same position, just on loan
    if (holdingMap.has(ticker)) {
      const existing = holdingMap.get(ticker)!;
      holdingMap.set(ticker, { ...existing, shares: existing.shares + qty });
    } else {
      holdingMap.set(ticker, { ticker, name: name || ticker, shares: qty, currentPrice: price, category });
    }
  }

  return Array.from(holdingMap.values());
}

// ── Crypto statement parser (RHC-Account statement PDF) ──────────────────────
// Column order: Name | Qty | Symbol | Market Value | % of Portfolio
// No "Estimated Yield" anchor, no "Cash" column

const CRYPTO_COLUMN_HEADERS = new Set([
  "QUANTITY", "SYMBOL", "% OF PORTFOLIO",
]);

function parseCryptoTokens(tokens: string[]): ParsedHolding[] {
  const results: ParsedHolding[] = [];

  // Find the section header
  const sectionIdx = tokens.findIndex((t) => t.includes("CRYPTOCURRENCY HELD IN ACCOUNT"));
  if (sectionIdx < 0) return results;

  // Skip past all column header tokens (QUANTITY, SYMBOL, MARKET VALUE ON ..., % OF PORTFOLIO)
  let i = sectionIdx + 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (
      CRYPTO_COLUMN_HEADERS.has(t) ||
      t.startsWith("MARKET VALUE") ||
      t === "NAME"
    ) {
      i++;
      continue;
    }
    break;
  }

  // Each holding is 5 consecutive tokens: Name | Qty | Ticker | $MarketValue | X%
  while (i + 4 < tokens.length) {
    const name = tokens[i];
    const qty = parseFloat(tokens[i + 1] ?? "");
    const ticker = (tokens[i + 2] ?? "").toUpperCase();
    const marketValue = parsePrice(tokens[i + 3] ?? "");
    const pctToken = tokens[i + 4] ?? "";

    // Validate: qty numeric, ticker alphabetic, market value > 0, pct ends with %
    if (
      isNaN(qty) || qty <= 0 ||
      !/^[A-Z0-9]{1,10}$/.test(ticker) ||
      marketValue <= 0 ||
      !pctToken.endsWith("%")
    ) {
      break;
    }

    const currentPrice = marketValue / qty;

    results.push({
      ticker,
      name,
      shares: qty,
      currentPrice,
      category: "crypto",
    });

    i += 5;
  }

  return results;
}

// ── IRA statement parser (IRA-Account statement PDF) ─────────────────────────
// Same section/column layout as brokerage but NO "Estimated Yield:" anchor.
// Pattern per holding: [Name tokens...] TICKER "Cash" qty $price $mktValue X.XX%

function parseIRATokens(tokens: string[]): ParsedHolding[] {
  const holdingMap = new Map<string, ParsedHolding>();
  let inSection = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.includes("Securities Held in Account")) { inSection = true; continue; }
    if (BROKERAGE_SECTION_END_MARKERS.some((s) => t.includes(s))) { inSection = false; continue; }
    if (!inSection) continue;

    // Anchor: all-caps ticker (1-5 chars) followed immediately by "Cash" then a parseable qty
    if (!/^[A-Z]{1,5}$/.test(t)) continue;
    if (tokens[i + 1] !== "Cash") continue;
    const qty = parseFloat(tokens[i + 2] ?? "");
    if (isNaN(qty) || qty <= 0) continue;
    const price = parsePrice(tokens[i + 3] ?? "");
    if (price <= 0) continue;

    const ticker = t;

    // Walk backwards to collect the company name
    const nameTokens: string[] = [];
    let j = i - 1;
    while (j >= 0) {
      const prev = tokens[j];
      if (/^\d+\.\d+%$/.test(prev)) break; // end of previous holding's percentage
      if (prev.includes("Securities Held")) break;
      if (["Sym/Cusip", "Acct Type", "Qty", "Price", "Mkt Value",
           "% of Total Portfolio", "Portfolio Summary"].includes(prev)) break;
      if (prev.startsWith("Page") && /\d/.test(prev)) break;
      nameTokens.unshift(prev);
      j--;
    }
    const name = nameTokens.join(" ").trim();

    holdingMap.set(ticker, {
      ticker,
      name: name || ticker,
      shares: qty,
      currentPrice: price,
      category: detectCategory(ticker, name),
    });
  }

  return Array.from(holdingMap.values());
}

// ── Dispatcher: detect format and route ──────────────────────────────────────

export function parseRobinhoodPDFTokens(tokens: string[]): ParsedHolding[] {
  // Crypto statement (RHC-Account statement)
  if (tokens.some((t) => t.includes("Crypto Statement") || t.includes("CRYPTOCURRENCY HELD IN ACCOUNT"))) {
    return parseCryptoTokens(tokens);
  }
  // IRA statement — same layout as brokerage but no "Estimated Yield:" anchors
  if (tokens.some((t) => t.includes("IRA Account") || t.includes("Roth IRA") || t.includes("Traditional IRA"))) {
    return parseIRATokens(tokens);
  }
  // Regular brokerage statement
  return parseBrokerageTokens(tokens);
}

export async function parsePDFFile(file: File): Promise<ParsedHolding[]> {
  // Dynamic import keeps pdfjs out of SSR bundle
  const pdfjs = await import("pdfjs-dist");

  // Use unpkg CDN for the worker (avoids webpack config complexity)
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const tokens: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if ("str" in item && item.str.trim()) {
        tokens.push(item.str.trim());
      }
    }
  }

  return parseRobinhoodPDFTokens(tokens);
}

// ── Unified entry point ───────────────────────────────────────────────────────

export async function parseHoldingsFile(file: File): Promise<ParsedHolding[]> {
  const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPDF) return parsePDFFile(file);
  return parseRobinhoodCSV(await file.text());
}

const pad = (n: number) => n.toString().padStart(2, "0");

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isToday(iso: string): boolean {
  const d = parseISODate(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export function isWithinDays(iso: string, days: number): boolean {
  const d = parseISODate(iso);
  const t = new Date();

  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export function isThisMonth(iso: string): boolean {
  const d = parseISODate(iso);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
}

export function addMonths(date: Date, n: number): Date {
  const out = new Date(date);
  out.setMonth(out.getMonth() + n);
  return out;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function formatDisplay(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShort(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
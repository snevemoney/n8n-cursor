import type {DailyReport, Holding} from './schema';

/**
 * Excess return vs a benchmark, in percentage points.
 * spread = nameYtdPct − benchmarkYtdPct
 * Example: 13.8 − 12.0 = +1.8
 */
export function vsSpxSpread(nameYtdPct: number, benchmarkYtdPct: number): number {
  return nameYtdPct - benchmarkYtdPct;
}

/**
 * Consecutive red sessions immediately before the latest print, if that print is ≥ 0.
 * Walks streak[n-2] … streak[0] while value < 0. Returns null if the streak did not break.
 */
export function brokenRedStreakLength(streak: number[]): number | null {
  if (streak.length < 2) return null;
  const last = streak[streak.length - 1];
  if (last < 0) return null;
  let n = 0;
  for (let i = streak.length - 2; i >= 0; i--) {
    if (streak[i] < 0) n += 1;
    else break;
  }
  return n === 0 ? null : n;
}

/** Count of sessions with day % < 0 in the given window. */
export function redDaysInWindow(streak: number[]): number {
  return streak.filter((d) => d < 0).length;
}

export function hasOverlap(holding: Holding): boolean {
  return (holding.overlapWith?.length ?? 0) > 0;
}

export function openKicker(report: DailyReport): string {
  return report.meta.kicker ?? `Tonight’s read · ${report.meta.universe.length} lines`;
}

export function signedPct(n: number, decimals = 2): string {
  const abs = Math.abs(n).toFixed(decimals);
  if (n > 0) return `+${abs}%`;
  if (n < 0) return `−${abs}%`;
  return `${abs}%`;
}

export function signedNumber(n: number, decimals = 2): string {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return abs;
}

export function money(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function findName(report: DailyReport, ticker: string) {
  return report.names.find((n) => n.ticker === ticker);
}

export function na(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return 'n/a';
  return String(value);
}

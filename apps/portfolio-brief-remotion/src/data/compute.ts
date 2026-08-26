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

export type OverlapEdge = {from: string; to: string};

export function overlapEdges(holdings: Holding[]): OverlapEdge[] {
  const edges: OverlapEdge[] = [];
  for (const h of holdings) {
    for (const other of h.overlapWith ?? []) {
      edges.push({from: h.ticker, to: other});
    }
  }
  return edges;
}

export function holdingsWithYtd(holdings: Holding[]): Array<Holding & {ytd: number}> {
  return holdings.filter((h): h is Holding & {ytd: number} => h.ytd !== undefined);
}

export function allWeightsUnknown(holdings: Holding[]): boolean {
  return holdings.length === 0 || holdings.every((h) => h.weight === undefined);
}

export function overlappingHoldingCount(holdings: Holding[]): number {
  return holdings.filter((h) => (h.overlapWith?.length ?? 0) > 0).length;
}

const BILLIONS = /\$?\s*([0-9]+(?:\.[0-9]+)?)\s*[–—-]\s*\$?\s*([0-9]+(?:\.[0-9]+)?)\s*B/i;
const ONE_BILLIONS = /~?\$?\s*([0-9]+(?:\.[0-9]+)?)\s*B/i;
const ONE_DOLLARS = /~?\$\s*([0-9]+(?:\.[0-9]+)?)/i;

/** Parse a sourced street/guide print. Returns undefined when the string is not a number. */
export function parseSourcedNumber(value: string): {low?: number; high?: number; mid?: number} | undefined {
  const range = value.match(BILLIONS);
  if (range) {
    const low = Number(range[1]);
    const high = Number(range[2]);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return undefined;
    return {low, high, mid: (low + high) / 2};
  }
  const oneB = value.match(ONE_BILLIONS);
  if (oneB) {
    const mid = Number(oneB[1]);
    if (!Number.isFinite(mid)) return undefined;
    return {mid};
  }
  const one = value.match(ONE_DOLLARS);
  if (one) {
    const mid = Number(one[1]);
    if (!Number.isFinite(mid)) return undefined;
    return {mid};
  }
  return undefined;
}

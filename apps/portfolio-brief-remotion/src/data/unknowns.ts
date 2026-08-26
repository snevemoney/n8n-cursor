import type {DailyReport, UnknownItem} from './schema';

/** Structural gaps on the typed object. Flags only — never fill with estimates. */
export function flagMissing(report: DailyReport): string[] {
  const missing: string[] = [];
  if (!report.markets?.ca?.indices?.length) missing.push('ca.tsxClose');
  if (!report.markets?.ca?.cadUsd) missing.push('ca.cadUsd');
  if (!report.markets?.global?.indices?.length) missing.push('global.indices');
  if (report.holdings.length > 0 && report.holdings.every((h) => h.weight === undefined)) {
    missing.push('holdings[].weight');
  }
  if (report.nextNvda.length === 0) missing.push('nextNvda[]');
  if ((report.opportunities?.candidates.length ?? 0) === 0) missing.push('opportunities.candidates');
  const nvda = report.names.find((n) => n.ticker.toUpperCase() === 'NVDA');
  if (nvda && (!nvda.scores || nvda.scores.length === 0)) missing.push('names.NVDA.scores');
  return missing;
}

/** Desk writes highest-leverage first. Morning60 takes the first N. */
export function pickUnknowns(report: DailyReport, limit?: number): UnknownItem[] {
  const rows = report.unknowns;
  if (limit === undefined) return rows;
  return rows.slice(0, limit);
}

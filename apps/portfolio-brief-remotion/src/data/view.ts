import type {DailyReport, MarketPrint, MarketVenue, OpportunityCandidate, RatingTone} from './schema';

export type TapeRow = MarketPrint;

export type WorldLaneKey = 'GLOBAL' | 'US' | 'CA';

export type WorldLaneView = {
  key: WorldLaneKey;
  note?: string;
  rows: TapeRow[];
};

export type ScoutCardModel = {
  ticker: string;
  market?: MarketVenue;
  thesis: string;
  tone?: RatingTone;
  whyNow?: string;
  whatKillsIt?: string;
  relativeToBook?: string;
  source: 'opportunity' | 'nextNvda';
};

const bookTickers = (report: DailyReport): Set<string> =>
  new Set([
    ...report.meta.universe.map((t) => t.toUpperCase()),
    ...report.holdings.map((h) => h.ticker.toUpperCase()),
  ]);

export function visibleOpportunities(report: DailyReport): OpportunityCandidate[] {
  const raw = report.opportunities?.candidates ?? [];
  const exclude = report.opportunities?.excludePortfolioDupes ?? true;
  if (!exclude) return raw;
  const book = bookTickers(report);
  return raw.filter((c) => !book.has(c.ticker.toUpperCase()));
}

export function featuredScout(report: DailyReport): ScoutCardModel | null {
  const first = visibleOpportunities(report)[0];
  if (first) {
    return {
      ticker: first.ticker,
      market: first.market,
      thesis: first.thesis,
      tone: first.tone,
      whyNow: first.whyNow,
      whatKillsIt: first.whatKillsIt,
      relativeToBook: first.relativeToBook,
      source: 'opportunity',
    };
  }
  const watch = report.nextNvda[0];
  if (!watch) return null;
  return {
    ticker: watch.ticker,
    thesis: watch.thesis,
    tone: watch.tone,
    source: 'nextNvda',
  };
}

export function worldTapeLanes(report: DailyReport): WorldLaneView[] {
  const out: WorldLaneView[] = [];
  const g = report.markets?.global;
  if (g) {
    const rows: TapeRow[] = [...(g.indices ?? []), ...(g.fx ?? []), ...(g.commodities ?? []), ...(g.rates ?? [])];
    if (rows.length > 0 || g.note) out.push({key: 'GLOBAL', note: g.note, rows});
  }
  const u = report.markets?.us;
  if (u) {
    const rows: TapeRow[] = [...(u.indices ?? []), ...(u.sectors ?? []), ...(u.yields ?? [])];
    if (u.breadth) rows.push({label: 'Breadth', note: u.breadth});
    if (rows.length > 0 || u.note) out.push({key: 'US', note: u.note, rows});
  }
  const c = report.markets?.ca;
  if (c) {
    const rows: TapeRow[] = [...(c.indices ?? []), ...(c.sectors ?? [])];
    if (c.cadUsd) rows.push({label: 'CAD/USD', value: c.cadUsd});
    if (rows.length > 0 || c.note) out.push({key: 'CA', note: c.note, rows});
  }
  return out;
}

export function hasWorldTape(report: DailyReport): boolean {
  return worldTapeLanes(report).length > 0;
}

export function calendarItems(report: DailyReport) {
  return report.markets?.calendar?.items ?? [];
}

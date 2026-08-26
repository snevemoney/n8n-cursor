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

export type FunnelGate = {
  id: string;
  label: string;
  count: number;
  unknown?: boolean;
};

export type FunnelFail = {
  ticker: string;
  reason: string;
};

export type FunnelModel = {
  gates: FunnelGate[];
  passed: number;
  closestFails: FunnelFail[];
};

/**
 * Next-NVDA sleeve funnel from sourced fields only.
 * No invented universe size, no ANET/PLTR/VRT, no pass scores.
 */
export function opportunityFunnel(report: DailyReport): FunnelModel {
  const book = bookTickers(report);
  const universe = report.meta.universe.length;
  const named = [
    ...report.nextNvda.map((c) => ({ticker: c.ticker, reason: c.thesis, inBook: book.has(c.ticker.toUpperCase())})),
    ...(report.opportunities?.candidates ?? []).map((c) => ({
      ticker: c.ticker,
      reason: c.whatKillsIt || c.thesis,
      inBook: book.has(c.ticker.toUpperCase()),
    })),
  ];
  const uniqueNamed = new Map<string, (typeof named)[number]>();
  for (const row of named) {
    uniqueNamed.set(row.ticker.toUpperCase(), row);
  }
  const scouts = [...uniqueNamed.values()];
  const outsideBook = scouts.filter((s) => !s.inBook);
  const visible = visibleOpportunities(report);

  return {
    gates: [
      {id: 'universe', label: 'Universe (book)', count: universe},
      {id: 'named', label: 'Named on scout tape', count: scouts.length},
      {id: 'outside', label: 'Not already in book', count: outsideBook.length},
      {id: 'visible', label: 'Visible after dupe filter', count: visible.length},
      {id: 'passed', label: 'Passed Next-NVDA bar', count: 0},
    ],
    passed: 0,
    closestFails: scouts.map((s) => ({ticker: s.ticker, reason: s.reason})),
  };
}

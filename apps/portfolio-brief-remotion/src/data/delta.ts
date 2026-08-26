import type {DailyReport, Holding, MarketTape, RatingTone} from './schema';

export type RatingFlip = {
  ticker: string;
  from: string;
  to: string;
  fromTone: RatingTone;
  toTone: RatingTone;
};

export type TapeMove = {
  field: string;
  prev: string;
  curr: string;
};

export type DeltaTape = {
  hasPrior: boolean;
  priorDate?: string;
  currDate: string;
  ratingFlips: RatingFlip[];
  addedTickers: string[];
  removedTickers: string[];
  catalystChanged: boolean;
  priorCatalyst?: string;
  currCatalyst: string;
  tapeMoves: TapeMove[];
  addedScouts: string[];
  removedScouts: string[];
  addedOpportunities: string[];
  removedOpportunities: string[];
  thesisChanged: boolean;
};

const fmt = (n: number, decimals: number): string =>
  n.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

const holdingMap = (report: DailyReport): Map<string, Holding> =>
  new Map(report.holdings.map((h) => [h.ticker.toUpperCase(), h]));

const scoutTickers = (report: DailyReport): string[] => {
  const next = report.nextNvda.map((c) => c.ticker.toUpperCase());
  const opp = (report.opportunities?.candidates ?? []).map((c) => c.ticker.toUpperCase());
  return [...new Set([...next, ...opp])];
};

const oppTickers = (report: DailyReport): string[] =>
  (report.opportunities?.candidates ?? []).map((c) => c.ticker.toUpperCase());

const pushMove = (out: TapeMove[], field: string, prev?: string, curr?: string) => {
  if (prev === curr) return;
  if (prev === undefined && curr === undefined) return;
  out.push({field, prev: prev ?? 'n/a', curr: curr ?? 'n/a'});
};

const tapeMoves = (prev: MarketTape, curr: MarketTape): TapeMove[] => {
  const out: TapeMove[] = [];
  pushMove(out, 'SPX close', prev.spxClose === undefined ? undefined : fmt(prev.spxClose, 2), curr.spxClose === undefined ? undefined : fmt(curr.spxClose, 2));
  pushMove(out, 'SPX day', prev.spxDayPct === undefined ? undefined : `${prev.spxDayPct}`, curr.spxDayPct === undefined ? undefined : `${curr.spxDayPct}`);
  pushMove(out, 'Nasdaq day', prev.nasdaqDayPct === undefined ? undefined : `${prev.nasdaqDayPct}`, curr.nasdaqDayPct === undefined ? undefined : `${curr.nasdaqDayPct}`);
  pushMove(out, '10Y', prev.tenYearYield === undefined ? undefined : `${prev.tenYearYield}`, curr.tenYearYield === undefined ? undefined : `${curr.tenYearYield}`);
  pushMove(out, 'Tape note', prev.note, curr.note);
  return out;
};

export function emptyDelta(curr: DailyReport): DeltaTape {
  return {
    hasPrior: false,
    currDate: curr.meta.date,
    ratingFlips: [],
    addedTickers: [],
    removedTickers: [],
    catalystChanged: false,
    currCatalyst: curr.meta.catalyst,
    tapeMoves: [],
    addedScouts: [],
    removedScouts: [],
    addedOpportunities: [],
    removedOpportunities: [],
    thesisChanged: false,
  };
}

export function diffEpisodes(prev: DailyReport | null, curr: DailyReport): DeltaTape {
  if (!prev) return emptyDelta(curr);

  const older = holdingMap(prev);
  const newer = holdingMap(curr);
  const ratingFlips: RatingFlip[] = [];
  for (const [ticker, h] of newer) {
    const was = older.get(ticker);
    if (was && (was.rating !== h.rating || was.tone !== h.tone)) {
      ratingFlips.push({
        ticker,
        from: was.rating,
        to: h.rating,
        fromTone: was.tone,
        toTone: h.tone,
      });
    }
  }

  const prevScouts = new Set(scoutTickers(prev));
  const currScouts = new Set(scoutTickers(curr));
  const prevOpp = new Set(oppTickers(prev));
  const currOpp = new Set(oppTickers(curr));

  return {
    hasPrior: true,
    priorDate: prev.meta.date,
    currDate: curr.meta.date,
    ratingFlips,
    addedTickers: [...newer.keys()].filter((t) => !older.has(t)).sort(),
    removedTickers: [...older.keys()].filter((t) => !newer.has(t)).sort(),
    catalystChanged: prev.meta.catalyst !== curr.meta.catalyst,
    priorCatalyst: prev.meta.catalyst,
    currCatalyst: curr.meta.catalyst,
    tapeMoves: tapeMoves(prev.market, curr.market),
    addedScouts: [...currScouts].filter((t) => !prevScouts.has(t)).sort(),
    removedScouts: [...prevScouts].filter((t) => !currScouts.has(t)).sort(),
    addedOpportunities: [...currOpp].filter((t) => !prevOpp.has(t)).sort(),
    removedOpportunities: [...prevOpp].filter((t) => !currOpp.has(t)).sort(),
    thesisChanged: prev.meta.thesis !== curr.meta.thesis,
  };
}

export function deltaChangeCount(d: DeltaTape): number {
  return (
    d.ratingFlips.length +
    d.addedTickers.length +
    d.removedTickers.length +
    d.tapeMoves.length +
    d.addedScouts.length +
    d.addedOpportunities.length +
    (d.catalystChanged ? 1 : 0) +
    (d.thesisChanged ? 1 : 0)
  );
}

import {findName, overlappingHoldingCount, parseSourcedNumber, redDaysInWindow} from './compute';
import type {Consensus, ConsensusRange, DailyReport, PredictionRow} from './schema';

export const FORMULA_IDS = [
  'regime',
  'nvda_fundamentals',
  'nvda_momentum',
  'ai_demand',
  'nvda_expectation_risk',
  'portfolio_concentration',
] as const;

export type FormulaId = (typeof FORMULA_IDS)[number];

const LABELS: Record<FormulaId, string> = {
  regime: 'Regime',
  nvda_fundamentals: 'NVDA fundamentals',
  nvda_momentum: 'NVDA momentum',
  ai_demand: 'AI demand',
  nvda_expectation_risk: 'NVDA expectation risk',
  portfolio_concentration: 'Portfolio concentration',
};

const unknown = (id: FormulaId, inputs: string[]): PredictionRow => ({
  id,
  label: LABELS[id],
  formulaId: id,
  inputs,
  status: 'unknown',
});

/** No named regime formula with sourced inputs (breadth / VIX / tape regime) on current episodes. */
export function regime(_report: DailyReport): PredictionRow {
  return unknown('regime', ['market.regime']);
}

/** String fundamentals exist; no formula maps them to a composite score. */
export function nvdaFundamentals(report: DailyReport): PredictionRow {
  const nvda = findName(report, 'NVDA');
  if (!nvda?.fundamentals?.length) {
    return unknown('nvda_fundamentals', ['names.NVDA.fundamentals']);
  }
  return unknown('nvda_fundamentals', ['names.NVDA.fundamentals', 'named.composite.mapping']);
}

/** Red sessions in the sourced streak window. Not a 0–100 score. */
export function nvdaMomentum(report: DailyReport): PredictionRow {
  const streak = findName(report, 'NVDA')?.streak;
  if (!streak || streak.length === 0) {
    return unknown('nvda_momentum', ['names.NVDA.streak']);
  }
  return {
    id: 'nvda_momentum',
    label: LABELS.nvda_momentum,
    value: redDaysInWindow(streak),
    unit: `red of ${streak.length}`,
    formulaId: 'nvda_momentum',
    inputs: ['names.NVDA.streak'],
    status: 'ok',
  };
}

/** Narrative chips are not a demand index. */
export function aiDemand(_report: DailyReport): PredictionRow {
  return unknown('ai_demand', ['names.NVDA.demandIndex']);
}

/** Whisper / high-expectation zone is missing unless the episode supplies it. */
export function nvdaExpectationRisk(report: DailyReport): PredictionRow {
  const whisper = findName(report, 'NVDA')?.consensus?.range?.whisper;
  if (whisper === undefined) {
    return unknown('nvda_expectation_risk', ['names.NVDA.consensus.range.whisper']);
  }
  return {
    id: 'nvda_expectation_risk',
    label: LABELS.nvda_expectation_risk,
    value: whisper,
    unit: findName(report, 'NVDA')?.consensus?.range?.unit,
    formulaId: 'nvda_expectation_risk',
    inputs: ['names.NVDA.consensus.range.whisper'],
    status: 'ok',
  };
}

/**
 * Overlap-line count when `overlapWith` is present.
 * Weight HHI only when every holding has a sourced weight — never estimate.
 */
export function portfolioConcentration(report: DailyReport): PredictionRow {
  const holdings = report.holdings;
  if (holdings.length === 0) {
    return unknown('portfolio_concentration', ['holdings[]']);
  }
  const weights = holdings.map((h) => h.weight).filter((w): w is number => w !== undefined);
  if (weights.length === holdings.length) {
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);
    return {
      id: 'portfolio_concentration',
      label: LABELS.portfolio_concentration,
      value: hhi,
      unit: 'HHI',
      formulaId: 'portfolio_concentration',
      inputs: ['holdings[].weight'],
      status: 'ok',
    };
  }
  const anyOverlap = holdings.some((h) => h.overlapWith !== undefined);
  if (!anyOverlap) {
    return unknown('portfolio_concentration', ['holdings[].overlapWith', 'holdings[].weight']);
  }
  return {
    id: 'portfolio_concentration',
    label: LABELS.portfolio_concentration,
    value: overlappingHoldingCount(holdings),
    unit: `of ${holdings.length} lines overlap`,
    formulaId: 'portfolio_concentration',
    inputs: ['holdings[].overlapWith'],
    status: 'ok',
  };
}

const RUNNERS: Record<FormulaId, (report: DailyReport) => PredictionRow> = {
  regime,
  nvda_fundamentals: nvdaFundamentals,
  nvda_momentum: nvdaMomentum,
  ai_demand: aiDemand,
  nvda_expectation_risk: nvdaExpectationRisk,
  portfolio_concentration: portfolioConcentration,
};

/** Always computed. Episode `predictions[]` is ignored for values — no LLM-fill path. */
export function buildPredictionBoard(report: DailyReport): PredictionRow[] {
  return FORMULA_IDS.map((id) => RUNNERS[id](report));
}

export function consensusRangeFromBlock(consensus: Consensus | undefined): ConsensusRange | null {
  if (!consensus) return null;
  if (consensus.range) return consensus.range;
  const revenue = consensus.rows.find((row) => /revenue/i.test(row.label));
  const guide = consensus.rows.find((row) => /guide/i.test(row.label));
  if (!revenue && !guide) return null;
  const parsedRev = revenue ? parseSourcedNumber(revenue.value) : undefined;
  const parsedGuide = guide ? parseSourcedNumber(guide.value) : undefined;
  if (!parsedRev && !parsedGuide) return null;
  return {
    metric: revenue?.label ?? guide?.label ?? 'Consensus',
    unit: /B/i.test(`${revenue?.value ?? ''} ${guide?.value ?? ''}`) ? 'B' : undefined,
    consensus: parsedRev?.mid,
    low: parsedRev?.low,
    high: parsedRev?.high,
    guide: parsedGuide?.mid,
  };
}

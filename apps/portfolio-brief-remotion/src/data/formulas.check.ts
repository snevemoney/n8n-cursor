import {buildPredictionBoard, consensusRangeFromBlock} from './formulas';
import {loadEpisode} from './loadEpisode';

const report = loadEpisode('2026-08-25');
const rows = buildPredictionBoard(report);
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

const assert = (ok: boolean, message: string) => {
  if (!ok) throw new Error(message);
};

assert(rows.length === 6, `expected 6 board rows, got ${rows.length}`);
assert(byId.regime?.status === 'unknown', 'regime must be UNKNOWN without a sourced regime field');
assert(byId.nvda_fundamentals?.status === 'unknown', 'no composite NVDA fundamentals score');
assert(byId.ai_demand?.status === 'unknown', 'AI demand is not a numeric index on this tape');
assert(byId.nvda_expectation_risk?.status === 'unknown', 'whisper missing → expectation risk UNKNOWN');
assert(byId.nvda_momentum?.status === 'ok', 'Aug 25 streak must compute momentum');
assert(byId.nvda_momentum?.value === 6, `momentum should be 6 red of 7, got ${byId.nvda_momentum?.value}`);
assert(byId.portfolio_concentration?.status === 'ok', 'overlap lines must compute concentration');
assert(byId.portfolio_concentration?.value === 3, `3 holdings list overlap, got ${byId.portfolio_concentration?.value}`);
assert(!rows.some((r) => r.value === 91 || r.value === 58), 'must not mint Evens-example decorative scores');

const nvda = report.names.find((n) => n.ticker === 'NVDA');
const range = consensusRangeFromBlock(nvda?.consensus);
assert(Boolean(range), 'Aug 25 revenue band must parse');
assert(range?.whisper === undefined, 'must not invent a whisper');
assert(range?.guide === undefined, 'Aug 25 has no sourced guide');
assert(range?.low === 92.2 && range?.high === 92.3, `street band ${range?.low}-${range?.high}`);

console.log('formulas.check ok', {
  momentum: byId.nvda_momentum,
  concentration: byId.portfolio_concentration,
  unknown: rows.filter((r) => r.status === 'unknown').map((r) => r.id),
});

import {deltaChangeCount, diffEpisodes} from './delta';
import {parseDailyReport} from './schema';

const capital = {
  existingPortfolio: 'HOLD',
  freshCapital: 'none',
  bestAdd: 'VOO',
  highestUpsideWatch: 'none named',
  biggestRisk: 'overlap',
  nextTrigger: 'PCE',
  ifThen: [],
};
const close = {headline: 'x', body: 'y'};

const prev = parseDailyReport({
  meta: {
    date: '2026-08-24',
    dateLabel: 'AUG 24, 2026',
    title: 'Daily Wealth Intelligence',
    thesis: 'Old thesis',
    catalyst: 'Old catalyst',
    universe: ['AAA'],
  },
  market: {spxClose: 1, spxDayPct: 0.1, tenYearYield: 4.7},
  holdings: [{ticker: 'AAA', rating: 'HOLD', tone: 'long', whatMatters: 'fixture'}],
  names: [],
  nextNvda: [],
  opportunities: {candidates: []},
  unknowns: [],
  scenarios: [],
  capitalPlan: capital,
  close,
  tickerTape: [],
});

const curr = parseDailyReport({
  meta: {
    date: '2026-08-25',
    dateLabel: 'AUG 25, 2026',
    title: 'Daily Wealth Intelligence',
    thesis: 'New thesis',
    catalyst: 'New catalyst',
    universe: ['AAA', 'BBB'],
  },
  market: {spxClose: 2, spxDayPct: 0.2, tenYearYield: 4.64},
  holdings: [
    {ticker: 'AAA', rating: 'HOLD — watch', tone: 'watch', whatMatters: 'fixture'},
    {ticker: 'BBB', rating: 'WATCH', tone: 'watch', whatMatters: 'fixture'},
  ],
  names: [],
  nextNvda: [],
  opportunities: {
    candidates: [
      {
        ticker: 'CCC',
        market: 'US',
        thesis: 'fixture only',
        tone: 'watch',
        whyNow: 'fixture',
        whatKillsIt: 'fixture',
      },
    ],
  },
  unknowns: [],
  scenarios: [],
  capitalPlan: capital,
  close,
  tickerTape: [],
});

const none = diffEpisodes(null, curr);
if (none.hasPrior) throw new Error('null prior must be first-episode path');
if (none.ratingFlips.length !== 0 || none.tapeMoves.length !== 0) {
  throw new Error('first episode must not invent a delta');
}

const d = diffEpisodes(prev, curr);
if (!d.hasPrior) throw new Error('prior episode must produce a delta');
if (d.addedTickers.join() !== 'BBB') throw new Error(`addedTickers ${d.addedTickers.join()}`);
if (d.ratingFlips.length !== 1 || d.ratingFlips[0].ticker !== 'AAA') throw new Error('rating flip missing');
if (!d.catalystChanged || !d.thesisChanged) throw new Error('catalyst/thesis change missing');
if (d.tapeMoves.length < 1) throw new Error('tape moves missing');
if (d.addedOpportunities.join() !== 'CCC') throw new Error('opportunity add missing');
if (deltaChangeCount(d) < 4) throw new Error('change count too low');

console.log('delta.check ok', {changes: deltaChangeCount(d), firstEpisode: none.hasPrior});

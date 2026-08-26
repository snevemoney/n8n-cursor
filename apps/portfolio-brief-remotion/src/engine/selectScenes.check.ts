import {loadEpisode, previousEpisode} from '../data/loadEpisode';
import {actsInOrder, selectScenes} from './selectScenes';

const report = loadEpisode('2026-08-25');
const full = selectScenes(report, {cut: 'full', previous: previousEpisode('2026-08-25')});
const morning = selectScenes(report, {cut: 'morning60', previous: previousEpisode('2026-08-25')});

const assert = (ok: boolean, message: string) => {
  if (!ok) throw new Error(message);
};

const kinds = full.scenes.map((s) => s.kind);
assert(kinds.includes('delta'), 'full cut needs a yesterday/first-book beat');
assert(kinds.includes('lookThrough'), 'look-through scene missing');
assert(kinds.includes('predictionBoard'), 'prediction board missing');
assert(kinds.includes('opportunityRadar'), 'radar missing');
assert(kinds.includes('relativePerf'), 'Aug 25 has sourced YTD — relative scene required');
assert(kinds.includes('network'), 'NVDA network missing');
assert(kinds.includes('consensus'), 'NVDA consensus missing');
assert(kinds.includes('streak'), 'NVDA streak missing');
assert(kinds.includes('capitalPlan'), 'capital plan missing');
assert(!kinds.includes('nextNvda'), 'empty Next-NVDA sleeve must not emit the sermon scene');

const acts = actsInOrder(full);
assert(acts[0] === 'MARKET', `first act ${acts[0]}`);
assert(acts.includes('PORTFOLIO') && acts.includes('DEEP DIVE'), 'portfolio + deep dive required');
assert(acts.indexOf('MARKET') < acts.indexOf('PORTFOLIO'), 'MARKET before PORTFOLIO');
assert(acts.indexOf('PORTFOLIO') < acts.indexOf('DEEP DIVE'), 'PORTFOLIO before DEEP DIVE');
assert(acts.indexOf('DEEP DIVE') < acts.indexOf('OPPORTUNITY RADAR'), 'DIVE before RADAR');
assert(acts.indexOf('OPPORTUNITY RADAR') < acts.indexOf('ACTION'), 'RADAR before ACTION');

assert(morning.scenes.some((s) => s.kind === 'opportunityRadar'), 'morning keeps the funnel');
assert(morning.scenes.length < full.scenes.length, 'morning must be shorter');
assert(!full.scenes.some((s) => /Juno|The book is not fundamentally/i.test(s.chapter)), 'chapters must stay short labels');

const first = selectScenes(report, {cut: 'full', previous: null});
const firstDelta = first.scenes.find((s) => s.kind === 'delta');
assert(Boolean(firstDelta && firstDelta.chapter.includes('First book')), 'no prior → first-book beat');

console.log('selectScenes.check ok', {
  fullScenes: full.scenes.length,
  morningScenes: morning.scenes.length,
  acts,
  fullFrames: full.totalFrames,
});

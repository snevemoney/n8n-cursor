import {DEFAULT_EPISODE_ID, loadEpisode} from '../data/loadEpisode';
import {joinedWords, maxWordsForFrames} from './clampSpeech';
import {buildBothCuts} from './buildVoiceScript';
import {lastCueEndFrame} from './scriptFromReport';

const episodeId = DEFAULT_EPISODE_ID;
const report = loadEpisode(episodeId);
const {full, morning60} = buildBothCuts(episodeId);

const assert = (ok: boolean, message: string) => {
  if (!ok) throw new Error(message);
};

for (const script of [full, morning60]) {
  assert(script.cues.length > 0, `${script.cut}: no cues`);
  assert(script.episodeId === episodeId, `${script.cut}: episode id mismatch`);
  assert(lastCueEndFrame(script) <= script.totalFrames, `${script.cut}: last cue overruns composition`);
  let acc = 0;
  for (const cue of script.cues) {
    assert(cue.startFrame >= acc, `${script.cut} ${cue.sceneId}: startFrame went backwards`);
    assert(cue.lines.length > 0, `${script.cut} ${cue.sceneId}: empty lines`);
    assert(
      joinedWords(cue.lines) <= maxWordsForFrames(cue.durationInFrames, script.fps),
      `${script.cut} ${cue.sceneId}: line longer than ${WORDS_HINT(cue.durationInFrames)} words`,
    );
    acc = cue.startFrame;
  }
}

assert(morning60.cues.length < full.cues.length, 'morning60 should have fewer cues than full');
assert(
  morning60.totalFrames < full.totalFrames,
  'morning60 composition should be shorter than full',
);

const morningText = morning60.cues.flatMap((c) => c.lines).join(' ');
assert(morning60.cues.length === 7, `morning60 should have 7 cues, got ${morning60.cues.length}`);
assert(/do not have a TSX number/i.test(morningText), 'CA unknown must be spoken as unknown');
assert(/won't fake one|will not fake one/i.test(morningText), 'unknowns must refuse to fake a number');
assert(!/TSX closed at \d/i.test(morningText), 'must not invent a TSX print');
assert(!/7,677\.28/.test(morningText), 'round the S&P for speech — do not dump two decimals');
assert(/seventy-six seventy-seven/i.test(morningText), 'morning tape should speak the S&P as a handle');

if (!report.markets?.ca) {
  const fullText = full.cues.flatMap((c) => c.lines).join(' ');
  assert(!/TSX closed at \d/i.test(fullText), 'full cut must not invent a TSX close');
}

if (report.nextNvda.length === 0) {
  const radar = full.cues.find((c) => c.sceneId === 'opportunity-radar');
  assert(Boolean(radar && /no name passed|no next-nvda/i.test(radar.lines.join(' '))), 'empty sleeve must be spoken as empty');
  const board = full.cues.find((c) => c.sceneId === 'prediction-board');
  assert(Boolean(board), 'prediction board must have a cue');
  assert(!/91\s*\/\s*100|58\s*\/\s*100/i.test(board?.lines.join(' ') ?? ''), 'must not read invented board scores');
}

function WORDS_HINT(frames: number): number {
  return maxWordsForFrames(frames);
}

console.log('scriptFromReport.check ok', {
  episodeId,
  fullCues: full.cues.length,
  morningCues: morning60.cues.length,
  fullFrames: full.totalFrames,
  morningFrames: morning60.totalFrames,
  lastFull: lastCueEndFrame(full),
  lastMorning: lastCueEndFrame(morning60),
});

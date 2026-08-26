import {DEFAULT_EPISODE_ID, loadEpisode, previousEpisode} from '../data/loadEpisode';
import {selectScenes, type CutKind} from '../engine/selectScenes';
import {scriptFromReport} from './scriptFromReport';
import type {VoiceScript} from './types';

export function buildVoiceScript(episodeId: string, cut: CutKind): VoiceScript {
  const report = loadEpisode(episodeId);
  const previous = previousEpisode(episodeId);
  const plan = selectScenes(report, {cut, previous});
  return scriptFromReport(report, plan, previous);
}

export function buildBothCuts(episodeId: string = DEFAULT_EPISODE_ID): {full: VoiceScript; morning60: VoiceScript} {
  return {
    full: buildVoiceScript(episodeId, 'full'),
    morning60: buildVoiceScript(episodeId, 'morning60'),
  };
}

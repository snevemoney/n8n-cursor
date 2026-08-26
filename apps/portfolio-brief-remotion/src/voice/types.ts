import type {CutKind} from '../engine/selectScenes';

/** One spoken beat for one planned scene. Start times follow cumulative scene durations. */
export type VoiceCue = {
  sceneId: string;
  startFrame: number;
  durationInFrames: number;
  lines: string[];
};

export type VoiceScript = {
  episodeId: string;
  cut: CutKind;
  fps: number;
  wordsPerSec: number;
  totalFrames: number;
  cues: VoiceCue[];
};

export type VoiceCueFile = VoiceCue & {
  file: string;
};

export type VoiceManifest = {
  episodeId: string;
  cut: CutKind;
  voice: string;
  fps: number;
  totalFrames: number;
  cues: VoiceCueFile[];
};

import {DEFAULT_EPISODE_ID} from '../data/loadEpisode';
import {buildBothCuts} from './buildVoiceScript';
import {SAY_RATE_WPM, VOICE_NAME} from './voiceConfig';

declare const process: {argv: string[]; env: Record<string, string | undefined>};

const episodeId = process.argv[2] ?? DEFAULT_EPISODE_ID;
const cuts = buildBothCuts(episodeId);
const voice = process.env.VOICE?.trim() || VOICE_NAME;

const payload = {
  episodeId,
  voice,
  sayRateWpm: SAY_RATE_WPM,
  cuts,
};

console.log(JSON.stringify(payload, null, 2));

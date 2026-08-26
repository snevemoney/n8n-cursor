/**
 * Default: Reed (English (US)) — newer macOS expressive engine, already installed.
 * Premium/Enhanced/Siri names are not on this Mac (`say` falls back to Samantha).
 * Override: VOICE=Samantha (or any `say -v '?'` name).
 * Not a branded newsreader and not a clone of a real person.
 */
export const DEFAULT_VOICE_NAME = 'Reed (English (US))';
export const FALLBACK_VOICE_NAME = 'Samantha';
export const VOICE_NAME = DEFAULT_VOICE_NAME;

/** `say -r` words per minute. ~2.8 words/sec — inside the 2.5–3 target. */
export const SAY_RATE_WPM = 170;

/**
 * Clamp budget. Conservative so default `say` finishes inside the scene.
 * Do not let VO overrun the next scene.
 */
export const WORDS_PER_SEC = 2.5;

/** Leave a tail so the last word is not clipped at the cut. */
export const TAIL_PAD_SEC = 0.4;

/** Chromium (Remotion) plays WAV. AIFF is say’s default but not browser-safe. */
export const AUDIO_EXT = 'wav';

export const voicePublicDir = (episodeId: string, pack: string): string =>
  `voice/${episodeId}/${pack}`;

export const sanitizeSceneId = (sceneId: string): string => sceneId.replace(/[^A-Za-z0-9._-]/g, '-');

export const voiceFileName = (episodeId: string, pack: string, sceneId: string): string =>
  `${voicePublicDir(episodeId, pack)}/${sanitizeSceneId(sceneId)}.${AUDIO_EXT}`;

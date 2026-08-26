export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const sec = (s: number) => Math.round(s * FPS);

export const FADE_FRAMES = 8;

export const durationClamp = (frames: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(frames)));

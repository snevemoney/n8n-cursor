import {FPS} from '../engine/timing';
import {TAIL_PAD_SEC, WORDS_PER_SEC} from './voiceConfig';

export function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function maxWordsForFrames(durationInFrames: number, fps: number = FPS): number {
  const seconds = durationInFrames / fps;
  const budget = Math.max(0, seconds - TAIL_PAD_SEC);
  return Math.max(3, Math.floor(budget * WORDS_PER_SEC));
}

const DANGLE = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'with', 'in', 'on', 'at', 'as']);

const tidyWord = (w: string): string => w.toLowerCase().replace(/[^a-z]/g, '');

export function trimToWords(line: string, max: number): string {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length <= max) return line.trim();
  const sliced = words.slice(0, max);
  let end = sliced.length;
  while (end > 3 && DANGLE.has(tidyWord(sliced[end - 1] ?? ''))) {
    end -= 1;
  }
  let text = sliced.slice(0, end).join(' ');
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}

/** Keep lines that fit the scene. Drop later lines first. Never invent replacement facts. */
export function clampLines(lines: string[], maxWords: number): string[] {
  const cleaned = lines.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const out: string[] = [];
  let used = 0;
  for (const line of cleaned) {
    const n = wordCount(line);
    if (used + n <= maxWords) {
      out.push(line);
      used += n;
      continue;
    }
    const remaining = maxWords - used;
    if (remaining >= 3) {
      const trimmed = trimToWords(line, remaining);
      if (trimmed) out.push(trimmed);
    }
    break;
  }
  if (out.length === 0 && cleaned[0]) {
    return [trimToWords(cleaned[0], maxWords)];
  }
  return out;
}

export function joinedWords(lines: string[]): number {
  return wordCount(lines.join(' '));
}

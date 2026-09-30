import {episode as episode20260825} from './episodes/2026-08-25';
import {episode as episode20260831} from './episodes/2026-08-31';
/* new-episode:imports */
import type {DailyReport} from './schema';

const registry: Record<string, DailyReport> = {
  '2026-08-25': episode20260825,
  '2026-08-31': episode20260831,
  /* new-episode:registry */
};

/** Latest registered date. New day = episode file + one registry line (or `scripts/new-episode.sh`). */
const registeredIds = Object.keys(registry).sort();
export const DEFAULT_EPISODE_ID = registeredIds[registeredIds.length - 1] ?? '2026-08-25';

export function loadEpisode(id: string): DailyReport {
  const found = registry[id];
  if (!found) {
    throw new Error(`Unknown episode "${id}". Registered: ${Object.keys(registry).join(', ')}`);
  }
  return found;
}

export function listEpisodes(): string[] {
  return Object.keys(registry).sort();
}

/** Prior registered date, or undefined when this is the first tape. */
export function previousEpisodeId(id: string): string | undefined {
  const ids = listEpisodes();
  const i = ids.indexOf(id);
  if (i <= 0) return undefined;
  return ids[i - 1];
}

export function previousEpisode(id: string): DailyReport | null {
  const prevId = previousEpisodeId(id);
  return prevId ? registry[prevId] : null;
}

export function registerEpisode(id: string, report: DailyReport): void {
  registry[id] = report;
}

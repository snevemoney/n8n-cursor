/**
 * Shared list pagination for API routes.
 */

export interface Pagination {
  limit: number;
  offset: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null || value === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { limit?: number; max?: number } = {}
): Pagination {
  const defaultLimit = defaults.limit ?? DEFAULT_LIMIT;
  const max = defaults.max ?? MAX_LIMIT;
  const rawLimit = searchParams.get('limit') ?? searchParams.get('pageSize');
  const rawOffset = searchParams.get('offset') ?? searchParams.get('skip');
  const limit = Math.min(max, Math.max(1, parsePositiveInt(rawLimit, defaultLimit)));
  const offset = Math.max(0, parsePositiveInt(rawOffset, 0));
  return { limit, offset };
}

export function paginate<T>(items: T[], pagination: Pagination): T[] {
  return items.slice(pagination.offset, pagination.offset + pagination.limit);
}

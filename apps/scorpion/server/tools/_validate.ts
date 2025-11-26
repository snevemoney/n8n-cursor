import { ToolResult } from '../types/tooling';

export function assertNonEmptyArray<T>(label: string, arr?: T[]): ToolResult<T[]> {
  if (!arr || arr.length === 0) {
    return { ok: false, error: `${label} is empty` };
  }
  return { ok: true, data: arr };
}


/**
 * Golden Paths configuration — defines severity and lifecycle for each path.
 *
 * Paths marked `severity: 'soft'` or `legacy: true` do NOT count toward the
 * hard passCount used by Watchdog heartbeat checks. They still appear in
 * reports and dashboards as informational signals.
 *
 * Lifecycle:
 *   active  — counts toward hard pass (default)
 *   legacy  — retained for visibility; excluded from hard scoring
 *   retired — hidden from reports entirely
 */

export type PathSeverity = 'hard' | 'soft'

export type PathLifecycle = 'active' | 'legacy' | 'retired'

export interface GoldenPathMeta {
  path: string
  name: string
  severity: PathSeverity
  lifecycle: PathLifecycle
  reason?: string
}

export const GOLDEN_PATHS_CONFIG: GoldenPathMeta[] = [
  {
    path: 'G1',
    name: 'Telegram daily report posted in 24h',
    severity: 'soft',
    lifecycle: 'legacy',
    reason:
      'Telegram is a legacy tool lane (operator decision 2025-06). ' +
      'Reports may come via other channels; missing Telegram report is not an operational failure.',
  },
  {
    path: 'G2',
    name: 'Scorpion /healthz returns 200',
    severity: 'hard',
    lifecycle: 'active',
  },
  {
    path: 'G3',
    name: 'n8n instance reachable',
    severity: 'hard',
    lifecycle: 'active',
  },
  {
    path: 'G4',
    name: 'CE service responds',
    severity: 'hard',
    lifecycle: 'active',
  },
  {
    path: 'G5',
    name: 'Golden-path smoke webhook registers OK',
    severity: 'hard',
    lifecycle: 'active',
  },
]

const configByPath = new Map(GOLDEN_PATHS_CONFIG.map((p) => [p.path, p]))

export function getPathMeta(pathId: string): GoldenPathMeta | undefined {
  return configByPath.get(pathId)
}

export function isHardPath(pathId: string): boolean {
  const meta = configByPath.get(pathId)
  if (!meta) return true
  return meta.severity === 'hard' && meta.lifecycle === 'active'
}

export function isSoftOrLegacy(pathId: string): boolean {
  const meta = configByPath.get(pathId)
  if (!meta) return false
  return meta.severity === 'soft' || meta.lifecycle === 'legacy'
}

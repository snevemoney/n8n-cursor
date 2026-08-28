/** Slice-1 constants. No secrets. */

export const SERVICE_NAME = 'bigboss-gateway';
export const SLICE = 1;
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 3210;
export const MAX_BODY_BYTES = 256 * 1024;
export const EVIDENCE_CAP = 20;
export const BRIEF_EVIDENCE_CAP = 8;
export const URGENT_LINES_CAP = 2;

export const REPOS = [
  { owner: 'snevemoney', name: 'n8n-cursor' },
  { owner: 'snevemoney', name: 'client-engine' },
];

export const SCOPES = new Set(['github', 'memory', 'all']);
export const TIME_RANGES = new Set(['24h', '7d', '30d', 'any']);
export const DEPTHS = new Set(['brief', 'standard']);
export const CALLER_CLASSES = new Set(['CEO', 'PUBLIC']);
export const KINDS = new Set(['is', 'was', 'discussed', 'decided', 'attempted', 'completed']);

export const UNWIRED_MEMORY_SOURCES = ['memory', 'grok', 'obsidian'];

/** Leftover cron-draft titles — deprioritize vs material PRs. */
export const LEFTOVER_DRAFT_PATTERNS = [
  /hitl inbox/i,
  /goal\s*\/\s*gap|goal-gap|goal gap/i,
  /no-waiting|no waiting/i,
  /factory os(?:\s+\S+)*\s+reminder/i,
  /factory-os.*reminder/i,
  /grok-reader reminder/i,
];

export const USER_AGENT = 'bigboss-gateway/1 (snevemoney/n8n-cursor; hive-process)';

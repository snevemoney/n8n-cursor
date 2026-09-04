/** File-bus contract. States Jared already uses; this file is original. */

export const PHASES = ["idle", "listen", "think", "speak"] as const;
export type Phase = (typeof PHASES)[number];

export const JOB_STATUSES = ["working", "yellow", "done"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const PERMISSION_MODES = ["ask", "bypassPermissions"] as const;
export type PermissionMode = (typeof PERMISSION_MODES)[number];

export const PIECE_STATES = ["parked", "wired", "adopted"] as const;
export type PieceState = (typeof PIECE_STATES)[number];

export type BusState = {
  schema_version: 1;
  phase: Phase;
  job_status: JobStatus;
  utterance: string;
  permission_ask: string | null;
  updated_at: string;
};

export type VaultHandle = {
  ok: boolean;
  source: string;
  path: string;
  oh: string;
  kind: string;
};

export type AgentStack = {
  schema_version: 1;
  kind: "agentic-os";
  name: string;
  operator: string;
  hosts: string[];
  permission_mode: PermissionMode;
  vault: VaultHandle;
  repo: string;
  bus_dir: string;
  bus_path: string;
  jobs_path: string;
  state_path: string;
  os_surface: string;
  pieces: {
    memory: PieceState;
    wizard: PieceState;
    mouth: PieceState;
    face: PieceState;
    hands: PieceState;
  };
  never: string[];
  updated_at: string;
};

export function defaultBus(now: string): BusState {
  return {
    schema_version: 1,
    phase: "idle",
    job_status: "done",
    utterance: "",
    permission_ask: null,
    updated_at: now,
  };
}

export function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && (PHASES as readonly string[]).includes(value);
}

export function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && (JOB_STATUSES as readonly string[]).includes(value);
}

#!/usr/bin/env node
/**
 * Adopt the existing hive vault + write the file bus.
 * Original. Does not clone fullstack-agent. Does not write CLAUDE.md.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultBus,
  isJobStatus,
  isPhase,
  type AgentStack,
  type BusState,
  type VaultHandle,
} from "../bus/schema.js";

const HERE = dirname(fileURLToPath(import.meta.url));

function findRoot(start: string): string {
  let cur = start;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(join(cur, "pnpm-workspace.yaml"))) return cur;
    cur = resolve(cur, "..");
  }
  return resolve(start, "../../..");
}

const ROOT = findRoot(HERE);

function stackPackageRoot(start: string): string {
  let cur = start;
  for (let i = 0; i < 6; i += 1) {
    if (existsSync(join(cur, "package.json")) && existsSync(join(cur, "start.sh"))) {
      return cur;
    }
    cur = resolve(cur, "..");
  }
  return resolve(start, "../..");
}

const STACK_ROOT = stackPackageRoot(HERE);
const DEFAULT_HIVE = join(ROOT, "docs/hive/outer-heaven/.hive");
const DEFAULT_VAULT = join(homedir(), "Documents/My_Billion_Dollar_Vault");
const NEVER = [
  "claude-code",
  "second-vault",
  "second-home",
  "live-/",
  "vendor-agpl-clone",
] as const;

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function looksLikeVault(path: string): boolean {
  return (
    existsSync(join(path, "OPERATOR_MEMORY.md")) ||
    existsSync(join(path, "00_Outer_Heaven"))
  );
}

export function resolveVault(opts?: { allowRepoFallback?: boolean }): VaultHandle {
  const env = (process.env.HIVE_OBSIDIAN_VAULT || "").trim();
  const candidate = env ? resolve(env) : DEFAULT_VAULT;
  const oh = join(candidate, "00_Outer_Heaven");
  if (existsSync(candidate)) {
    return {
      ok: true,
      source: env ? "env" : "local",
      path: candidate,
      oh: existsSync(oh) ? oh : candidate,
      kind: looksLikeVault(candidate) ? "live-vault" : "path-exists",
    };
  }
  if (opts?.allowRepoFallback) {
    const osDir = join(ROOT, "docs/hive/outer-heaven/CONTENT/os");
    return {
      ok: true,
      source: "repo-fallback",
      path: ROOT,
      oh: existsSync(osDir) ? osDir : ROOT,
      kind: "test",
    };
  }
  return {
    ok: false,
    source: env ? "env" : "local",
    path: candidate,
    oh: oh,
    kind: "missing",
  };
}

export function defaultStack(vault: VaultHandle, hive: string): AgentStack {
  const busDir = join(hive, "bus");
  return {
    schema_version: 1,
    kind: "agentic-os",
    name: "hive",
    operator: "Evens",
    hosts: ["cursor", "grok"],
    permission_mode: "ask",
    vault,
    repo: ROOT,
    bus_dir: busDir,
    bus_path: join(busDir, "state.json"),
    jobs_path: join(ROOT, "docs/hive/outer-heaven/CONTENT/os/jobs.json"),
    state_path: join(hive, "state.json"),
    os_surface: "apps/portfolio/public/obsidianOS",
    pieces: {
      memory: "adopted",
      wizard: "wired",
      mouth: existsSync(join(STACK_ROOT, "mouth", "start.sh")) ? "wired" : "parked",
      face: existsSync(join(STACK_ROOT, "face", "start.sh")) ? "wired" : "parked",
      hands: "parked",
    },
    never: [...NEVER],
    updated_at: nowIso(),
  };
}

export function validate(stack: AgentStack, bus: BusState): string[] {
  const errors: string[] = [];
  if (stack.kind !== "agentic-os") errors.push("kind must be agentic-os");
  if (stack.permission_mode !== "ask") errors.push("sitting-1 default is ask");
  if (!stack.hosts.includes("cursor") || !stack.hosts.includes("grok")) {
    errors.push("hosts must include cursor and grok");
  }
  if (stack.hosts.some((h) => h.toLowerCase() === "claude")) {
    errors.push("claude is not an execute host");
  }
  if (!stack.vault.path) errors.push("vault.path missing — refuse to invent a second home");
  if (stack.pieces.memory !== "adopted") errors.push("memory must be adopted");
  if (stack.pieces.wizard !== "wired") errors.push("wizard must be wired");
  if (stack.pieces.mouth !== "parked" && stack.pieces.mouth !== "wired") {
    errors.push("mouth must be parked or wired");
  }
  if (stack.pieces.face !== "parked" && stack.pieces.face !== "wired") {
    errors.push("face must be parked or wired");
  }
  if (stack.pieces.hands !== "parked") {
    errors.push("hands stay parked — no mouse takeover in sittings 2–3");
  }
  for (const lock of NEVER) {
    if (!stack.never.includes(lock)) errors.push(`never[] missing ${lock}`);
  }
  if (!isPhase(bus.phase)) errors.push("bus.phase must be idle|listen|think|speak");
  if (!isJobStatus(bus.job_status)) errors.push("bus.job_status must be working|yellow|done");
  return errors;
}

function writeJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function readJson(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function adopt(opts?: {
  hive?: string;
  allowRepoFallback?: boolean;
}): { ok: boolean; errors: string[]; stack_path: string; bus_path: string; vault: VaultHandle } {
  const hive = opts?.hive || DEFAULT_HIVE;
  const vault = resolveVault({ allowRepoFallback: opts?.allowRepoFallback });
  const stackPath = join(hive, "agent-stack.json");
  const busPath = join(hive, "bus", "state.json");
  const stack = defaultStack(vault, hive);
  const existing = readJson(busPath);
  const bus = defaultBus(nowIso());
  if (isPhase(existing.phase)) bus.phase = existing.phase;
  if (isJobStatus(existing.job_status)) bus.job_status = existing.job_status;
  if (typeof existing.utterance === "string") bus.utterance = existing.utterance;
  const errors = validate(stack, bus);
  if (!vault.ok) errors.push("vault path does not exist — adopt refused to create a home");
  if (existsSync(join(hive, "CLAUDE.md")) || existsSync(join(hive, "my-agent"))) {
    errors.push("second home markers present");
  }
  if (errors.length) {
    return { ok: false, errors, stack_path: stackPath, bus_path: busPath, vault };
  }
  writeJson(stackPath, stack);
  writeJson(busPath, bus);
  return { ok: true, errors: [], stack_path: stackPath, bus_path: busPath, vault };
}

export function selfTest(): { ok: boolean; errors: string[] } {
  const hive = mkdtempSync(join(tmpdir(), "agent-stack-"));
  try {
    const out = adopt({ hive, allowRepoFallback: true });
    if (!out.ok) return { ok: false, errors: out.errors };
    if (existsSync(join(hive, "CLAUDE.md")) || existsSync(join(hive, "my-agent"))) {
      return { ok: false, errors: ["second home was written"] };
    }
    const stack = JSON.parse(readFileSync(out.stack_path, "utf8")) as AgentStack;
    const bus = JSON.parse(readFileSync(out.bus_path, "utf8")) as BusState;
    const errors = validate(stack, bus);
    if (stack.permission_mode !== "ask") errors.push("permission_mode drifted");
    if (!stack.vault.path) errors.push("vault.path empty");
    if (stack.pieces.hands !== "parked") errors.push("hands drifted off parked");
    if (existsSync(join(STACK_ROOT, "mouth", "start.sh")) && stack.pieces.mouth !== "wired") {
      errors.push("mouth start.sh present but piece not wired");
    }
    if (existsSync(join(STACK_ROOT, "face", "start.sh")) && stack.pieces.face !== "wired") {
      errors.push("face start.sh present but piece not wired");
    }
    return { ok: errors.length === 0, errors };
  } finally {
    rmSync(hive, { recursive: true, force: true });
  }
}

function main(): void {
  const cmd = process.argv[2] || "adopt";
  if (cmd === "self-test") {
    const out = selfTest();
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
    process.exit(out.ok ? 0 : 2);
  }
  if (cmd !== "adopt" && cmd !== "dry-run") {
    process.stderr.write("usage: adopt.ts adopt|dry-run|self-test\n");
    process.exit(2);
  }
  const out = adopt();
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  process.exit(out.ok ? 0 : 2);
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main();

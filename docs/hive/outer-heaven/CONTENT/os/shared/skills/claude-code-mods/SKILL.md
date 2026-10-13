---
name: Claude Code mods
description: >-
  Use when building, reviewing or porting a Claude Code mod (plugin whose hooks.json names a JS/TS module exporting register(on, options)): Bash guards, cost bands, flight recorders, model routers, receipts, auto-handoff. Triggers: "Claude Code mod", "hooks module", "guard rm -rf". Anti-triggers: plain settings.json shell hooks; Cursor or Grok Bot skills; MCP servers; unreviewed third-party mods.
---
# Claude Code mods

**Owner desk:** Forge (Claude Code / Cursor harness work). Researcher extracts; Watchdog verifies.
**Platform:** Claude Code (CLI ≥ 2.1.287, terminal or desktop app). Build/test anywhere Node runs; hive face stays Cursor + Grok Bot.
**Install:** `none (process-only)` for the pattern · CLI `claude` (npm `@anthropic-ai/claude-code`) for validate/load · reference source read-only: `anthropics/claude-code` → `mods/` (agents-md, diff, sec-default, telemetry). Third-party mod repos (e.g. starter kits) go through awesome-skill-import-gate first — a mod runs with Claude Code's own access.

## What a mod is (facts from the official docs + reference mods)
- A normal plugin: `.claude-plugin/plugin.json` + `hooks/hooks.json` with **exactly one** `"modules": ["./x.mjs"]` entry.
- The module exports `register(on, options)`. `on(event, matcher?, async ($, e, next) => …)`.
- Middleware chain: your hook → other plugins → Claude Code's own behavior.
  - **Observe:** `const r = await next(e); /* look */ return r;`
  - **Rewrite:** `return next({ ...e, command: safer });`
  - **Answer:** `return { deny: "reason" }` (tool.call) or `{ text }` (command.run) **without** calling next.
- Events (≥2.1.287 docs): `tool.call` (matcher `{tool:"Bash"}`), `prompt.submit`, `turn.start`, `turn.complete` (`e.agentId` set for subagent turns), `session.start`, `session.end`, `command.run` (matcher `{command:"name"}`), `ui.render` (matcher `{component:"AbovePrompt"|"Pane"}`).
- `$` = the only door out (sandbox: no DOM, no Node): `ui` (resolve/open/status/toast), `session` (usage/cwd), `state` (session values that survive hot reload — declare in `types/index.d.ts` `PluginState`), `store` (persistent), `fs`, `process.run([...argv])`, `clock`, `http`, `tool.register`, `command.register`, `model`.
- Hook time limit ~10 s of its own time per dispatch; time waiting inside `$` calls doesn't count.
- Mods differ from settings hooks: loaded once, keep state, draw UI, register commands/tools. Like hooks, many need **no model call** (zero credits).

## Build recipe (copy this)
1. Layout:
```
my-mod/
├── .claude-plugin/plugin.json      {"name","version","description","author":{"name"}}  (+ "types":"./types/index.d.ts" on ≥2.1.287)
├── hooks/hooks.json                {"description":"…","modules":["./my-mod.mjs"]}
├── hooks/my-mod.mjs                export function register(on, options) { … }
├── types/index.d.ts                declare module "claude-code" { interface PluginState { "my-mod": { … } } }
└── tests/my-mod.test.ts            import { describe, expect, test } from "claude-code/testing"
```
2. Guard skeleton (answer + rewrite + observe):
```js
const LOG = { plugin: "my-guard", key: "log" };
export function register(on, options = {}) {
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const cmd = String(e.command ?? "");
    if (/\brm\s+-[a-zA-Z]*r[a-zA-Z]*f|\bgit\b.*\bpush\b.*(--force(?!-with-lease)|\s-f\b)|--no-verify|reset\s+--hard/.test(cmd))
      return { deny: `my-guard blocked: ${cmd}` };                 // answer
    if (options.rewrite && /--force\b/.test(cmd))
      return next({ ...e, command: cmd.replace("--force", "--force-with-lease") }); // rewrite
    const r = await next(e);                                        // observe
    const { value: log = [] } = await $.state.get(LOG);
    await $.state.set(LOG, [...log, cmd].slice(-200));
    return r;
  });
  on("session.start", async ($, e, next) => { const r = await next(e);
    await $.command.register({ name: "guard-log", description: "Show guard log" }); return r; });
  on("command.run", { command: "guard-log" }, async ($) => ({ text: JSON.stringify((await $.state.get(LOG)).value ?? []) }));
}
```
3. Check: `claude --version` (≥2.1.287) → `claude plugin validate ./my-mod` (reports hooks + `$` calls + state writes) → `claude plugin test ./my-mod`.
4. Load: `claude --plugin-dir ./my-mod` (hot reloads on save). Desktop app: add the folder in global settings (no flags).
5. Share/install: folder or repo with `.claude-plugin/marketplace.json` → `claude plugin marketplace add <path|org/repo>` → `claude plugin install my-mod@<marketplace> --scope user|project` (install already enables; a following `enable` errors "already enabled").
6. Remove: `claude plugin uninstall my-mod@<marketplace> --scope <same scope>`; loop over names for bulk.
7. Fast authoring: give Claude Code the official "Getting started with Claude Code mods" guide (or its built-in mod guide) and describe only what you want to see; keep data in `$.state`, not module variables.

### Authoring prompts
**New mod**
```
Make me a Claude Code mod called <name>: <one-line purpose>.
What it should do: <events / when>. What it should show: <band|pane|status|slash command>.
Keep state in $.state so it survives hot reload. Validate with `claude plugin validate`, add a test, and tell me how to install it at user scope.
```
**Edit an installed mod** (pattern seen in the wild)
```
Change my <mod> mod <from X to Y>. <concrete visual/behavior specifics>.
Save the original so I can switch back. Update the installed plugin, and tell me whether I need to restart Claude to see it.
```

### Pitfalls
- Command-text guards are a **safety net, not a permission system**: `$(…)`, aliases, scripts and base64 get past them. Keep permission deny rules for hard blocks.
- Engine/API drift: older early-access builds reject `session.start` / `command.*` events (validator: `"session.start" is not an event`). Ship a `tool.call`-only compat build or upgrade.
- `$.state` is per session; cross-session data (bookmarks, handoffs) needs `$.store` or files.
- Props for `ui.render` are on `e.props` (`hasSurvey`, `bodyColumns`); return `next(e)` when you have nothing to draw. Use single-width symbols, not emoji.
- Running demos with "bypass permissions on" removes the human gate — exactly when a guard mod matters.
- Read any third-party mod's source before install; it runs with Claude Code's access.

## Idea list — 10 mods from a public demo (Kashef, 2026-10-02) with hive mapping
| # | Mod | What it does | Likely build (INFERENCE) | Hive mapping |
|---|---|---|---|---|
| 1 | crimson-garden | chat/theme recolor + band label | ui.render | NO-SKILL (taste) |
| 2 | terminal-pet | pixel pet counting files read/written/run; `/pet on|off|name|sleep|party|wake|feed` | observe tool.call + band + command | NO-SKILL (leisure) |
| 3 | context-meter | footer: context % · tokens/window · $ · 5h/7d limits | $.session.usage + band/status | token-meter / context-before-tokens |
| 4 | repo-heatmap | `/heatmap` files sized by lines | command.run + fs/process + pane | repo orientation for Forge |
| 5 | flight-recorder | `/timeline` pane: per-turn lanes by model + tool | observe turn.* / tool.call + pane | Watchdog audit trail; progress-truth (activity ≠ outcome) |
| 6 | model-router | `/router on|off|sonnet|haiku|mode subagents|steps|both` → subagents on cheap model | rewrite subagent tool.call model | match-model-to-task / cost |
| 7 | output-tray | pane of net-new files per prompt + Reveal | observe Write/Edit + pane | artifact receipts |
| 8 | changes-receipt | `/receipt on|last`: per-turn created files + lines | observe + turn.complete | ACTION_LOG / done-when evidence |
| 9 | session-bookmarks | `/bm <note>`, `/bm list`, open later | command.run + store | HANDOFF notes |
| 10 | auto-handoff | at threshold (default 85%, suggest 40–50%) write handoff + new session; `/autohandoff now|resume|threshold <n>|on|off` | turn.complete + usage + fs | HANDOFF/CURRENT_STATE layer; follow-through |
| + | destructive-guard (hive build) | deny rm -rf / force-push / --no-verify / reset --hard / clean -f; opt-in lease rewrite; `/guard-log` | tool.call answer/rewrite/observe | no-destructive-git + Tier-3 HITL |

Worked example on disk: `/workspace/research/youtube-daily/l2-20261006/uvIopT_2sY0/recreation/` (destructive-guard full + compat builds, Node harness 26/26).

## Tools
| Need | Path | Status |
|---|---|---|
| Pattern + recipe | this skill | **PROVE** (harness 26/26, exit 0) |
| `claude plugin validate` | box CLI 2.1.250 | **PROVE** for tool.call-only build; full build **BLOCKED** — would work if we had Claude Code ≥ 2.1.287 |
| Load from disk | `claude --plugin-dir` | **PROVE** (loads @inline) |
| Live tool.call deny in a real session | authorized Claude Code ≥ 2.1.287 | **BLOCKED** — would work if we had an authorized session on the new engine |
| Offline chain test | Node harness simulating on()/($,e,next) | **WORKAROUND** for `claude plugin test` |
| Claude Code as hive face | — | **WORKAROUND**: Cursor cloud agents + Grok Bot; mods only for desks that already run Claude Code |
| Third-party mod kits | import gate | **RESEARCH-OK** — read, do not auto-install |

## Done when
`claude plugin validate` passes on the target engine, a test (or harness) proves each move the mod makes, and the install line + scope are written down.

## Box check 2026-10-10 (full study, @ClaudeDevs mods + "You should Know")
- Box `claude` = **2.1.250** (below mods floor 2.1.287). Don't upgrade globally; for validation use a sandbox: `cd /tmp/x && npx -y @anthropic-ai/claude-code@latest plugin validate <mod-dir>` (got 2.1.296).
- Minimal guard mod (plugin.json + hooks.json `modules` + `register(on)` deny on rm -rf / --no-verify / reset --hard / force-push) → **✔ Validation passed**, with warning `gating hook without .catch: tool.call{tool=Bash}` → wrap gating logic in try/catch so a thrown error doesn't wedge the chain.
- `plugin details cc-plugin-you-should-know@builtin` → not found on a fresh unauthenticated sandbox; the built-in is only enable-able inside a signed-in session (`/plugin enable …`). UNVERIFIED beyond the announcement.
- New CLI verbs seen in 2.1.296 help: `plugin details` (component inventory + projected token cost), `plugin eval` (case.yaml / graders against a no-plugin baseline), `plugin configure`.

## Enrich 2026-10-10: official mods semantics (`yt:yUuFvL1lK4k` Claude channel)
Handlers get (ctx, event, next). Return without calling next to own the event. Render mods change only the screen: **the model never sees the modified text**. The folder is watched (hot reload); the desktop app loads it via global settings. Model: `mod_middleware.py` (3/3).

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Prune before you add.** Boris Cherny's claim, reported second-hand: cutting about 80% of Claude Code's system prompt made it better. Before adding a rule, remove stale ones (x:2093842252703334644; talk not watched, UNVERIFIED).
- **Desktop in-app browser.** Claude Code desktop has a sandboxed browser that lets the agent check its own dev server and docs, with session persistence toggled per use (x:2075635283211772279). We can't test it on the Linux box; the box browser/Playwright MCP covers the same need here.
- **MCP-free tools.py** (yt:JGphuBuKiDo, echohive). Put plain functions in a `tools.py` that **print** their results (the agent reads stdout, not return values), add a one-line rule telling the agent to use them, and allow several tools in one CLI call. No MCP server to host. PROVE: `tools_cli_dispatch.py` (this folder) → two tools in one call, ok. Covered in principle by the existing MCP-vs-CLI note; this adds the print-not-return gotcha.
- **Cursor MCP setup walkthrough** (yt:TQsP_PlCY1I). The GitHub MCP and a browser-tools MCP (console and network logs, selected element) are already covered by existing connector practice. Citation only.
- **Portable Claude Code** (yt:xPfZyV20_RY; repo `techjarves/ClaudeCode-Portable`, MIT, README read 2026-10-11 → PASS): one folder (exFAT USB or any disk) with `START.bat`/`start.sh`; first launch downloads checksum-verified Node and pinned official Claude Code into `engine/<os>`, and settings, chats and credentials live in `data/`, so the same setup runs on Windows/Mac/Linux. A browser dashboard switches providers (OpenRouter, DeepSeek, Gemini, NVIDIA NIM, Ollama, LM Studio, custom). Steal: the self-contained, per-OS runtime folder pattern. Don't: carry API keys in `data/` on a losable stick; non-Claude models are unsupported by Anthropic. BLOCKED as a hive face (Grok+Cursor stay the face).

## Enrich 2026-10-12: box-proven trials (yt12, /workspace/trials/yt12-20261012)
- **Blast-radius guard without a mod** (yt:lDrAZ1wAyVs @8:13). Box Claude Code is 2.1.250 and mods need ≥2.1.287, so use a shell guard instead: it lists the files an rm -r would delete and exits 3 unless CONFIRM=yes. PROVE: `/workspace/trials/yt12-20261012/m23-blast-radius-guard`. The real mod is untested here.

## Enrich 2026-10-13: real mods on a Mac (Claude Code 2.1.296, packet codex-yt12-20261012/MAC_TRIALS_20261013.md)
- **Sources (pinned):** Blast Radius and Replay Theater are Anthropic samples in `anthropics/claude-code-playground` → `claude-code/mods/` (Apache-2.0, shared as-is). Cache Tax = `karanb192/cache-tax` (MIT). Reflect = `BayramAnnakov/claude-reflect` → `mod/` (MIT). Fetch raw files at a commit SHA and compare SHA-256 rather than cloning.
- **Vetted local marketplace:** put reviewed, pinned mod folders under one dir with `.claude-plugin/marketplace.json`, then `claude plugin marketplace add <dir>` and `claude plugin install <mod>@<marketplace> --scope user`. This adds `extraKnownMarketplaces` + `enabledPlugins` to user settings, so back them up first.
- **Headless testing of mods and slash commands:** `claude -p --input-format stream-json --output-format stream-json --verbose`, sending one user message at a time and waiting for each `result` line (otherwise queued messages merge into one turn). Mod commands answer in the result text, and panes show as `ui_panes` system events. Keep it cheap with `--model haiku --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}' --plugin-dir <mod>`. PROVE: Replay Theater `/replay` → "2 edits"; Cache Tax `/cache-tax` → live cold-cost estimate.
- **`claude plugin test <dir>` works** for mods that ship tests (Cache Tax 56/56, Reflect 10/10) with no model calls.
- **Gate rule for desks:** a mod that holds or refuses (Blast Radius waits up to 10 min for a button; Cache Tax refuses a cold send once) stalls or breaks `claude -p` automation, so don't enable it at user scope on a machine that runs headless desks. Observe-only mods (Replay Theater) are safe. Reflect checks only prompts a person types (`origin.kind` composer/bridge), so it is safe headless, but its Save writes `~/.claude/CLAUDE.md` (a global rule file, so it needs the owner's yes).
- PROVE Blast Radius live: with the mod, `rm -rf ./junk` was held and the files stayed intact; the control run without the mod deleted them. The "full build BLOCKED" rows in Tools above are now PROVE on 2.1.296.

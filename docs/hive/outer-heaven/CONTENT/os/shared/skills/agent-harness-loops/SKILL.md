---
name: Agent harness loops
description: >-
  Use when designing or improving multi-agent loops (goal → act → verify → keep/revert),
  Cursor /goal + subscriptions, or Karpathy-style self-improving harnesses on Grok+Cursor.
merged_from: [software-factory-loop]
---
# Agent harness loops

**Owner:** Researcher (extract) · Forge/Watchdog (verify node) · Big Boss (PM).
**Platform:** Grok Bot + Cursor. **Install:** `none (process-only)` for the pattern. Named repos (OpenBot, AutoResearch clones) → [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate).

## Core loop (FACT pattern)
1. **Goal** — one done-when (`/goal`, session dump, or CloudAgent prompt).
2. **Act** — builder desk / cloud agent changes something.
3. **Verify** — separate node ([golden-test-loop](sand-workflow:golden-test-loop) / [verify-then-done](sand-workflow:verify-then-done)). Builder ≠ verifier.
4. **Keep or revert** — only keep if metric/check improves (Karpathy AutoResearch / “Karpathy Loop” framing — label secondary explainers UNVERIFIED as quotes).
5. **Persist** — Outer Heaven / ACTION_LOG / topic files — not chat-only memory.

**Runnable kit (2026-10-12):** for one-feature keep/revert loops use [feature-loop](sand-workflow:feature-loop) — locked checks (folder + hook + commit), all-features scorer (regression = 0), results.tsv, caps in code, coach proposals behind A/B + owner OK. This skill stays the design doctrine; feature-loop is the implementation.

## Cursor harness map (FACT — cursor.com/changelog/08-19-26)
| Cursor | Hive |
|---|---|
| `/goal` | Long CloudAgent / desk sit with done-when |
| Subscriptions | Routines + PR babysitters |
| Custom modes | Pinned skill / always-load recipe |
| Subagents on VMs | Task executors / cloud agents isolated |
| Steering follow-ups | MessageSubagent / CloudAgent reply without killing the run |

## Open harnesses (RESEARCH-OK — propose, do not auto-install as hive face)
- CopilotKit/OpenBot — open coworkers with own computer; AG-UI
- milind-soni/OpenMausBot — open Grok-like + VM
Hard keep-out: replacing Grok Bot daily OS with these.

## Do
1. Write goal + success check before looping.
2. Cap parallel streams (max 3).
3. Log each keep/revert to ACTION_LOG.
4. Close research with [research-signal-to-skills](sand-workflow:research-signal-to-skills).

## Don't
- Infinite unattended send loops
- Verifier = same agent that built
- Dump 68-subagent packs in one go
- Treat tweet $ as metrics

## Prompts
```
Goal (done when):
Metric / check:
Builder desk:
Verifier desk:
Max iterations:
Keep rule:
```

## Deep repass 2026-09-03 — OpenBot / OpenMausBot / iFixAI / Pixeltable / Cursor harness
Packet: `/workspace/research/packets/x-bookmarks/20260903-live/repass/TOOLS_REPOS.md`

### Cursor /goal loop card (FACT changelog 08-19-26)
```
/goal <one objective>
Done when: <runnable check>
Pair: custom mode (skill pinned) OR /loop check-ins
Subscriptions: wake on PR / Slack / schedule (cloud agents)
Steering: follow-ups wait for next tool — do not interrupt mid-action
Verifier: separate desk (golden-test-loop) — builder ≠ judge
```

### Import-gate propose only (RESEARCH-OK — do not auto-install as hive face)
| Repo | Steal | Path |
|---|---|---|
| CopilotKit/OpenBot | gateway-before-act, CEL fail-closed, AG-UI coworkers, audit | RESEARCH-OK propose |
| milind-soni/OpenMausBot | local harness, permission broker, team Markdown packages | RESEARCH-OK propose |
| ifixai-ai/iFixAI | five-pillar agent audit; builder≠judge | RESEARCH-OK propose |
| pixeltable/pixeltable | media+models+versioning as columns | RESEARCH-OK propose |
Hard keep-out: second desktop as hive face (OpenBot/OpenMausBot/Fable/Claude desktop).
Map loops to hive-smarter-loop + golden-test-loop. Platform: Grok Bot + Cursor. Install: none (process-only) unless operator greens import-gate.


## Bookmark enrich 2026-09-07 — Self-healing agent pattern (no new skill)
Source: X `20260907-1051` · @gregisenberg “self-healing agents” · @painn_x 19-skills worker article (mall — import-gate).

- Self-heal = detect dead-end → constrained retry → **separate verifier** (golden-test-loop / Watchdog). Builder ≠ judge. Do **not** mint `self-healing-agent-loop` — this skill owns it.
- Public “N skills = AGI worker” packs = RESEARCH-OK; prefer owned house rules (HN Social); import-gate if concrete.
- Platform: **Grok Bot / Cursor**. Install: **none (process-only)**.

## YT daily stamp 2026-09-08
Metadata only (no L2). Title ids:
- Kai — Agent Harness explained in 8min (`yt:qXo1P5H2RXk`)
- HubMesh — How to Build Reliable AI Agent Harnesses (3 Open-Source Repos) (`yt:RPz0SZ63pUU`)
Map to existing goal→act→verify→keep loop + golden-test-loop. Named repos = RESEARCH-OK propose only → [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate).
**PROVE:** title triage; hive already owns harness pattern. **WORKAROUND:** Cursor `/goal` + Grok verifier desks. **BLOCKED:** auto-install of the 3 OSS repos as hive face; no second desktop.

## LIVE enrich 2026-09-09 — HubMesh 3 OSS harnesses L2 (`yt:RPz0SZ63pUU`)
Packet: `/workspace/research/youtube-daily/repass-20260909/RPz0SZ63pUU/` (A–E PARTIAL)
- CodeWhale: Plan/Act/Operate + Ask/Auto-Review/Full Access + `/fleet` + `codewhale exec` — map to hive harness + HITL; **BLOCKED** as hive face.
- alirezarezvani/claude-skills: domain packs — propose-only via awesome-skill-import-gate.
- tech-leads-club/agent-skills: SKILL.md+templates/references = hive-native shape (**PROVE** pointer).
Stars/Snyk VO **UNVERIFIED**. Install: none (process-only).

## LIVE enrich 2026-09-09 — Wave E harness anatomy (`yt:qXo1P5H2RXk`)
Packet: `/workspace/research/youtube-daily/repass-20260909/qXo1P5H2RXk/` (A–E PARTIAL)
Four parts: **agent loop** · **context/disk/subagents** · **permissions/sandbox/HITL** · **sticky config** (project/skills/hooks). Prompt toll 8–30k tokens/turn (rent). Same-model cost spread across harnesses (creator 37¢ vs 7¢) **UNVERIFIED**.
**PROVE:** `recreation/harness-anatomy.json`. **WORKAROUND:** Cursor `/goal` + Grok verifier. **BLOCKED:** Claude Code / Kline / Codex as hive face.


## Repass delta — video-training 20260909 Wave I
- yt:96jN2OCOfLs: agentic engineering = coordinate spiky agents without sacrificing quality bar; MenuGen test (delete glue when model swallows job); verifiability selects what automates.


## X bookmarks enrich 2026-09-09 13:59 ET — delegation dial
Packet: `/workspace/research/packets/x-bookmarks/20260909-1359/`.

Delegation ladder: **trivial → inline** · **bounded chunk → one executor** · **independent streams → parallel (≤3)**. Do not default to a swarm. Skill-file guidance never overrides operator standing locks. Platform: Grok Bot + Cursor. Install: none. **PROVE**.

## Wave U extract — Cole Google agentic engineering (`yt:zbmuiaPuiNM`) 2026-09-09

Delta vs Ubyl Cole11: requirements+validation bottleneck; vibe→structured→agentic spectrum; model≈10% / harness≈90%; static vs dynamic context; conductor vs orchestrator; token CapEx vs OpEx.
Google factory / Claude hooks install **BLOCKED**. BetterDB **NO-SKILL**.
Packet: `/workspace/research/youtube-daily/repass-20260909/zbmuiaPuiNM/`.

## Provenance delta — wave Z `f51ICIoHcjY` (2026-09-09)
- FACT: DeepSeek Harness plugins can mutate harness UI/runtime (≠ MCP tack-on). Gate via `awesome-skill-import-gate`; live install **BLOCKED**. Packet: `repass-20260909/f51ICIoHcjY/`.

## Wave Y 2026-09-09 Tim remap
- `_C57BxSXRbU` tool-stack category remap · `kt5a-TXmWew` Claude-Code-features→Cursor/Grok remap
- Packets under `repass-20260909/_C57BxSXRbU/` and `…/kt5a-TXmWew/` — Claude daily OS **BLOCKED**


## CapEx tracks (Documented / Demonstrated / Transferred) — DoD 2026-09-09

Capability tracks for this skill. **Do not** treat harness-anatomy checklist presence, YT stamp enrich, or skill-file touch as PASS.

| Track | Bar | Counterexample |
|---|---|---|
| **Documented** | Goal→act→verify→keep doctrine + Cursor `/goal` map + BLOCKED installs written | Inventory touch; stamp-only metadata |
| **Demonstrated** | Executable minimal loop: **input → agent step → verifier FAIL → retry → verifier PASS**, with per-attempt JSON + jsonl logs; builder ≠ verifier | `harness-anatomy.json` alone; markdown loop card without run logs; enrich-only |
| **Transferred** | **Another desk** runs the harness on a **different task input** (not CapEx `task_loop_card.json`) and produces fail-then-pass logs | Replaying CapEx fixtures; enrich-only; copying STATUS |

### Hard rules
- **checklist-only ≠ Demonstrated.** `recreation/harness-anatomy.json` / HubMesh title triage stay **Documented** until a loop runner writes FAIL then PASS artifacts.
- **enrich-only ≠ Transferred.** Touching this SKILL.md or stamping YT daily does **not** move Transferred.
- Builder must not self-grade; verifier is a separate node.

### Certified Demonstrated — 2026-09-09 (weaker of golden-test-loop / agent-harness-loops)
CapEx demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/harness-loop/`
- Runner: `harness_loop.py`
- Fixture: `fixtures/task_loop_card.json`
- Proof: `out/agent_attempt_1.json` (FAIL path) → `out/verifier_attempt_1.json` FAIL → `out/agent_attempt_2.json` → `out/verifier_attempt_2.json` PASS; `out/loop.jsonl` + `out/loop_run.json` + `out/loop_run.log`
- Packets reused: `qXo1P5H2RXk`, `RPz0SZ63pUU`

### Transferred — OPEN
Requires another desk run on a **different** task input. Until that returns fail-then-pass logs, **Transferred = unchecked**.

### Done-when (E / Transferred)
```
Done when (Demonstrated): harness_loop.py (or successor) shows verifier FAIL then PASS with logged files.
Done when (Transferred): different desk + different task JSON → new out/ with same fail-then-pass contract.
Enrich-only / anatomy-checklist-only / re-fixture replay ≠ Transferred.
```

### Sibling note
`golden-test-loop` now has its **own** CapEx Demonstrated demo under `demos/golden-test-loop/` (golden string+sha256 contract — distinct from this harness field/`success_check` loop). See `STATUS_GOLDEN.md`. Transferred remains OPEN for both until other-desk runs.

## Deterministic vs agentic host ladder 2026-09-17 (`yt:FqnNL8fnUWo`)

Packet: `/workspace/research/youtube-daily/l2-20260917/FqnNL8fnUWo/` · recreation `classify_automation.py`.

| Kind | Meaning | Host |
|---|---|---|
| **Deterministic** | Fixed path; AI ok if single-pass (no loop-back) | Code on routine/cron/webhook — **outside** chat meter |
| **Agentic** | Mid-run tool choice / research loop-back | Keep on subscription wakes **or** SDK/API agent only at real scale |

**Don't** default every cron to a full agentic harness. Climb only when needed. Codex SDK live = **BLOCKED** (would work if SDK+host). Trading demos = advise-only. Pair [host-automations-outside-subscription](sand-workflow:host-automations-outside-subscription).


## WL800 title-only enrich 2026-09-17

`yt:E4gkCE6_xiQ` — Agent Harness Explained in 6 Minutes: The Next Big Thing in AI (Cloud X Berry)

**Title steal:** harness (goal→act→verify→keep/revert) > raw agent spam. Sibling of already-closed `yt:qXo1P5H2RXk` — **no L2 redo**. Do not clone DeepSeek/third-party harness as hive face.

| Item | Label |
|---|---|
| Harness-over-agent framing | FACT title |
| Vendor harness install | **BLOCKED** — process-only on Grok+Cursor **PROVE** |
| $ / “next big thing” | **UNVERIFIED** |

Packet: `packets/signal-miss-backfill-20260917/watch-later/WL800_CLOSE.md`

## Enrich 2026-09-21 — RISK_GATE auto-mode (yt:VE5dsWll06M)
Before destructive tools, run a bounded yes/no (or Choice) gate — LangChain “auto mode” remap. BLOCK shell_rm_rf / DROP DATABASE; ALLOW read/lint. Proof: `harness-route-risk-judge`. Builder ≠ JUDGE_RUBRIC still holds.

## X CapEx fullwatch 2026-09-22 — 6-harness comparison (`x:2095463061142512089`)
Packet: `/workspace/research/packets/x-bookmark-videos-fullwatch-20260922/2095463061142512089/`

**FACT steal (0xSero):** Split by job — desktop **Codex/Zcode** = multi-day goals + browser/computer use + sidebar session scale; CLI **Pi/OMP** (Claude Code rare) inside **Warp**/multiplexer = coding with repo visible; browser plugins (Sitegeist / Codex-in-browser) for web ops. Model quality > plugin brand. Watch agent mess / unsupervised scripts.

**Hive remap:** Cursor + Grok Bot desks. Do not require Codex/Zcode/OMP/Claude desktop installs. Computer-use verify → Playwright. **NO mint-per-URL.**

## X CapEx fullwatch 2026-09-22 — OpenBot silent UI (`x:2095510707299287175`)
Packet: `/workspace/research/packets/x-bookmark-videos-fullwatch-20260922/2095510707299287175/`
FACT visual path: Computer browser login → account pull → Generative UI recency chart → `/outreach` skill. Speech CAPTION_GAP (silent). Repo CopilotKit/OpenBot. Keep-out: not hive face. **NO mint.**

## Enrich 2026-09-22 — Dual desk: Grok Bot ↔ Cursor Projects (`yt:Fr2nqjVTxhI`)
Packet: `/workspace/research/youtube-daily/l2-20260922/Fr2nqjVTxhI/` · prove-one A–E.

**FACT steal (Craig Hewitt):** Two complementary always-on cloud systems — **Grok Bot** = teammate for admin/ops (email, calendar, social, support, research briefs); **Cursor Projects** = coordinator for a codebase (long-running thread, skills/MCPs, cloud agents that keep running after laptop shut). **Choose by where the work lives.** One job can use both: Grok research+brief → HITL decide → Cursor Project build+test+review.

**Hive remap / PROVE:**
- Route table + handoff: `recreation/DUAL_DESK_RUNBOOK.md`
- Runnable classifier: `recreation/route_job.py` → `route_job_proof.json`
- Bridge memory via Outer Heaven / packets — product shared memory **UNVERIFIED** on tape
- Claude Code / Claude desktop as face → **BLOCKED**; Cursor CloudAgent **WORKAROUND**
- SpaceX/Cursor acquisition spoken claim → **UNVERIFIED**
- Do **not** mint a new dual-tool skill — this harness skill + session-bootstrap own the recipe

## Enrich 2026-09-23 — JSM Agentic Engineering system (`yt:Vok_nReMFaU`)
Packet: `/workspace/research/youtube-daily/l2-20260923/Vok_nReMFaU/` · prove-one A–E PASS.

**FACT steal:** Nine-skill file-backed harness (scope→architect→develop→audit/sync→check/test/document→debug) fights "AI decay." Develop invent-gate + Assumed overrides; verify drives the app; review on a second model.

**Hive remap / PROVE:**
- Skills already installed as `jsm-ae-*` — **no mint**
- Phase router: `recreation/ae_phase_router.py` → proof 4/4
- Claude desktop face → **BLOCKED**; Cursor + Grok **WORKAROUND**
- Watchdog owns `/check review` (no self-PASS)
- Timedtext 429 → Whisper slice **PROVE**


## X bookmarks desktop 20260923 — multi-agent race + chief loop
Packet: `x-bookmarks/20260923-desktop/`.

**FACT (preview):** @svpino `2102044069673435563` — two agents on the same data without coordination → stale reads, overwrites, wasted tokens. Need explicit ownership / locking / single-writer before parallel agents.

**FACT (preview):** @1920web1080 `2101658383958876623` — SpaceX-engineer Grok Bot livestream notes → one-chief harness pattern (MIT repo claim); treat product lore as **UNVERIFIED**, keep “one chief / markdown handoffs / max-3” hive lock.

**Do not:** mint trading bots, Meta-ads autopilot, or Jev-trader from Roundtable spam (NO-SKILL).

## X bookmark 20260924-1044 (`x:2101647835477209480` unicodef1wn)
INFERENCE: six single-job bots with handoff comments ≈ thin role packs + markdown handoffs (already hive shape).
- Atom: one-job-per-bot → handoff → next; do not mint desk 18.
- Label: WORKAROUND to existing 17-desk / max-3 / agent-job-card.
- NO-SKILL: “replace yourself” growth-lead PDF as doctrine.

## X bookmark 20260924-1623 (`x:2102707047602979144` nereasolenne)
Preview: Google 8-min tutorial "build your first AI agents" (ES).
- Atom: first-agents tutorials ≈ thin role packs + handoffs already covered here; use as RESEARCH-OK curriculum pointer only.
- Label: **RESEARCH-OK** / Cap for full watch. Do not mint a Google-Agents twin skill.
- Keep 17-desk / max-3 / markdown handoffs.

## LIVE enrich 2026-09-25 — sandbox threat model (`yt:b9_kJn0zm5U`)
Packet: `/workspace/research/youtube-daily/l2-20260925/b9_kJn0zm5U/` (A–E PASS).
WHO SAYS NO layers: YOU → CLASSIFIER → KERNEL → HYPERVISOR. Three escapes: WRITE_OUTSIDE (walls stop) / READ_INSIDE (walls pass) / EGRESS_DOOR (walls ignore).
Map: Tier-3 HITL=YOU · Auto-review=CLASSIFIER · box/no-machineId=KERNEL · microVM=BLOCKED.
Do not treat OS sandbox alone as credential safety. Cross-ref [tool-permission-not-prompt](sand-workflow:tool-permission-not-prompt).
**PROVE:** `recreation/threat_model_audit.py`. **WORKAROUND:** Cursor+Grok gates vs Claude sandbox. **BLOCKED:** Docker Sandboxes / Claude Code hive face.

## X bookmarks 20260925-1315 (`x:2095595741528125780` OpenAI Astra)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1315-desktop/`.

**FACT (preview):** OpenAI pitches GPT-6 Astra as computer-use agent ("anything you can do on a computer").
**UNVERIFIED:** capability surface vs our sandbox/harness threat model; marketing claims.

### Map
1. RESEARCH-OK competitor computer-use signal — compare against owned agent-harness-loops + tool-permission-not-prompt (sandbox theater steal already on desk).
2. Cap: marketing video HELD — no doctrine ADOPT from bookmark text.
3. METHOD_PROMOTION_WITHOUT_LOCAL_EVIDENCE — Astra ≠ hive default agent runtime.

| Need | Label |
|---|---|
| Owned harness + permission model | **PROVE** |
| Astra as required hive runtime | **BLOCKED** |

## X bookmarks 20260925-1618 (`x:2103554802580128130` DavidOndrej1 Cloudroom)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1618-desktop/`.

**FACT (preview):** Pitch — agent runs locally → close laptop → teleport to cloud → keeps running; product named Cloudroom.
**UNVERIFIED:** Cloudroom capability surface vs Cursor Cloud Agents / Projects; marketing Cap.

### Map
1. Atom already owned: Cursor CloudAgent / Projects "keep running after laptop shut" (Craig Hewitt / harness map above).
2. Cap: product demo video HELD — no doctrine ADOPT; Cloudroom ≠ hive face.
3. WORKAROUND: use owned CloudAgent launch/reply/watch tooling instead of Cloudroom install.
4. METHOD_PROMOTION_WITHOUT_LOCAL_EVIDENCE — preview text only; no local proof of Cloudroom.

| Need | Label |
|---|---|
| Owned Cursor CloudAgent keep-running | **PROVE** |
| Cloudroom as required hive runtime | **BLOCKED** (would work if we had Cloudroom — not needed) |


## LIVE enrich 2026-09-29 — Decoding AI coding harness (`yt:sJpop1juVBQ`)

Packet: `/workspace/research/youtube-daily/l2-20260929/sJpop1juVBQ/` · Cap≤1 A–E **PASS**.

**FACT steal (Whisper+slides; ASR fixes = INFERENCE):** Headless harness = agent loop + modules, attached to **Interactive (TUI + steering queue)** or **Remote (durable runtime)**. Core tools only: `read` · `write` · `edit` · `bash` (optional grep/todo/web pile into the system prompt — keep prompt small). Modules: LLM providers · sandbox · permissions (edit/plan/bypass) · memory (`AGENTS.md`/`MEMORY.md`) · skills · LSP · **compaction** (`/compact → {summary,tail}` + `/clear`). Steering: **buffer** user messages; inject only **after tool-result append** or **after goal loop end** — never mid-model-call (priority gate is virtual). Remote: checkpoint each model/tool call; replay/branch for evals; HITL hold must free compute for other agents.

### Recipe another desk can apply
1. Keep builder loop thin (4 core tools bias); put durability/permissions/memory in the **harness**, not the agent identity.
2. Any mid-run operator message → queue; drain at safe boundary (CloudAgent reply-without-interrupt / MessageSubagent).
3. Log model+tool steps as checkpoints (jsonl) so a later eval can branch — do not require Temporal/Opik.
4. Remap course hosts (Claude Code TUI, Modal, Temporal, Opik, PydanticAI demo) → table below. **Do not claim Decoding AI course mastery.**

| Need | Label | One-liner |
|---|---|---|
| Steering queue safe-inject | **PROVE** | `l2-20260929/sJpop1juVBQ/recreation/steering_queue_demo.py` exit 0 PASS |
| Module map | **PROVE** | `recreation/harness_module_map.json` |
| Goal→act→verify sibling | **PROVE** | existing `harness_loop.py` CapEx demo |
| Temporal durability/replay | **WORKAROUND** | jsonl checkpoints + CloudAgent watch/reply |
| Modal/Docker sandbox as taped | **WORKAROUND** | box + Cursor cloud VM + tool-permission-not-prompt |
| Claude Code / Pi / Codex face | **WORKAROUND** | Cursor + Grok Bot desks |
| Opik debug UI | **WORKAROUND** | ACTION_LOG / loop.jsonl / golden-test-loop |
| Course stack / Temporal / Opik as required hosts | **BLOCKED** | would work if Temporal worker + Opik + course repo were hive-owned (not needed) |
| Claude desktop daily OS | **BLOCKED** | keep-out |

Cost/GPU "$" from tape = **UNVERIFIED**. Install: **none (process-only)**. NO mint.

## Signals-close gate 2026-09-29 ~09:57 ET
Fire: `packets/signals-close-20260929-0957/`. Cap≤1 `yt:sJpop1juVBQ` already CLOSED morning — reuse only (no second L2).
- Re-PROVE: `recreation/steering_queue_demo.py` → **PASS exit 0** at close.
- X live bookmarks **BLOCKED** spend-cap → no NEW X builder folds this fire.
- Shelf HOLD title-only unchanged: `OuNKBjuV7A4` · `UXbAuWvUwUE`.
- Install: **none (process-only)**. NO mint. Course/$ = UNVERIFIED.

## X bookmarks 20260929-1035 — verifiable agent loop (`x:2103122930792341681`)

Packet: `/workspace/research/packets/x-bookmarks/20260929-1035-desktop/` · desktop-computerUse-dom-scroll head · API posts/bookmarks 403 spend-cap.

**FACT (DOM title/preview):** @Steve8708 (Builder.io) — best agent builds give something **verifiable**, let it **loop**, don't stop until done.
**INFERENCE:** same atom as Decoding AI harness close (`yt:sJpop1juVBQ`) + existing goal→act→verify loop.
**UNVERIFIED:** any Builder.io-specific tooling claims (video Cap held; no fullwatch this fire).

### Map
1. Prefer owned `harness_loop.py` / steering-queue safe-inject — already **PROVE**.
2. Cap hold the X video — no second Cap≤1 fullwatch; title atom only.
3. Anti: mint a Builder.io twin skill; Signals ≠ policy.

| Need | Label |
|---|---|
| Verifiable loop on Grok+Cursor | **PROVE** (existing) |
| Fullwatch Builder.io reel | **HELD** Cap |

## X bookmarks 20260929-1327 — self-host multi-agent + Jev harness PDF pointer

Packet: `/workspace/research/packets/x-bookmarks/20260929-1327-desktop/` · desktop-computerUse-dom-scroll head · API bookmarks 403 spend-cap.

### @svpino self-host multi-agent workspace (`x:2104928072856412432`)
**FACT (DOM preview):** open-source self-hosted dev environment for **multiple coding agents** · configurable templates/workspaces · local or basement server.
**INFERENCE:** same keep-out as OpenBot/OpenMausBot — second desktop ≠ hive face; map to owned box + Cursor cloud agents + ≤3 parallel streams.
**UNVERIFIED:** project name/repo quality (Cap video held; no fullwatch this fire).

| Need | Label |
|---|---|
| Multi-agent on Grok+Cursor | **PROVE** (owned harness + cloud agents) |
| Self-host OSS as hive face | **BLOCKED** (import-gate only if operator greens) |
| Fullwatch svpino Cap | **HELD** |

### @polydao Jev harness PDF pointer (`x:2103722987832717407`)
**FACT (DOM preview):** Diogo Amogo (Jev) PDF on building a Jev harness — claimed 200x faster / 400x cheaper; speed+cost sit in harness not model.
**INFERENCE:** strengthens owned goal→act→verify + Jev role packs (not universal second brain). Cost/"Nx" = **UNVERIFIED**.
**UNVERIFIED:** PDF contents / metrics (Cap held).

| Need | Label |
|---|---|
| Harness-over-model framing | **PROVE** (existing) |
| Jev PDF doctrine ADOPT | **BLOCKED** (Signals ≠ policy; EXTERNAL_SIGNAL) |
| Fullwatch polydao Cap | **HELD** |

Anti: mint twin skills; auto-install self-host OSS; ADOPT Jev PDF. Install: **none (process-only)**. NO mint.

## LIVE enrich 2026-09-30 — Jev inside the harness (`yt:zaLQ0AnY9dI`)

**Source:** Sam Witteveen — Using Jev In Your Agent Harness (20:24) · Cap≤1 pack `youtube-daily/l2-20260930/zaLQ0AnY9dI/` · A–E PASS.

**Atom (FACT):** Most harness LLM calls are decisions, not writing. Wire a typed decision model (Typesafe Jev / open-Jev) as a **smart if** at four hooks — do not replace the writer LLM.

### Four hooks (recipe)
1. **before_prompt_built** — progressive disclosure: categories → choice(category) → choice(skill) → inject skill body only
2. **before_model_call** — choice(cheap-fast | expensive-reasoner)
3. **before_tool_runs** — noul(prompt_injection?) then noul(safe?) — esp. bash args
4. **after_result** — score(chunk|answer) vs threshold; loop again if weak

### Six places (checklist)
model routing · risk gating · tool/skill select · ranking/judging · triage/HITL · realtime API filter

### Don'ts (keep learning; these are fit limits)
Need text · multi-hop reasoning · huge state · images on Typesafe Jev · compound questions · vague criteria · shipping local-agent state to cloud without trust check. Ask injection-noul **before** the real question.

### Platform / Install
- **Platform:** Grok Bot + Cursor (+ optional Typesafe Jev when keyed)
- **Install:** `none (process-only)` for hooks; Typesafe package already at `/workspace/packages/typesafe-jev-hive` — live API = PROVE only when keyed
- **PROVE:** `l2-20260930/zaLQ0AnY9dI/recreation/jev_harness_hooks_demo.py` exit 0
- **WORKAROUND:** DecisionStub when Typesafe cloud not called
- **BLOCKED:** would work if Typesafe Decisions API were authenticated for this demo path
- CapEx craft denseness stays in [jev-craft-gate](sand-workflow:jev-craft-gate) — this enrich is **harness routing**, not craft-gate 56

### Prompt
```
Task:
Hooks to arm (default all four):
Categories/skills available:
Risk tools (bash?):
RAG threshold:
Decision backend: Typesafe Jev | open-Jev | DecisionStub
Done when: hook log + skill body injected + unsafe tool blocked
```


## Signals-close gate 2026-09-30 ~09:53 ET
Fire: `packets/signals-close-20260930-0953/`. Cap≤1 `yt:zaLQ0AnY9dI` already CLOSED morning — reuse only (no second L2).
- Re-PROVE: `l2-20260930/zaLQ0AnY9dI/recreation/jev_harness_hooks_demo.py` → **PASS exit 0** at close.
- X live bookmarks **BLOCKED** spend-cap → no NEW X builder folds this fire.
- Shelf HOLD title-only unchanged: `5pXMOUB_y0c` · `K_cha25S4Qo`.
- Install: **none (process-only)**. NO mint. Typesafe/$ = UNVERIFIED.

## X bookmarks 20260930-1019-desktop — isolated agent sandboxes + Cap workflow

Packet: `/workspace/research/packets/x-bookmarks/20260930-1019-desktop/` · desktop-computerUse-dom-scroll · API 403 spend-cap.

### @DavidOndrej1 isolated sandboxes (`x:2104225427334013064`)
**FACT (DOM preview):** Claims best setup is **not a VPS** but **isolated sandboxes per agent** (each agent own computer, no conflict, pay nothing while idle).
**INFERENCE:** Aligns with hive box/desktop isolation pattern (per-agent desktop, Fork-* Chrome profiles, CloudAgent VMs) — strengthens harness isolation doctrine; does **not** require Mac local agents.
**UNVERIFIED:** vendor sandbox product, idle-pricing math, security boundaries.

| Need | Label |
|---|---|
| Per-agent isolated compute (Grok box / CloudAgent) | **PROVE** / STRENGTHENS_EXISTING |
| Mandatory third-party sandbox SaaS | **CANDIDATE** (import-gate if named) |
| Evens Mac as agent host | **BLOCKED** (LOCAL MACHINE PROHIBITION) |

### @DavidOndrej1 agentic eng workflow Cap (`x:2104104963861565927`)
**FACT (preview):** ex-Apple cybersecurity / agentic engineering workflow reel claim.
**Map:** Cap HELD Watch Later — text preview closed; fold atoms only after fullwatch.

### @antigravity /plan mode (`x:2103611698800140697`)
**FACT (preview):** Antigravity 2.0 dedicated planning mode (`/plan` → research → implementation plan → approval).
**Map:** Planning-before-act atom → STRENGTHENS harness goal/verify gate; Antigravity IDE as hive face **BLOCKED** (Cursor+Grok stay). Cap HELD.

Anti: mint sandbox-SaaS skill from tweet; route agents onto Evens Mac; ADOPT Antigravity as daily OS. Install: **none (process-only)**. NO mint.


## X bookmarks 20260930-1616-desktop — self-evolve + external eval gate

Packet: `/workspace/research/packets/x-bookmarks/20260930-1616-desktop/` · desktop-computerUse-dom-scroll · API 403 spend-cap.

### @RoundtableSpace self-evolve agent (`x:2105330581345103924`)
**FACT (DOM + status expand):** Claims an agent that continuously proposes/tests own-code changes and **only accepts** when **external evaluation** proves improvement. Repo URL not recoverable in DOM/status expand this fire (card ends at "Repo:").
**INFERENCE:** Same keep/revert + builder≠verifier loop already in this skill — STRENGTHENS_EXISTING. Named-repo import deferred until URL recovered.
**UNVERIFIED:** repo identity, eval harness quality, continuous-unattended safety.

| Need | Label |
|---|---|
| External-eval before keep (hive golden-test / verify-then-done) | **PROVE** / STRENGTHENS_EXISTING |
| Named self-evolve repo as hive dep | **CANDIDATE** pending URL → import-gate |
| Unattended infinite self-modify | **BLOCKED** (harness Don't) |

Anti: mint self-evolve skill; ADOPT unnamed repo from Roundtable card. Install: **none (process-only)**. NO mint.


## YT daily stamp 2026-10-02 — Cloud vs local agents (`yt:LmV0OiNjw8c`)

Packet: `/workspace/research/youtube-daily/l2-20261002/LmV0OiNjw8c/` · Cap≤1 A–E **PASS**.
Creator: Your Average Tech Bro · Cursor Cloud Agents + Grok Bot sponsor section.
Prior A_BUILD preview queue for this id ≠ this Researcher demonstration close.

### Steal (FACT → hive recipe)
| Rule | Lane | Hive path |
|---|---|---|
| Parallel features that both need DB migrations | **CLOUD** (isolated env) | Cursor CloudAgent — local worktrees still share one Supabase |
| Sentry/PostHog paper-cut (no context switch) | **CLOUD** | `sentry-fix-to-pr` + CloudAgent (Sentry MCP still BLOCKED → log/issue WORKAROUND) |
| Backend/API multi-case verify | prefer **CLOUD** | CloudAgent |
| Fine UI/UX edit-this-text loops | **LOCAL** | Grok box / Cursor local — faster refresh than cloud desktop record |
| Finish-where-start | same lane | Prefer complete where started; flaky handoff → **PR then clone branch** |
| Env onboarding | docs gate | install + login + test_recipes required before agent self-test |

### PROVE / WORKAROUND / BLOCKED
| Item | Class | Note |
|---|---|---|
| `recreation/cloud_vs_local_router_demo.py` exit 0 | **PROVE** | isolation · UI local · Sentry cloud · finish rule · env-docs gate · prompt cannot bypass |
| Cursor CloudAgent + Grok Bot shared computer | **WORKAROUND** | for Devin / Claude desktop as face |
| Devin as hive face; unbounded cloud fan-out | **BLOCKED** | would work if Cap≤1 meter + import-gate allowed named second vendor |
| Mere CloudAgent tool existence = mastery | **FAIL** | must run router/docs method |

Platform: **Grok Bot + Cursor**. Install: **none (process-only)**. NO mint. ARR/$ on tape = **UNVERIFIED**.

## Cross-ref 2026-10-10 (`yt:cWjS56edaUA` Cole Medin, Agentic Apps)
Every LLM call inside a deterministic spine (classify → Switch → tested policy function → phrase; OTHER = fixed refusal; human Send) — recipe + box proofs in [agentic-app-policy-workflow](sand-workflow:agentic-app-policy-workflow).

## Full study 2026-10-10 cross-refs (X Sep 24–30)
- @Steve8708 "give an agent something verifiable, let it loop" (6.5-min talk transcribed): engineering shifts to building verifiers (pixel diffs vs Figma, import/export round-trips, P90 metrics); loop = prompt→code→verify→fail→code until pass.
- `DaizeDong/self-evolve` (@RoundtableSpace): profile→reflect→propose→patch→evaluate→accept/review; **freeze the eval contract + holdout before editing**, models propose, deterministic gates accept, worktree isolation ≠ OS isolation. Box run: 1299 passed / 44 failed / 8 errors (failures mostly `Run capacity reached` state-sharing in tmp + 1 CN-keyword doc test) → PARTIAL, pattern adopted, tool not installed.
- @DavidOndrej1 / @kunchenguid debate: isolated per-agent sandboxes (pay nothing idle) vs owned hardware (Mac mini $2.5k vs ~$300/mo VPS). Same rule as ours: isolation per agent, cost per idle hour decides cloud vs owned.
- @svpino self-hosted multi-agent dev envs (transcript): templates (Terraform) → workspaces (Docker) auto-clone the repo, VS Code in browser + coding CLIs per workspace — the Coder-style pattern; maps to our `/tmp` sandbox + per-agent desktop rule.

## Enrich 2026-10-10: daily board + unit budget (`yt:kHqjPdttzbw` Moon Dev live)
FACT: an outer Python `while` loop keeps agents alive ("Claude Code never runs forever; Python does"). The **daily board** resets each day, every agent posts its final report, and the board is injected into every new prompt. Spend is tracked per day across providers (Groq, OpenRouter), and agents stop when the day's units run out.
PROVE: `board_budget.py` (this folder) → `2/2 PASS` (board isolation by date and no self-echo; ledger refuses over-cap charges).

## Enrich 2026-10-10: parallel task board (`yt:PUBc2G0Tj5E` Codex CLI)
Kick off N tasks in parallel, each in its own workdir. Keep a board grouped by status (running / done / failed) and send follow-ups into a running task's inbox. `task_board.py`.

## Enrich 2026-10-10: plan-then-parallel streaming (`yt:QlXejO3a-lU` echohive)
When generation is slow: time every step in a lab copy, then make ONE plan and generate all parts at once, starting each part the moment the planner names it. Play/stream part 1 while the rest finishes, and finish with a critic pass (desktop + phone). `plan_then_parallel.py` (4x end-to-end on a stub).

## Enrich 2026-10-10: exact-oracle search loops (`yt:hl6VOfzky5E` matching decompilation)
Agents shine when each attempt gets an exact pass/fail with a diff (compiler + byte compare, a test suite, a schema). Loop: candidate → oracle → diff count → retry (cap ~12). Without an oracle, treat claims as unverified. `matching_decomp.py`: diffs went 57 → 1 → MATCH.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Plan, fresh-context steps, clean verifier.** Write the plan first, run each step with only its own step text (no shared chat history), then hand the results to a separate verifier whose only job is to fail anything without evidence and mark it UNCONFIRMED. Sources: x:2087910909947642285, x:2077199463278395732 (their 96%/46% figures are UNVERIFIED). PROVE: `fresh_verifier_loop.py` (this folder) → ok, flags the step that has no evidence.
- **Give long runs explicit structure.** For multi-day runs, write down nodes, edges, state and a stop policy, and add code fallbacks, so the loop doesn't drift (x:2088682533278077382, claim only).
- **Budget-stop on taste-heavy assets.** If a loop makes no visible progress within its budget on character animation or similar taste work, source or buy the asset instead of looping longer (x:2070315399422341481).
- **Delete before automating.** Question each requirement and remove steps before you put agents on a workflow (x:2046047631638696210).
- **Draft → separate reviewer → commit** (x:2094692986760180130, corroborated by x:2087910909947642285 and the tool-permission draft-only rule). The drafting agent never writes straight to the live store.
- **Build the factory, not just the product** (x:2088359756096532965, corroborated by yt:blI10_91xgA and yt:DcLj_SO8JNk software-factory videos): reusable primitives, a shared failure memory and human checkpoints make each new build faster.

## Enrich 2026-10-10: keep the agent away from its own grader (`yt:v46nTP-XNXc` agentic coding failure modes)
- Never let one agent write both the fix and the test that judges it. If an agent's diff touches tests, the evaluator, or conftest, send it to a human or a separate critic instead of auto-merging. Recreated: `oracle_lock_gate.sh` (signals-2mo-backlog recreations) passes an honest fix and flags a "fix" that weakened the test.
- Match controls to the worst damage a task could do. A local refactor needs git isolation plus protected tests; anything that can touch production needs default-deny access, short-lived credentials and a human approval.
- Give agents the repo's real map up front (architecture notes, symbol index, read-only schemas) instead of hoping they infer it; add CI checks for diff size/complexity and duplicate helpers so files don't balloon.
- Parallel agents collide in big shared files: give each one an owned file set (single writer). The tape's percentages (e.g. reward-hacking rates vs 26% for humans) are UNVERIFIED.

## Enrich 2026-10-11: score gaming in autoresearch loops (yt:b70or37mSfg, Moon Dev, Karpathy-loop on trading backtests)
- A 24-hour keep-if-better loop scored on ROI×Sharpe kept 112 of 158 edits, but the later "wins" were the same strategy with the size/leverage dial turned up: return bought with risk, not edge. A volatility guard set relative to the current baseline ratcheted upward each keep. It also ran all night on the wrong Python environment and with fees set 3× too high.
- Guards: freeze a holdout (other assets/periods) and require out-of-sample gain; include costs (find the cost wall); cap scale knobs or reject keeps whose only change is a scale knob; anchor guards to the seed, not the moving baseline; verify the runtime environment before an overnight run. Many iterations on one idea is overfitting by construction; the creator validates live at tiny size. PROVE: `recreations/20261011/loop_score_gaming.py` → PASS. Trading stays advise-only; ROI figures UNVERIFIED.

---

## Merged from `software-factory-loop` (2026-10-11)

- Original description: Use when setting up agents to take issues all the way to a reviewed PR. Covers the queue, control plane, sandbox, a validation contract written before work, sequential workers, an event stream, and human PR handoff, plus cheating detection.
- Unique content carried: issue→reviewed-PR queue, control plane, sandbox, validation contract
- Original support files moved to `merged/software-factory-loop/` (software_factory.py); relative paths in this section resolve there.

# Software factory loop
Sources: `yt:lx0Eaane4Ng` Jaymin West (Warren, github.com/jayminwest/warren) and `yt:vGCJ7diEtrw` Tereza Tížková (Factory). Studied 2026-10-10.
## Steps
1. Work enters as an **issue** in a queue, not an ad-hoc prompt.
2. The control plane assigns one issue to one worker at a time. Run workers **in sequence** with fresh context; don't swarm.
3. Each run gets a throwaway **sandbox** copy.
4. Write the **validation contract before any code**: which tests or checks, which command, and hashes of the test files. Add a user-testing validator that clicks through the app where there's a UI.
5. Validate: if the contract files changed, reject (a cheating agent). Then run the checks.
6. Emit every step to an **event stream**. Keep memory per repo.
7. Hand off as a **PR diff** for human review. Humans decide what to build.
8. Cost: route models automatically, switching on failure (Factory claims ~25% savings), and use deferred/progressive context.
## Proof
`software_factory.py` → PASS (cheater rejected, honest fix handed off). Live model routing: BLOCKED_CURSOR_USAGE.
Related: [factory-not-feature](sand-workflow:factory-not-feature), [agent-harness-loops](sand-workflow:agent-harness-loops), [n8n-llm-build-bakeoff](sand-workflow:n8n-llm-build-bakeoff).

## Enrich 2026-10-11: triage gate + remote deploy (yt:joKb_QMmglM, Cole Medin, on Archon)
- **Triage before any worker runs.** Each issue is checked against the factory's mission and rules: reject, accept with a priority, or flag needs-human. Auto-merge only when validation passes *and* triage said accept; anything hitting an escalation rule (auth, billing, data deletion, secrets) holds for a human. PROVE: `recreations/20261011/factory_triage_gate.py` in signals-2mo-backlog-20261010 → PASS.
- **Remote, always-on.** The factory runs on a small Ubuntu VPS and takes GitHub issues 24/7. Setup is a cheat-sheet URL handed to the coding agent ("help me set this up"); it interviews you for the mission/rules context files, then uses SSH plus the host's MCP to configure firewall, tooling, repo and DNS.
- **Credentials stay human.** The agent stops for GitHub and coding-agent login on the box (device-code auth); it never gets your passwords. Instance creation is also left to the human. Matches our read-only-toward-accounts rule.
- End-to-end test = one tiny real issue taken to a validated PR before real work. "GPT-6 Astra beats Fable 5.1" is the creator's opinion, UNVERIFIED; sponsor segment (Hostinger) ignored. Live deploy: BLOCKED (would need a VPS and Evens's approval; building mode, no spend).

## Enrich 2026-10-11: label-triggered factory (yt:AbpyqAfxZ8c, Owain Lewis; repo github.com/owainlewis/factory, MIT)
- **Issue labels are the pipeline.** One-shot readiness labels are the machine gates: `factory:ready-for-spec` runs a triage workflow (rewrite a vague ticket into outcome, context, acceptance criteria, repro), a human then adds `factory:ready-to-implement`, which runs the implement workflow (worktree → plan → code → tests → review → address findings → conventional commit → PR). Workflows are plain Markdown prompts in the repo; the implement prompt says never merge.
- **Always watching, not always spending.** Polling is plain code; a model runs only when a trigger matches, so an idle factory costs zero tokens.
- **Version-control scheduled jobs** (e.g. a nightly bug finder that opens a ticket, not a PR) next to the triggers, so the team can review and run them by hand.
- **Isolation honesty.** Git worktrees isolate branches but share host files, network and credentials, so they're for trusted work only; use a disposable sandbox VM/container (Docker Sandboxes) when running on a shared box. Label/triage access on the repo is the trust boundary; don't point it at repos where strangers can label.
- Grant trust gradually: ticket → PR → (personal projects only) merge. The newer repo version adds a control plane with leases, retries and Codex or Claude Code workers.
- PROVE: `recreations/20261011/run1230/factory_labels.py` in signals-2mo-backlog-20261010 → PASS (only the labeled issue runs, idle polls spend nothing, no auto-merge).

## Enrich 2026-10-12: box-proven trials (yt12, /workspace/trials/yt12-20261012)
- **PR body shape** (Pocock /pr, yt:Q3uuE2adUT8 @5:19): Summary as the smallest visual, Evidence before/after, and Merge Danger (one-way or two-way door plus blast radius). PROVE: `/workspace/trials/yt12-20261012/m11-pr-merge-danger`. A validator accepts the generated body and rejects a plain one.
- **Retro from the session log, suggest only** (yt:Q3uuE2adUT8 @5:40). PROVE: `/workspace/trials/yt12-20261012/m12-retro-from-session-log`. A deterministic scan of Codex thread 01a121e1 surfaced 20 nonzero exits and 6 'approval policy is never' rejections as candidates. A human picks; nothing auto-applies.


## Wired 2026-10-13: safety tools + missed methods (Evens yes, Oct 13 1:14 AM ET)
Tools live in `/workspace/builds` (installed in `~/.local/bin` by `install.sh`, which runs every test first). Packet: `/workspace/research/packets/missed-methods-20261013/`.
| Need | Call | Owner desk |
|---|---|---|
| Capped loop (max-iter, wall clock, cost, stall) + receipts | `done-when-loop … --routine R --log receipts.jsonl --escalate escalate-hitl` | Forge |
| Escalation drill (cap=1, prove the human route fires) | `escalation-drill <routine>` → card in `/workspace/hitl/escalations/` | Watchdog |
| Failure-library replay before accepting a change | `replay-gate --library failures.jsonl --cmd '<candidate>'` | Watchdog |
| Two fresh reviewers (spec vs standards) | `two-review --builder A --spec-reviewer B --standards-reviewer C …` | Watchdog |
| Retry / first-pass rate | `retry-rate receipts.jsonl` (weekly) | Watchdog |
| Routine go-live gate (drill + first-run read + WIP ≤2) | `routine-gate check <routine>` | Watchdog / Big Boss |
| Push guard (blocks main, public, delete without EVENS_OK=yes) | `cp /workspace/builds/blast-radius-guard/pre-push <repo>/.git/hooks/` | Forge |
| PR body with Merge Danger | `.github/pull_request_template.md` (draft PR, see packet STATUS.md) | Forge |
| Rule-file lint | `rules-lint` (run only; edits and `--bless` are Librarian's) | Librarian |

## Wired 2026-10-13 (overnight)
- Escalations now surface in a file a human reads: `escalate-hitl` refreshes `hitl-digest` → `/workspace/hitl/MORNING_DIGEST.md` (box) or `~/hitl/MORNING_DIGEST.md` (Mac), and the Mac DESK_KNOWLEDGE.md shows the "Needs a human" count. No sends.
- Retry only transient failures (429, timeout, 503, ECONNRESET, exit 75/124): `retry-transient --max 3 -- CMD` (co-work build T6). Anything else fails at once and goes to the done-when loop / escalation, never a silent retry.

---
name: Awesome skill import gate
description: >-
  Use when skimming awesome-mcp-servers, awesome-agent-skills, anthropics/skills,
  or mcp servers reference — cluster gaps only; never 1:1 clone into workflows.
---
# Awesome skill / MCP import gate

**Owner:** Researcher · Big Boss assigns narrow installs
**Sources:** punkpeye/awesome-mcp-servers · VoltAgent/awesome-agent-skills · anthropics/skills · modelcontextprotocol/servers

## Done bar
Write `SKILL_DELTA.md` with (a) already covered (b) ≤12 clustered real gaps (c) NO-SKILL quarantine.
Then research-signal-to-skills for **clusters only** — one skill per cluster, not per repo.

## Steps
1. Fetch READMEs (categories, not every bullet).
2. Diff against live connectors (`GetMcpServerStatus`) + `/home/box/agent-data/workflows`.
3. Map each interesting category → COVERED / GAP / NO-SKILL.
4. For each GAP: one proposed slug + owner_desk + PROVE / WORKAROUND / BLOCKED.
5. Create or enrich only the GAP skills operator/Big Boss greenlit.
6. Never mint agents or icp_id from a list.

## Prefer our stack
Grok + Cursor + connected MCP (Gmail, Calendar, Drive, GitHub, Higgsfield, Canva, Playwright, Hostinger, …). Remap Claude-desktop demos → Cursor. Remap cloud STT catalogs → whisper-caption-gap on box.

## Never
- Full clone of awesome into grok-skills
- Install every MCP in a category
- Security/pentest, NSFW, spam-farm, voice-SDR SKU, Telegram-as-product from lists

## TNNT Top 10 repos 2026-08-29 (`yt:TWCSvvTfJNU`) watch-page PROVE
AI-readable condensed plugin index beats scrolling a marketing site — same gate as this skill + SIGNAL_INDEX.
- Plugins = runnable code. Treat like installing a Mac app. Security-scan then review. Never 1:1 clone.
- `anthropics/claude-plugins-community` public read later; **install BLOCKED** without this gate. Claude Cowork **BLOCKED**.
- MoneyPrinterTurbo → **Remotion** hive path (**WORKAROUND**). Comfy / video-farm **BLOCKED**.
- Per-repo **NO-SKILL** for hive runtime: Omarchy · OpenLogi · Securo · FreeLLMAPI (hosts flagged ToS risk) · Codex CLI as hive default (stay Cursor + Grok).
- Apache Maka incubating — watch only, too early.

## Simon 37 2026-08-30 (`yt:RDeofKimDxo`) watch-page PROVE
Talk named Stop Slop, Caveman, ccusage. Star counts UNVERIFIED. Do **not** install from the video. Same gate as TNNT: cluster, COVERED/GAP/NO-SKILL, then maybe one skill. Simple-English / anti-slop already covered by hive-smarter-loop + bmad-slop + improve-system-writeback. Claude frontend-design skill BLOCKED.

## EXTRACT-BATCH-1 2026-09-01 — DeepSeek harness (`yt:f51ICIoHcjY`) FULL

**When:** operator pastes an awesome-plugin list, DeepSeek/Cordis harness, or “install this random GitHub plugin.”
**Anti-triggers:** do not migrate the hive off Grok+Cursor; do not 1:1 clone DeepSeek harness; Mac-local install only if asked.

FACT from `transcripts/f51ICIoHcjY/full.txt`:
- Everything is a plugin, including agent-loop plumbing (not just MCP/skills/CLI tack-ons).
- Developer-preview plugins get **full shell + full filesystem** — same class as OpenClaw-era untrusted code.
- **PTC mode** batches tool calls into one script to cut sequential context bloat (hive analog: a named script in the skill, not 20 hops).
- Creator-mode plugins are **session-ephemeral** until you explicitly save.
- Trajectory view + session JSON zip is the debug artifact.
- Speaker close: do **not** leave Claude Code/Codex for this today; tool-agnostic tinker only. Star counts UNVERIFIED.

Hive: daily desk stays Grok Bot + Cursor Cloud. Optional local tinker → [local-private-agent-lab](sand-workflow:local-private-agent-lab). Pair [tool-permission-not-prompt](sand-workflow:tool-permission-not-prompt).

**Import gate add**
```
Plugin/repo:
COVERED / GAP / NO-SKILL
Full shell or whole-FS? If yes: read source, then ASK. Never 1:1 clone.
Do not swap hive OS to DeepSeek/Cordis.
PTC analog: put deterministic multi-tool work in a script the skill names.
```

### Tools
| Need | Path |
|---|---|
| Plugin README / source | GitHub WebFetch — **PROVE** |
| Hive skills/hooks | workflows disk — **PROVE** |
| Random harness plugin install | **BLOCKED** — would work if operator asked for a Mac lab + source review |
| DeepSeek/Cordis as daily OS | **BLOCKED** — Grok+Cursor **WORKAROUND** |
| Trajectory/session JSON | ACTION_LOG.jsonl + topic file — **WORKAROUND** |

## Propose rows — deep repass 2026-09-03 (do NOT install)
| Repo | Cluster | COVERED/GAP/NO-SKILL | Path |
|---|---|---|---|
| CopilotKit/OpenBot | open coworker harness / AG-UI | GAP (process steal only) | RESEARCH-OK propose; BLOCKED as hive face |
| milind-soni/OpenMausBot | open Grok-like + VM | GAP (UX/permission broker) | RESEARCH-OK propose; BLOCKED as hive face |
| ifixai-ai/iFixAI | agent audit five pillars | GAP (eval) | RESEARCH-OK propose; Cursor scaffold OK after yes |
| pixeltable/pixeltable | multimodal catalog | GAP (media backend) | RESEARCH-OK propose; Cloud key spend Tier-3 |
Operator must greenlight before clone/pip/uvx. Prefer enrich agent-harness-loops / golden-test-loop / bot-fleet-auditor over new desks.
Packet: `/workspace/research/packets/x-bookmarks/20260903-live/repass/TOOLS_REPOS.md`

## TNNT Top 10 repos 2026-09-05 (`yt:AWzzmrCPe-A`) metadata only
Title names Archify, Omarchi, OpenMAIC (+ more). **No L2 this fire.** Same gate as `yt:TWCSvvTfJNU`: cluster → COVERED/GAP/NO-SKILL → operator/Big Boss greenlight before install. Do not 1:1 clone from the title list. Pair sibling tape `yt:MaTkyO-8hZ0` (AI seller + agent phone + OpenClaw 2.0) — seller SKU park (building mode); OpenClaw commentary = ops awareness only, not a second hive face.

## HN Social 2026-09-07 (Ask HN skills files)
Source: https://news.ycombinator.com/item?id=49589914 (178 pts, ~162 comments) — packet `web-intel-social-20260907`.

**When:** browsing skills.sh / celebrity packs / “manage my skills library.”
**Anti-triggers:** do not bulk-sync public skill malls into workflows.

FACT themes from thread (comment text, not hive policy):
- Many practitioners call **downloaded** skills snake oil; useful ones are **team/repo macros**, often reactive after a miss.
- Strong camp: put project specifics in **AGENTS.md / README**; skills only for reusable NL→small-tool adapters.
- Counter: skills still encode *unknowable blanks* (keys, house rules) models cannot invent.
- Working management: **git SoT + symlink across harnesses**; some run **evals** like integration tests; biweekly drift PRs vs docs.

**Import gate add**
```
Public skill pack hit:
COVERED / GAP / NO-SKILL
Is it a repo/team macro or a celebrity download? Prefer repo-local.
If catalog-management pain → you over-collected (token-meter). Cluster ≤1 GAP skill, else NO-SKILL.
Eval? If no prove path, NO-SKILL.
```

## LIVE enrich 2026-09-07 (metadata only)
- Simon Høiberg — Omarchy Agentic OS (`yt:JjjecbwrioA`): title-only. Per-repo **NO-SKILL** for Omarchy as hive runtime stands (TNNT row). L2 only if operator wants a process steal; do not install Omarchy.
- VictoryCat — Super Agent Party Mac/Windows setup (`yt:LuhU45wBTl0`): treat as awesome-list style install — gate first; not hive face.
- Instantly — Grok vs Fable 5 same-business (`yt:rrIIlN306UI`): Fable desktop **BLOCKED**; Grok+Cursor **WORKAROUND**. $ / "raw results" **UNVERIFIED**.

## Blender (2026-09-08 signal)
Astra/Blender MCP demos = **BLOCKED install** until operator asks. Catalog/research OK; do not append Blender to signal-repo-install-queue as GREEN.

## YT daily stamp 2026-09-08
Metadata only (no L2). Title ids:
- Fireship — 5 open source tools that replaced my $320/mo AI stack (`yt:Y5rSSvXfL4g`)
Also: HubMesh 3 harness repos (`yt:RPz0SZ63pUU`) route here for any clone/pip — process steal lives on agent-harness-loops.
**PROVE:** title triage on disk. **WORKAROUND:** gate → COVERED/GAP/NO-SKILL → operator greenlight before install. **BLOCKED:** bulk install from title list. $320/mo stack claim **UNVERIFIED**.

## YT daily stamp 2026-09-09
Metadata only (no L2). Title ids:
- Silent Snow — ComfyUI Official MCP vs Higgsfield (`yt:cNaOJg47Z2A`)
- Paul J Lipsky — ChatGPT Images 2.5 (`yt:Q7SiipUCjro`)
**Steal:** ComfyUI Official MCP = **RESEARCH-OK** study only; Comfy as hive face **BLOCKED**; Higgsfield / Remotion **WORKAROUND**; no auto-install. ChatGPT Images 2.5 = image-tool watch only — no new desk. **PROVE:** title triage on disk. **WORKAROUND:** gate → COVERED/GAP/NO-SKILL → operator greenlight before install. **BLOCKED:** bulk install / Comfy face / new Images desk.

## TNNT Top 10 repos 2026-09-09 (`yt:AWzzmrCPe-A`) L2 gate (delta vs TWCSvvTfJNU)
Packet: `/workspace/research/youtube-daily/repass-20260909/AWzzmrCPe-A/` · CAPTION_GAP noted; chapters+description+on-screen cards PROVE agenda. Prior 2026-09-05 metadata-only stamp superseded for A–E.
Featured: archify · gods-eye-view · OpenMAIC · go-modern-guidelines · openclaude · scientific-agent-skills · minimind · open-seo · omarchy · timesfm (+ audience memory/ingest/radiant).
**Same gate:** COVERED/GAP/NO-SKILL; never 1:1. Omarchy/OpenClaude **BLOCKED** hive face. gods-eye-view/OpenMAIC **NO-SKILL** default. Memory repos → OH pointer WORKAROUND. timesfm → investment-decision pointer only.
Artifact: `recreation/import-gate-checklist.json`.

## Enrich wave-H 2026-09-09 — OpenBot X `2095510707299287175` (marker: wave-H-20260909-openbot)
Packet: `/workspace/research/youtube-daily/repass-20260909/2095510707299287175/`
Slash `/outreach` + draft-not-send stills PROVE. CopilotKit/OpenBot remains RESEARCH-OK propose / BLOCKED as hive face.

## ChatGPT Images 2.5 L2 2026-09-09 (`yt:Q7SiipUCjro` L2) PARTIAL
Packet `/workspace/research/youtube-daily/repass-20260909/Q7SiipUCjro/` supersedes metadata-only stamp.
**Steal:** access badge → sketch-layout → batch markup → distrust busy BG-remove → templates as drafts. **NO-SKILL** new Images desk. ChatGPT live on box **BLOCKED**; Canva/Higgsfield/Remotion stills **WORKAROUND**. Artifact: `recreation/IMAGES25_EDIT_CHECKLIST.md`.

## Enrich wave-P 2026-09-09 — Omarchy + Super Agent Party L2 (marker: wave-P-20260909-omarchy-sap)
Packets: `repass-20260909/JjjecbwrioA/`, `repass-20260909/LuhU45wBTl0/` supersede 2026-09-07 metadata-only stamps.
- Omarchy: **NO-SKILL** hive runtime confirmed; steal OpsLayer-style HITL harness only → `agent-harness-loops` / `approval-based-autopilot`. Artifact: `recreation/OMARCHY_AGENTIC_OS_GATE.md`.
- Super Agent Party: **NO-SKILL** hive face; leisure/SillyTavern quarantine; mouse/keyboard = ASK+opsec. **CAPTION_GAP** (whisper windows). Artifact: `recreation/SUPER_AGENT_PARTY_IMPORT_GATE.md`.
**BLOCKED:** install Omarchy/SAP/OpenClaw from these tapes without operator ASK.

## Wave T addendum 2026-09-09 (`yt:rrIIlN306UI`)
Instantly Grok vs Fable bake-off — use `recreation/BUILDER_BAKEOFF_GATE.md` scorecard. Fable install **BLOCKED**; Instantly auto-send **BLOCKED**; host $ **UNVERIFIED**. Packet `…/rrIIlN306UI/`.

## Provenance delta — wave Z `f51ICIoHcjY` (2026-09-09)
- Apply import-gate to harness-self-edit plugins (secret surface / rollback) before any DeepSeek-Harness-style install. Live face **BLOCKED**.

## Wave AA enrich 2026-09-09 — skill maturity + token hygiene
- `yt:-u_igSQHAIo`: 7-level maturity (folder→golden slim→import/improve→personalize→eval→feedback→workforce). Marketplace 1000-line dumps → rewrite or NO-SKILL. Claude/Skool **BLOCKED/NO-SKILL**. Packet `…/-u_igSQHAIo/` · `recreation/SKILL_MATURITY_7LEVEL_GATE.md`.
- `yt:49V-5Ock8LU`: token hacks reinforce lean CLAUDE.md / constitution + MCP disconnect before import bloat. Packet `…/49V-5Ock8LU/`.

## Repass 20260909 wave AC — Model-drop watch
- Model/platform drops (Grok 4.6, DeepSeek V4, Gemini Flash, Grok Bot) → watch log only; CapEx only if desk job needs; no chase (VWDnptnvFrA).


## CapEx tracks (Documented / Demonstrated / Transferred) — DoD 2026-09-09

Capability tracks for this skill. **Do not** treat `checklist.json` presence, YT stamp enrich, or skill-file touch as PASS.

| Track | Bar | Counterexample |
|---|---|---|
| **Documented** | Gate doctrine + COVERED/GAP/NO-SKILL recipe + labels so another desk can attempt a row | Inventory touch; stamp-only metadata |
| **Demonstrated** | Executable **fail-closed** run: ≥1 REJECT of Skool/affiliate/NO-SKILL bait **and** ≥1 ACCEPT of a lean hive-shaped stub, with logged output on disk | `import-gate-checklist.json` alone; enrich-only SKILL.md; markdown gate without runner output |
| **Transferred** | **Another desk** runs the same gate binary/script on a **different candidate set** (new repos/packs, not the CapEx fixtures) and lands REJECT+ACCEPT logs under a new out/ path | Re-running the CapEx fixtures; enrich-only; copying STATUS prose |

### Hard rules
- **checklist-only ≠ Demonstrated.** Packets under `repass-20260909/*/recreation/import-gate-checklist.json` stay **Documented** until a runner produces accept/reject output.
- **enrich-only ≠ Transferred.** Touching this SKILL.md or stamping YT daily does **not** move Transferred.
- Fail-closed default: missing `prove_path` / owner / cluster → REJECT.

### Certified Demonstrated — 2026-09-09
CapEx demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/import-gate/`
- Runner: `gate.py`
- Fixtures: `fixtures/bad-skool-affiliate.json`, `fixtures/bad-omarchy-noskill.json`, `fixtures/good-hive-stub.json`
- Proof: `out/gate_run.json` + `out/gate_run.log` (REJECT bait ×2, ACCEPT lean stub ×1)
- Packets reused: `AWzzmrCPe-A`, `-u_igSQHAIo`, `LuhU45wBTl0`, `Y5rSSvXfL4g`

### Transferred — OPEN
Requires another desk run on a **different** candidate set (not CapEx fixtures). Until that returns fresh REJECT+ACCEPT logs, **Transferred = unchecked**.

### Done-when (E / Transferred)
```
Done when (Demonstrated): gate.py (or successor) exit 0 with ≥1 REJECT + ≥1 ACCEPT and out/*.log on disk.
Done when (Transferred): different desk + different candidate JSON set → new out/ with same contract.
Enrich-only / checklist-only / re-fixture replay ≠ Transferred.
```


## WL800 title-only enrich 2026-09-17

`yt:cyIWQHYoUg8` — Github Top Trending Tool Just Fixed The AI Agent’s Biggest Problem (AI LABS)

**Title steal:** trending GitHub “fixed agents” → **RESEARCH-OK** candidate only. Run this gate before any clone. Builder-no-rent: prefer owned stack over new SaaS face.

| Item | Label |
|---|---|
| Title as taste signal | FACT |
| Repo identity / stars / $ saved | **UNVERIFIED** (title-only) |
| Auto-install from video CTA | **BLOCKED** until gate + operator |
| Pair | [free-for-dev-vendor-cuts](sand-workflow:free-for-dev-vendor-cuts) |

Packet: `packets/signal-miss-backfill-20260917/watch-later/`

## X bookmarks 20260918-1338 — RESEARCH-OK jev-ultrafast

Packet: `/workspace/research/packets/x-bookmarks/20260918-1338/` · x:2100411068426469552

**FACT:** Bookmark surfaces `https://github.com/browser-use/jev-ultrafast`.
**Label:** **RESEARCH-OK** candidate only — run this gate before any clone. Builder no-rent: prefer owned Grok/Cursor + existing browser MCP over a second browser-agent face.

| Item | Label |
|---|---|
| Repo URL as bookmark signal | **FACT** |
| Stars / speed / $ claims | **UNVERIFIED** |
| Auto-install this fire | **BLOCKED** |
| Pair | [cheap-read-expensive-decide](sand-workflow:cheap-read-expensive-decide) |


## Claude Code mods 2026-10-02 (`x:2105721434807083061`) desktop live + blog PROVE

Packet: `/workspace/research/packets/x-bookmarks/20261002-0950-desktop/` · signals-close `packets/signals-close-20261002-0950/`.
Source tweet: @ClaudeDevs · WebFetch: https://claude.dev/blog/getting-started-with-claude-code-mods/ (Addy Osmani, Oct 1 2026).

**When:** bookmark/demo names Claude Code **mods** / `/plugin` marketplace / `register(on)` hook modules.
**Anti-triggers:** do not install Claude Desktop or Claude Code as hive face; do not bulk-sync claude.ai/directory mods into workflows.

| Item | Label |
|---|---|
| Tweet + live bookmark id | **FACT** (desktop CDP head) |
| Mods = plugins with JS/TS `register(on)` middleware hooks (≥2.1.287) | **FACT** (blog) |
| Observe / rewrite / answer engine events; UI in CLI + Desktop Code tab | **FACT-as-stated** |
| Stars / adoption / $ | **UNVERIFIED** |
| Claude Desktop / Claude Code as daily hive OS | **BLOCKED** (hard keep-out) |
| Study + selective import | **RESEARCH-OK** — this gate before any clone |
| Process steal | **WORKAROUND** → Cursor skills / Grok workflows + [tool-permission-not-prompt](sand-workflow:tool-permission-not-prompt) |

**Import gate add**
```
Claude Code mod / /plugin hit:
COVERED / GAP / NO-SKILL
Full session hooks + machine perms? If yes: read source, then ASK.
Do not swap hive face to Claude Desktop/Code.
Hive analog: named skill + verifier ≠ in-process mod mall.
```

Platform: **Grok Bot + Cursor**. Install: **none (process-only)** this fire. No QUEUE (no github.com/owner/name on the tweet card).

## Claude Code "You should Know" plugin 2026-10-05 (`x:2106118517447876618`) desktop live PROVE

Packet: `/workspace/research/packets/x-bookmarks/20261005-1000-desktop/` · signals-close `packets/signals-close-20261005-1000/`.
Source: @ClaudeDevs · `/plugin enable cc-plugin-you-should-know@builtin` — scans Claude output for important info you might miss.

**When:** bookmark/demo names Claude Code **builtin plugins** that audit/surface missed model output (`you-should-know` class).
**Anti-triggers:** do not install Claude Desktop/Code as hive face; do not enable Anthropic builtin plugins inside Grok.

| Item | Label |
|---|---|
| Tweet + live bookmark id | **FACT** (desktop CDP head 20261005-1000) |
| Plugin scans output for missed important info | **FACT-as-stated** (tweet card) |
| Enable via `/plugin enable …@builtin` | **FACT-as-stated** |
| Adoption / quality / $ | **UNVERIFIED** |
| Claude Desktop / Claude Code as hive OS | **BLOCKED** (hard keep-out) |
| Study pattern | **RESEARCH-OK** — this gate before any clone |
| Process steal | **WORKAROUND** → Cursor+Grok: verify-then-done + tool-permission-not-prompt + explicit "surface missed claims" checklist in skill close (not an in-process Claude plugin) |

**Import gate add**
```
Claude builtin plugin / you-should-know hit:
COVERED by verify-then-done + claim surfacing? → NO-SKILL duplicate.
GAP only if we lack a missed-output checklist in the active skill.
Do not swap hive face to Claude Desktop/Code.
```

Platform: **Grok Bot + Cursor**. Install: **none (process-only)**. No QUEUE (no github.com/owner/name on card).

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Gated candidate queue (static gate run 2026-10-10).** All 43 repos from the bookmark review went through shallow clone → licence / SKILL.md frontmatter / npm lifecycle hooks / risky-pattern grep → delete. Results are in packet `repos/*.json` and `REPOS_TESTED.md`. Nothing was installed. Sources: x:2092609257338200469, x:2094079187904610504.
- **Skill finder.** A skill that maps a described task to catalogued skills (x:2046321772585504911). Our equivalent is a grep over the workflows folder; don't import the "Find Skills" package unless it passes the gate.
- **gitingest one-shot repo digest** (x:2091773482543775962). Running `python3 -m venv /tmp/gi && /tmp/gi/bin/pip install gitingest && /tmp/gi/bin/gitingest <repo-url> -o digest.txt` produces a single tree-plus-files text an agent can read before deciding to import, without cloning into the workspace. PROVE: packet recreations/gitingest.proof.json (grokbot-field-notes digest). Delete the venv afterwards.

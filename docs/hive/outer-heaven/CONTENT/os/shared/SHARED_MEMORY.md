# SHARED_MEMORY — durable facts for any agent (no secrets). Updated 2026-10-10 22:30 ET (rev 2).
Companions: `FLEET_STATUS.md` (desks now), `LEARNINGS.md` (signal lessons), `JARVIS_CONTEXT.md` (short pack).
Sources: standing locks, operating/federation mandates, Trust Rebuild, packets through 2026-10-10. Volatile status lives in CURRENT_STATE.md, not here.

## Evens (operator)
- Evens Louis is the founder and **visionary**. He owns goals, taste and consequential approvals; the system owns decomposition, routing, retries and verification. Reduce "Evens Tax": don't make him chase agents or repeat corrections.
- Time zone America/Toronto (ET). Report times in ET.
- Bilingual: English and French (some Codex sessions run in French). Reply in the language he writes in.
- Wants real working systems, not architecture documents. "Working" means usable in real life, not tests passing.
- Dislikes drift and over-asking. Interrupt him only when something is ready, relevant to the active goal, and consequential.
- Preferences seen in sessions:
  - prebuilt, checksum-verified installs over long source builds
  - Jarvis speaks aloud only when he uses the mic; text prompts get text
- GitHub: `snevemoney`. Main repo: `snevemoney/n8n-cursor` (public). Site: evenslouis.ca (reports under /reports).
- Legacy he abandoned: Squarespace / elou.space. Never raise them.

## The fleet (platforms)
| Platform | Native role |
|---|---|
| Grok Bot desks (17) | Workforce on the shared Linux box. Grok-first. |
| Cursor (IDE + cloud agents) | Main code executor for hive-os/Jarvis PRs. Cloud agents work in isolated branches and draft PRs. |
| Claude Code (Mac) | Interactive builder. Also runs scheduled routines on `philanthropic-ai-agent`: VPS health, phase tracker, code review, drift. |
| Codex (Mac app/CLI) | Long Jarvis repair campaigns referenced from ChatGPT chats, using isolated checkpoint refs and auto-review approval subagents. |
| ChatGPT | Auditor/supervisor and planner ("Analyse idée Jarvis", "Engineering Control System"). Hands execution to Cursor/Codex. |
| Jarvis | Evens's user-facing assistant. Face on Mac `127.0.0.1:4018`; code in `n8n-cursor/apps/agent-stack` (Face, brain, Watch, hands, voice); talk via OpenRouter. Not production-proven. |
| Jev | Fast, cheap bounded-judgment model: REFLEX / ROUTER / GUARD / SCORER. Advisory only; never authorizes. |
| n8n | Workflow automation. The notify webhook is intentional legacy. |

## Memory and places
- **Outer Heaven** = the durable memory/wiki (Obsidian vault). Grok mirror: `~/.grokbot/outer-heaven/` with `CONTENT/topics/` (SSOT topics) and `CONTENT/job-cards/` (one per desk). Obsidian projection is first-class. Continuity is currently unhealthy, so detect and report it.
- Research packets: `/workspace/research/packets/<name>-YYYYMMDD/` on the shared box.
- Three layers: raw (immutable) → distilled (cited) → tiny active (CURRENT_STATE/HANDOFF).
- The Mac and the box are separate machines with separate installs (Claude, Codex, MCP configs). Do not assume sync.

## Operating frame
- **Mode:** building (no selling). Stage 5 harness default. Tier-3 HITL for money, send, deploy, secrets and destructive Git.
- **Trust Rebuild (2026-09-25):** system status UNPROVEN. Three domains: EXECUTION TRUTH · MISSION CONTINUITY · CONTROL/OWNERSHIP. No new control-plane architecture; fix existing paths.
- **Roles:** Big Boss routes, Forge builds, Watchdog verifies, Researcher consumes/studies, Librarian keeps continuity.
- **Businesses (CapEx proof only, no sell):**
  - A1 websites, modernize, AI-into-software
  - A2 owned dashboards
  - A3 faceless/Remotion motion
  - A4 interactive lead-magnet tool
- **164 Saylor COURSE-SKILLs** = shared graduated firm knowledge. Use what is relevant; never dump the catalog. Exams are paused.
- **Builder no-rent:** own the capability (self-host, open source). No default ads or premium SaaS.
- **Token meter:** at most 3 concurrent streams; no fan-out unless Evens asks.
- **Model routing:** frontier models for hard work, cheap ones for review/test/CI.

## Engineering facts (durable until superseded)
- **BUS300** = the Jarvis talk / Face client-delivery slice (hive-os lane). Key history:
  - OpenRouter key inheritance proven.
  - Turns 3882–3884 MODEL_TALK live (10-02).
  - Turn 3878 delivery race patched in draft PR 518.
  - Ambiguity: "BUS300/208" is also a CapEx gate code in OPERATOR_MEMORY. Confirm with Evens.
- **ChatGPT's critical path after BUS300:**
  1. Talk commit
  2. Face evidence identity
  3. Mission Runner
  4. continuity
  5. Watch/computer/browser
  6. Memory
  7. Jev
  8. repair loop
  9. federation
  10. Authority Ledger/#371
  11. L5/Golden/RC
- **Quarantine and legacy:** #371 is quarantined. PR 149 merge is Tier-3. Scorpion/OpenClaw/Telegram are legacy.
- **Learning-engine:** `learning-engine/` lives in n8n-cursor (draft PR 591). It holds one research-packet format plus an evaluation harness.
- **VPS 69.62.66.78:** hosts Philanthropy (:3002), OpenClaw (:18789), n8n and the site. **Correction (rev 2):** the host itself is reachable. Watchdog hive smoke 2026-10-08 08:30 ET saw disk 91%, n8n healthz ok and the site HTTP 200, but :3002 and :18789 DOWN (HOLD, no restart). The Claude health routines that report "unreachable since 08-29" are probing from outside; read their result as "services down", not "host down". Owned-tools rollout targets this VPS.
- **Owned-tools order:** Healthchecks → Beszel → restic, then the rest.
- **Box limits:** ~126 GB disk (observed 94% used, 8.0 GB free at 2026-10-10 22:20 ET); 15 GB RAM. The box IP gets YouTube 429s/bot-checks, and X bookmarks hit a 403 spend cap.
- **Route-traffic exception:** on 2026-10-07 ~21:20 ET Evens granted a standing **egress-only** exception to "route traffic through this computer" (resolves the conflict with the 08-27 local-machine lock). Source: `packets/hive-smarter-loop-20261009/RECEIPT.md`.
- **Skill catalog:** 464 skill dirs in `/home/box/agent-data/workflows/`. All 464 were copied to the Mac at 2026-10-10 22:02 ET (`/workspace/grok-skills-20261010.tgz`); 0 changed since. The Mac has no user-made skills (only Codex `.system` built-ins).
- **Desk transcripts:** box desk stores are a snapshot restored 10-07 whose last message is Sep 17. For Sep 25+ desk activity, use packets, `~/.grokbot/outer-heaven/ACTION_LOG.jsonl` and `~/.grokbot/os-audit.jsonl`.

## Lessons (corrections that must not be repeated)
- `wires.openrouter: live` is not a working conversation. The talk wall is a catch, not a root cause.
- Builder prose, green CI, or a merged PR never equals PASS. Watchdog grades against a contract.
- Don't hand-roll API calls when a connector breaks. Get it re-authed.
- Don't run three platforms on the same live surface. Pick one owner.
- Scheduled routines that re-report the same failure forever are noise. Escalate once, then pause or fix.
- Secrets have leaked into repo config and chat sessions before. Scan before writing.
- When one packet has two summaries, cite the newest timestamped section (signals-2mo FULL_VERIFIED: 163 first pass → 287 continuation, 10-10 19:45 ET).
- Green CI is not safety: PR591 R13 passed CI but Watchdog found a concurrent-rebuild data-loss race and a fail-open guard (FAIL, 10-08).
- A desk claim without a file (Disk Saver "~19 GB free") counts as unbacked. Report the observed `df` only.

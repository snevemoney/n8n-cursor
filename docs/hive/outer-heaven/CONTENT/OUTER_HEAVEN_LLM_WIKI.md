---
source: Librarian
date: 2026-08-12
status: active
priority: P1
signal: Anthropic Obsidian brain / Karpathy LLM Wiki pattern (bookmark INFERENCE — structure from existing hive only)
---

# Outer Heaven LLM Wiki

**Purpose:** Agent-readable index — who does what, which docs/THEMES to load. Not a new tool. Denser graph on existing vault/cache.
**Load:** After `outer-heaven-brief.py --agent "<you>"`, open this wiki when routing work or before a lane pack.
**SSOT surfaces:** cache `~/.grokbot/outer-heaven/` · vault `00_Outer_Heaven/` · git `docs/hive/outer-heaven/`

Label: **FACT** = existing hive files · **OPINION** = routing hints

---

## How to use (every agent)

1. Run shared brief (always).
2. Find yourself in **§ Core 17** below → load listed docs.
3. Match job to **§ THEMES** + **§ CONTENT packs**.
4. Promote durable facts to OPERATOR_MEMORY via Librarian — do not invent bookmarks or vault pages.

---

## Memory plane (FACT)

| Surface | Path | Role |
|---------|------|------|
| Brief | `scripts/hive/os/outer-heaven-brief.py` | First action every routine |
| Cache | `~/.grokbot/outer-heaven/` | Capture SSOT |
| Vault | `My_Billion_Dollar_Vault/00_Outer_Heaven/` | Obsidian graph (mirrored) |
| Git | `n8n-cursor/docs/hive/outer-heaven/` | Repo fallback |
| Shared | `~/.grokbot/shared-context.json` | Brief hash after capture |
| VPS | `/root/outer-heaven-mirror/` | `--source vps` when Mac asleep |

**Not for Grok:** Scorpion `/api/hive/obsidian/*`

Contract: [[CONTENT/agent-outer-heaven-load-contract]] · Plane: [[CONTENT/shared-memory-plane]]

---

## Always-on docs (FACT)

| Doc | Why |
|-----|-----|
| [[OPERATOR_MEMORY]] | Decisions, lessons, CONTENT pointers |
| [[OUTER_HEAVEN_LIBRARY]] | Library philosophy + systems map |
| [[NORTH_STAR]] | Four north stars |
| [[SURVIVAL_CONTRACT]] | ≥20 hrs/week business |
| [[HIVEMIND_DNA]] | Operator personality / execute+verify |
| [[AGENT_CHEAT_SHEET]] | 17-agent lane table |
| This wiki | Agent → job → docs/THEMES |

---

## Core 17 — agent → job → docs / THEMES (FACT + OPINION routing)

| Agent | Job | Primary docs | THEMES | CONTENT packs |
|-------|-----|--------------|--------|---------------|
| **Big Boss** | Morning brief, delegate, one Tier-3 max | OM, NORTH_STAR, NOTIFICATION_MATRIX | hive-mind | shared-memory-plane |
| **Day Planner** | Calendar + day plan (Gmail/Cal plugins) | OM personal lane | — | — |
| **Watchdog** | Control plane, smokes, n8n health | OM ops lessons, n8n maps | scorpion-ops, n8n-ops | n8n-learning/*, agent-playbooks |
| **HITL Operator** | Tier 3 gate (money/send/deploy/secrets) | OM Tier-3, AUTOPILOT_CONTRACT | client-engine-money | — |
| **Money Desk** | Business finance read-only | OM money, WEEKLY_SCOREBOARD | client-engine-money | — |
| **Lead Hunter** | Pipeline + warm drafts (HITL mutates) | OM acquire | client-engine-money | n8n one-pagers/lead-hunter |
| **Product GTM** | Phase rotation, offer suppress until ready | OM north stars, PROJECTS | hive-mind | nate-herk, related-youtubers |
| **Researcher** | JIT dossiers, packets | RESEARCH.md, load contract | hive-mind, unclassified | x-bookmarks/ai-only, research-packets/* |
| **Forge** | CI, Cursor/cloud agents, ship previews | PIV skills, website-building | n8n-ops, hive-mind | website-building/*, cinematic/* |
| **Creative Studio** | THEMES assets, motion, taste packs | THEMES/*, cinematic brand/motion | after-effects, creative-personal | website-building/cinematic |
| **Consultant** | Four-blank scope, audits | AI_PARTNER_PLAYBOOK | hive-mind | nate-herk, related-youtubers |
| **Librarian** | Capture, OM, chronicle, vault mirror | This wiki, CHRONICLE, load contract | hive-mind | all CONTENT (promote) |
| **Wealth Manager** | Portfolio advise | OM finance | — | — |
| **Personal CFO** | Runway + subscriptions | OM personal | — | — |
| **Career Strategist** | Accomplishments + market | OM career | — | — |
| **Communications Manager** | Gmail triage (no client send) | GROKBOT_PLUGINS | — | n8n kit comms |
| **Publishing Engine** | Distribution + Report Creator → `/reports/<slug>` | OM Report Creator decision | creative-personal | agent-skills-index |

Extended roster (wave1–3 specialists): [[AGENT_ROSTER]] — activate only when operator scopes.

---

## THEMES hubs (FACT)

Cursor-chat topic clusters (not PROJECTS). Maintained by `link-cursor-chats.py`.

| Hub | Use for | Typical agents |
|-----|---------|----------------|
| [[THEMES/hive-mind]] | Orchestration, agents, OpenClaw/Telegram | Big Boss, Librarian, Researcher, Forge |
| [[THEMES/n8n-ops]] | Workflows, webhooks, automation | Watchdog, Forge, Librarian |
| [[THEMES/scorpion-ops]] | Smokes, golden paths | Watchdog |
| [[THEMES/client-engine-money]] | /pro, leads, deals | Lead Hunter, Money Desk, HITL |
| [[THEMES/creative-personal]] | Non-hive creative | Creative Studio, Publishing |
| [[THEMES/after-effects]] | Motion / video | Creative Studio |
| [[THEMES/gaming-mac]] | Games / Unity | (roster Game Studio) |
| [[THEMES/unclassified]] | Pending review | Librarian / operator |

Graph guide: [[CURSOR_CHATS/GRAPH_GUIDE]] (if present)

---

## CONTENT packs (FACT)

| Pack | Path | Who |
|------|------|-----|
| Load contract | [[CONTENT/agent-outer-heaven-load-contract]] | All |
| Shared Memory Plane | [[CONTENT/shared-memory-plane]] | All |
| Skills index | [[CONTENT/agent-skills-index]] | All |
| n8n learning + playbooks | [[CONTENT/n8n-learning/INDEX]] | Watchdog, Forge, owners |
| X bookmarks AI-only (34) | [[CONTENT/x-bookmarks/ai-only]] | Researcher, Product GTM, Forge |
| Website building | [[CONTENT/website-building/INDEX]] | Forge, Creative Studio |
| Cinematic landing | [[CONTENT/website-building/cinematic/INDEX]] | Forge, Creative Studio |
| YouTube interest | [[CONTENT/operator-youtube-dossier]] | Consultant, GTM |
| Nate Herk / agency | [[CONTENT/nate-herk-dossier]] | Consultant, Money Desk |
| Related YouTubers | [[CONTENT/related-youtubers/INDEX]] | Researcher, Consultant |

---

## Active craft missions (snapshot)

| Mission | Status | Owners | Canon |
|---------|--------|--------|-------|
| Cinematic AI Partner landing | DoD PASS local · PR #37 · Vercel deferred | Forge, Creative Studio | [[CONTENT/website-building/cinematic/INDEX]] |
| X bookmarks → memory | AI-only working set live | Researcher, Librarian | [[CONTENT/x-bookmarks/INDEX]] |
| Obsidian vault mirror | Librarian routine weekdays | Librarian | `mirror-cache-to-vault.sh` |

---

## Delegation cheat (OPINION)

| If the ask is… | Message |
|----------------|---------|
| Memory / vault / chronicle / wiki | Librarian |
| Research packet / JIT learn | Researcher |
| Code / PR / preview | Forge |
| Taste / motion / assets | Creative Studio |
| Audit / four-blank / offer | Consultant |
| Health / n8n fail / smoke | Watchdog |
| Money / send / deploy approve | HITL Operator |
| Morning rollup | Big Boss |
| HTML report → `/reports/<slug>` | Publishing Engine |

---

## Anti-patterns

- Dumping raw chats into every agent context
- Inventing THEMES/bookmarks not in vault
- Using Scorpion HTTP as Grok memory host
- Treating full X bookmarks (98) as working set (use AI-only 34)
- Public publish / main merge without Tier 3

---

## Maintenance

Librarian updates this wiki when agents, THEMES, or CONTENT packs change. Researcher may propose denser edges from packets; Librarian canonizes.

## Client Engine → Grok (method only)

Keep CE **axioms/gates**; do **not** run daily money path in CE UI.

| Doc | Path |
|-----|------|
| CE-without-CE money path | [[METHODS/business-ce-without-ce-money-path]] |
| CE feature inventory → agents | SoT ``~/.grokbot/research-packets/ai-partner-scoring-prototype-ladder/CE-FEATURE-TO-AGENTS.md`` (CONTENT = pointer) |
| Flywheel (condensed) | SoT ``~/.grokbot/research-packets/ai-partner-scoring-prototype-ladder/CE-FLYWHEEL-TO-AGENTS.md`` · METHOD [[METHODS/business-ce-flywheel-to-agents]] |
| Scoring / ladder pack | [[CONTENT/ai-partner-scoring-prototype-ladder/INDEX]] |

**Rule:** read-only CE study · no CE API mutate · `/pro` only for formal Tier-3 ledger buttons.

## One ladder playbook

[[METHODS/ai-partner-one-ladder-playbook]] — halves: GTM SKU · Consultant position · Money Desk economics · scoring pack.

## Business kits

[[CONTENT/business-kits/INDEX]] — 10 AI Partner kits; working cheats `~/.grokbot/cheat-sheets/`.

## Surface posture

Telegram / OpenClaw = **LEGACY** (2026-08-12) — Grok-first daily face; same fallback posture as n8n.

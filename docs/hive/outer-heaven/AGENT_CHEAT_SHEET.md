# Grok Bot agent cheat sheet — EVENS AI OS

**17 core agents** · Regenerate routines: `python3 scripts/hive/build-grok-agent-routines.py --write`

## First action (every agent, every routine)

```bash
python3 scripts/hive/os/outer-heaven-brief.py --agent "<Your Name>"
# Mac asleep / cloud cron:
python3 scripts/hive/os/outer-heaven-brief.py --agent "<Your Name>" --source vps
```

Shared memory: `~/.grokbot/shared-context.json` · Cache: `~/.grokbot/outer-heaven/`  
**Job cards (owns / never):** `CONTENT/job-cards/` — injected by `outer-heaven-brief.py`  
**Not for Grok:** Scorpion `/api/hive/obsidian/*`

## Agent → lane

| Agent | Lane | Job |
|-------|------|-----|
| Big Boss | command | Morning brief, delegate |
| Day Planner | personal | Calendar + day plan |
| Watchdog | ops | Control plane heartbeat |
| HITL Operator | approvals | Tier 3 digest |
| Money Desk | business | Business finance read-only |
| Lead Hunter | revenue | Pipeline + warm drafts |
| Product GTM | gtm | Phase rotation |
| Researcher | research | JIT dossiers |
| Forge | engineering | CI + Cursor loop |
| Creative Studio | creative | THEMES + assets |
| Consultant | audit | Four-blank scope |
| Librarian | memory | Capture + OPERATOR_MEMORY |
| Wealth Manager | finance | Portfolio advise |
| Personal CFO | personal | Runway + subscriptions |
| Career Strategist | career | Accomplishments + market |
| Communications Manager | comms | Gmail triage |
| Publishing Engine | content | Distribution + **Report Creator** (HTML → evenslouis.ca/reports/<slug>) |

## Key scripts

| Script | When |
|--------|------|
| `product-state.py --can-act "<agent>" <project>` | Every routine gate (`operator`, `proofcheck`, `clipengine`) |
| `outer-heaven-brief.py` | Shared institutional memory |
| `run-capture-cycle.sh` | Librarian daily capture |
| `grokbot-verify-agents.sh` | Watchdog weekly smoke |

## Tier 3 (operator only)

Money · client send · prod deploy · secrets · delete data


## Money path (CE legacy → Grok)

- Method: `METHODS/business-ce-without-ce-money-path.md` — run CE stages via agents; `/pro` only for formal Tier-3 buttons.

## Ops posture (2026-08-12)

**Telegram / OpenClaw = LEGACY** — not daily ops. Grok-first. Same fallback posture as n8n.

## Quota compact (2026-08-13)

Knowledge lives in **OM + this cheat sheet + `outer-heaven-brief.py`** — not long chats. Fresh chats; no 17-agent “summarize thread” fan-out.

- **Routines:** one digest + one morning brief (dupes paused).
- **Gmail:** snevemoney12@gmail.com over quota (~297%/15GB) — free space/Google One before inbox ops.
- **VPS disk:** ~93–94% — report only; prune only with operator OK.
- **Work portfolio SoT:** [client-engine PR #16](https://github.com/snevemoney/client-engine/pull/16) (await merge + prod apply). No site redesign.
- **n8n:** 177 / 69 active / 108 inactive — pagination bug, not missing. Fallback kit only; never n8ncloud.
- **Overnight:** monitor/prep only. Telegram G1 soft-fail ≠ morning urgency.

## MONEY MIX (2026-08-13)

Cinematic client sites = hive product (audit→site→optional retainer). Operator is **not** the website salesperson this cycle (introvert / home / high-leverage). Prefer leveraged seats: sell OS/workflow to operators with existing demand — not dropship/Amazon-as-seller by default.

## Ecom CUT (2026-08-13)

Sell **one ops loop** to people who already have Amazon/dropship demand. Packet: `research-packets/ecom-ops-cut-20260813/`. Not “open a store.” Complements MONEY MIX.

## Hive = multi-business OS (2026-08-13)

Employees across lanes: AI Partner/websites, **his** Amazon store, dropship later, future businesses. GTM HOLD = don’t take *other* ecom sellers as clients. Amazon Individual this week is sequencing, not monopoly.

## Amazon own-store (2026-08-13)

His Amazon.ca Individual lane: packet `research-packets/ecom-ops-cut-20260813/` (checklist + filters + day-1 offer *directions*). Match existing ASIN. No spend until live. HOLD = other ecom clients. Website lane stays on.

## X bookmarks (2026-08-13)

Library **98**. Working set **42** (true-read). Packet FINDINGS.md. **Don’t** quote bookmark $ or copy Etsy/postcard/jailbreak/watermark. **Do** load your job card from `CONTENT/job-cards/` (brief injects owns/never). Don’t overwrite dossier.md.

## Rest-of-bookmarks don’ts (2026-08-13)

Bookmark ≠ endorsement. Don’t SKU fighting-games / dating / sleep-channels / Spotify-reupload. Don’t copy travel-wallet, burner-phone, watermark-bypass. Quarantine: Ripple $1 course, $20k station, Anthropic-fired drama, NSFW LoRA. AE AKIRA + paper mockup = look-only. Amazon remainder = no product signal.

## Skills catalog + Cursor chats (2026-08-19)

**246** live slugs (`grok-skills/` 238 + `~/.grokbot/skills/`; union 246). Newest: `cursor-chat-sessions`, `internal-host-os`. Aug 17: `specialist-handoff-group-chat`, `org-before-skills`, `six-boring-skills`, `sell-outcome-not-agent-template`, `named-team-not-swarm`. METHODS/ = 8. Pick by job card — do not dump.

Cursor chats SSOT: `~/.cursor/projects/*/agent-transcripts/` · CLI `cursor-chat-sessions.py list/read` · exports `~/.grokbot/outer-heaven/CURSOR_CHATS`. Last sitting: 01a6b95f. Do not commit JSONL / publish chats. First action still `outer-heaven-brief.py`.

## Tape-walk skills (2026-08-19)

87 unfolded, installed, **UNVERIFIED**. No METHODS until a desk runs one. Tape $ UNVERIFIED. Librarian: `capture-cycle-hot` · `provenance-gate` · `six-p-packet` · `program-md-lint` · `session-review-lint` · `end-of-day-dictation-bank`.

## Watch Later L2 P1 don’ts (2026-08-19)

No second Grok desktop / GenSpark / phone-harness. No voice-SDR SKU (Brendan = talk-track). No Cole second-brain install. No fake testimonials. No “loop engineering” product. Quarantine: IG-leads `qhCvVyq3GLQ`, hacking `pB4LyTcMaMY`, OFM `XvMN3nSv2u4`. Tape $ UNVERIFIED. No new `icp_id`.

## Watch Later L2 P0 don’ts (2026-08-19)

No DeepSeek Harness / full-FS preview plugins. No Hostinger MCP deploy-from-chat. No School auto-like or saved logins. No Composio/ClickUp/GoHighLevel. No second chief. No Ultra/100-agent swarm. No Pi/OpenClaw/local 27B. No buildpartner.ai. Steal: grill-me, delegate-first, shared vs private memory, PTC batch, thin rules, assets/+4-pack+10s scroll-scrub, improve-system writes the lesson back. $ / stars / 10x / raise UNVERIFIED. No new `icp_id`.

## Daily YT + L2 don’ts (2026-08-20/21)

No Eden / ComfyUI / Higgsfield second desktop. No Telegram/BotFather productize, DoorDash/browser-order, Clay/cold-email send, DM automations. UdeM graduation ≠ ProofCheck. House-vs-invest was a day (Personal CFO). Tape $ UNVERIFIED. No new `icp_id`. Steal = source-updates only (session-bootstrap, wiki-ingest, cinematic-recipe MCP, phone-to-routine).

## Vault Path B (2026-08-21)

First sync proven. Lid shut → `root@69.62.66.78:/root/My_Billion_Dollar_Vault` (`00_Outer_Heaven` inside). Mac awake → live folder. Not `/root/outer-heaven-mirror` as the vault.

## Vault map (2026-08-21)

After brief, load `CONTENT/VAULT_MAP.md`. Lid shut → `root@69.62.66.78:/root/My_Billion_Dollar_Vault`. Do not dump chats/wiki/chronicle. 17 agents. ProofCheck = Path C this week.

## Skills SSOT (2026-08-21)

Repo `scripts/hive/grok-skills/*.md` = **325** masters. The 237 canvas is an Aug 17 snapshot. Do not count the 8 grokbot money-spine orphans. Index “246” is stale. Pick by job card.

## Remotion (2026-08-21)

Animate / video / composition / captions / map route / coded walkthrough → Remotion plugin. Not a SKU. Higgsfield in, Remotion out. Higgsfield-as-desktop still a DON’T.

## Weekend 2026-08-22–24

Start research from `CONTENT/SIGNAL_INDEX.md`. Skill close required. Viral ≠ truth. No owned-skill on Claude desktop / Comfy / Eden / Vapi / DeepSeek without prove-or-gap. Higgsfield MCP re-auth if expired. Dormant only: hub_game + ofm-creator-ops (farms still NO-SKILL).

## Web Hunter 2026-08-24

Amazon.ca: no 2026 referral/FBA fee increase. Individual $1.49/item. Own the harness (not the model). Next Hunter: Social.

## Weekly intel 2026-08-24

Own the harness (papers + HN). Don’t blame the model first. Amazon Individual ≠ ads. Duplicate Monday dossier routines = no-op after first close. Next Hunter: Social.

## Daily YT 2026-08-24

9 enrich (JARVIS/Brock/Nate). No Claude desktop / Key.ai / Vapi. $10K / 70% cheaper UNVERIFIED. Interview scroll + keyframe QA. Draft-only fleet HITL.

## MetalForge / remocn (2026-08-24)

MetalForge (metalforge.xyz) ≠ remocn. Free browse OK. Pro EUR5/mo export = Tier 3. remocn = MIT Remotion components.

## Own motion (2026-08-24)

Operator rejected MetalForge Pro. Use `own-motion-kit` + `/workspace/own-motion-lib` (51). MetalForge = inspiration only. Never pay Pro or scrape Code tab.

## Signals 2026-08-26

Share-a-Bot = config only, not logins. Beta egress via member computer. SuperGrok + Cursor Pro + weekly reset. Hosted Remotion MCP sunset ≥ Aug 31 — official skills. Templates/Chrome-import not shipped. 17 Bots ≠ isolation.

## Daily YT 2026-08-26

WL 1877 (100 rendered). Tim login = box HITL handoff, never bypass. Brock Memory → OH topics. Nate DoHPZf7jEQ4 CAPTION_GAP. Same desktop don’ts.

## hive-smarter-loop (2026-08-26)

Session start + after steal. Write `CONTENT/topics/` mid-fact. Verifier ≠ builder. Login = box handoff. 17 Bots share one computer.

- **Daily YT 2026-08-29:** Sat history 0 / Fri 57. Don'ts: no Claude /loop /design / plugins / Cowork; no Happly auto-submit; no MoneyPrinter; no lights-off factory; no Outbid clone. CloudAgent + Remotion. $ UNVERIFIED. No new icp.

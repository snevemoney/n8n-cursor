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

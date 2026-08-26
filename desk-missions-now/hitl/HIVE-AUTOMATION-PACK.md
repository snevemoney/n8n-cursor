---
tags: [os, factory, hitl, automation, pack]
at: 2026-08-25
desk: hitl-operator
machine: dark-factory
status: unsent · Watchdog GRADE editor opened · Cloud web = none · not claimed Active
send: removed
clock: parked
---

# Hive automation pack (six named jobs)

**Why this exists:** last-weeks machine. **Not** Cole 24/7 · **not** default-17 daemons.

**HOST = git.** Doctrine: `desk-missions-now/CLOUD-HOST.md`. A Cloud run is a cold `origin/main` checkout + GitHub persist. It does not inherit Mac chats, untracked drafts, or the nested dry-run leftover. **SSOT:** repo-root `desk-missions-now/`. One tree. Forever.

**WAKE:** Cursor Automations (new Cloud Agent per run). **Channel:** none. Slack is not a channel.  
**Leftover (unused):** “Summarize changes daily” (was Slack) · Inactive “Untitled”. Do not hijack.  
**Default five:** Forge · Watchdog · HITL Operator · Researcher · Communications Manager.  
**Memories SSOT:** `hitl/memories.md` (Always-true) + `hitl/memories/{desk}.md`.  
**Board:** `hitl/GOAL-GAP-BOARD.md`.  
**Context store:** `hitl/briefs/INDEX.md` + one brief. Grow that. Do not dump JSONL.

**Actuate order:** files on `main` → then Automation. Never the reverse. This pack is those files.

Yellow (unrelated, continue): `grokbot_orphans` = **8**. Do not restore.

```
WAKE: cadence
HOST: Cursor Automations (new Cloud Agent per run — not a chat loop) · checkout = origin/main
SCHEDULE: daily (staggered hours below)
RUN-NOW: no until Evens Saves AND this pack is on origin/main
INTERVAL: daily
CRON-EXCEPTION: only if Evens types one
```

---

## Pack table

| Name | Trigger | Tools / MCP allow-list | Tools / MCP deny | Web | Memories | Paste on disk |
|------|---------|------------------------|------------------|-----|----------|---------------|
| **Hive daily TRAIN** | Daily `0 9 * * *` | **GitHub** (file write / draft PR) · repo checkout · `signal-retrieve.py` only if present **and** theme matches | Slack · Gmail send · Stripe · Hostinger · GitHub PR comment / request-reviewers · `cursor-ide-browser` · Playwright · `browser-use` | **none** | `memories.md` + `memories/forge.md` | `pastes/01-hive-daily-train.md` |
| **Watchdog GRADE sitting** | Daily `0 10 * * *` | **GitHub** (write GRADE / hold-outs only) · `separate-verifier.md` | Slack · Gmail send · Stripe · Hostinger · PR comment · edit Forge files · any browser | **none** | `memories.md` + `memories/watchdog.md` | `pastes/02-watchdog-grade.md` |
| **Researcher next-row pick** | Daily `0 8 * * *` | **GitHub** (write `NEXT-TRAIN-PICK.md`) · retrieve-on-match if script exists | Slack · ledger flip · 1803 walk · Gmail send · Stripe · Hostinger · PR comment · `cursor-ide-browser` · Playwright · `browser-use` | **none** | `memories.md` + `memories/researcher.md` | `pastes/03-researcher-next-row.md` |
| **Goal/gap board refresh** | Daily `0 18 * * *` | **GitHub** (write `GOAL-GAP-BOARD.md` only) | Slack · GRADE · TRAIN · Gmail send · Stripe · Hostinger · PR comment · any browser | **none** | `memories.md` + `memories/hitl-operator.md` | `pastes/04-goal-gap-board.md` |
| **Factory-OS Grok reader reminder** | Daily `0 11 * * *` | **GitHub** (write `FACTORY-OS-NEXT.md`) · read tracked `grok-chat-sessions` / `cursor-chat-sessions` as sibling shape | Slack · implement reader on Cloud · copy `/workspace` · Gmail send · Stripe · Hostinger · mint · any browser | **none** | `memories.md` + `memories/forge.md` | `pastes/05-factory-os-reminder.md` |
| **HITL Operator inbox** | Daily `0 17 * * *` | **GitHub** (write `INBOX.md` only) | Slack · execute Save/copy/pay · Gmail send · Stripe · Hostinger · PR comment · any browser | **none** | `memories.md` + `memories/hitl-operator.md` | `pastes/06-hitl-inbox.md` |

**Whole-instance deny (every job):** Slack tool / Slack notify · Stripe / pay · Hostinger deploy · Gmail send · Vercel publish · n8n-as-host · Trigger.dev · Cole L4–5 · unsupervised `/goal` · default-17 · invent TRAIN slugs.

**GitHub connection:** attach on every job so the Cloud Agent can write files / open a draft PR. Do **not** attach Slack, Gmail send, Stripe, Hostinger, or GitHub PR comment / request-reviewers.

**cursor-ide-browser / browser-use:** none of these six is a click-live sitting. Tools that only exist on the laptop stay off Cloud.

---

## Draft tables (plain language — Evens Saves)

### 1. Hive daily TRAIN

| Draft field | What will open in the editor |
|-------------|------------------------------|
| Name / description | Hive daily TRAIN — one SIGNAL-TRAIN stage per day. Default five. No Slack. Never send/pay/deploy/book/publish. |
| Trigger | Every day at 09:00 (`0 9 * * *`) |
| Tools | GitHub (file write / draft PR). Web ≠ `browser-use`. No Slack. No PR comment. No pay. |
| Instructions | One stage: pick / hold-outs / Forge attempt / WAITING. Never GRADE here. Next named id: `X80ljdCPM_U` · Watchdog hold-outs first. |
| Resolved settings | Repo `snevemoney/n8n-cursor` · branch `main` · Memories on |
| To finish in editor | Paste Memories from `memories.md` + `memories/forge.md`. Confirm hour. **Re-paste the prompt after this pack is on `main`.** Save is Evens. |

### 2. Watchdog GRADE sitting

| Draft field | What will open in the editor |
|-------------|------------------------------|
| Name / description | Watchdog GRADE sitting — separate verify. Hold-outs backup or independent GRADE. No Slack. |
| Trigger | Every day at 10:00 (`0 10 * * *`) |
| Tools | GitHub. No Slack. No PR comment. |
| Instructions | One legal move: write hold-outs OR GRADE a waiting row this run did not author OR NO-WAITING. Never hold-out `factory-os-train-plane`. |
| Resolved settings | Same repo/branch · Memories on |
| To finish in editor | New Automation + paste `pastes/02-watchdog-grade.md`. Memories: watchdog note. |

### 3. Researcher next-row pick

| Draft field | What will open in the editor |
|-------------|------------------------------|
| Name / description | Researcher next-row pick — one TRAIN-eligible id. Not an 1803 walk. |
| Trigger | Every day at 08:00 (`0 8 * * *`) |
| Tools | GitHub (write `NEXT-TRAIN-PICK.md`). Persist = GitHub only. No Slack. |
| Instructions | Write NEXT-TRAIN-PICK.md. Real packet id or TRIAGE. No invented slug. |
| Resolved settings | Same repo/branch · Memories on |
| To finish in editor | Save GitHub-only. Do not attach `browser-use`. |

### 4. Goal/gap board refresh

| Draft field | What will open in the editor |
|-------------|------------------------------|
| Name / description | Goal/gap board refresh — end-of-day OBSERVED. Not a second TRAIN. |
| Trigger | Every day at 18:00 (`0 18 * * *`) |
| Tools | GitHub write `GOAL-GAP-BOARD.md` only. |
| Instructions | Update GOAL-GAP-BOARD.md Last OBSERVED only. |
| Resolved settings | Same repo/branch · Memories on |
| To finish in editor | New Automation + paste `pastes/04-goal-gap-board.md`. |

### 5. Factory-OS Grok reader reminder

| Draft field | What will open in the editor |
|-------------|------------------------------|
| Name / description | Factory-OS Grok reader reminder — draft-only. Cloud cannot see Grok chats. |
| Trigger | Every day at 11:00 (`0 11 * * *`) |
| Tools | GitHub write `FACTORY-OS-NEXT.md`. No Slack. No deploy. |
| Instructions | Write FACTORY-OS-NEXT.md reminder. Do not implement the CLI. |
| Resolved settings | Same repo/branch · Memories on |
| To finish in editor | New Automation + paste `pastes/05-factory-os-reminder.md`. |

### 6. HITL Operator inbox

| Draft field | What will open in the editor |
|-------------|------------------------------|
| Name / description | HITL Operator inbox — what Evens must Save / name / copy. Never auto hard-step. |
| Trigger | Every day at 17:00 (`0 17 * * *`) |
| Tools | GitHub write `INBOX.md` only. |
| Instructions | Write INBOX.md cards. Do not click Save. |
| Resolved settings | Same repo/branch · Memories on |
| To finish in editor | New Automation + paste `pastes/06-hitl-inbox.md`. |

---

## Editor vs New Automation (this sitting)

| Job | Agent does | Evens does |
|-----|------------|------------|
| Hive daily TRAIN | **Not opened again.** Two Inactive rows already on Mine. Do not create a third TRAIN. | Use the newer TRAIN row. |
| Watchdog GRADE sitting | **Opened now** — GitHub (`mcp.server.name: github`) · Memories on · `snevemoney/n8n-cursor` `main` · cron `0 10 * * *` · Web = none · no Slack · no browser-use. Glass holds **one** draft. | **Save this Watchdog.** Then say **next** for the remaining four. |
| Researcher / Goal-gap / Factory-OS reminder / HITL inbox | Ready on disk (`pastes/03`–`06`). Not opened — one editor at a time. | After Watchdog Save, say next. |
| Slack daily / Untitled | Left unused | Do not hijack |

`open_automation` cannot create, enable, or list. Mine **Tools** icons ≠ repo checkout.

---

## Checkable-stop (pack)

```
DONE-CHECK: six named pastes + memories + board + CLOUD-HOST lock + real NEXT-TRAIN-PICK on the SSOT path
CAP: 6 jobs · not 17 · no /loop
COST: this sitting (drafts). Each Active run = one Cloud Agent (Evens).
STOP-KIND: metric + cap
```

```
ALLOW: this pack · memories · six pastes · CLOUD-HOST doctrine
DENY: Slack attach · Untitled activate · Cole 24/7 · default-17 · send / pay / deploy / book / publish · mint · merge PR 47
TERRITORY: desk-missions-now/ (repo root only)
BYPASS: none
```

---

## HITL create card

```
id: hive-automation-pack-create
KIND: merge Cloud-host fix · then Save/re-paste jobs
ACTION: Merge the fix PR to main. Close / leave 47 unmerged. Do not Activate all six unless you ask.
WHY: Cloud only sees origin/main. MCP has no create/enable. Slack is not a channel.
AGENT: Evens.
RISK: Slack attach · six daemons mistaken for Cole 24/7 · merging 47 into a fake-id loop
REVERSIBILITY: High while unmerged. After Active = disable in Automations UI (Evens).
EVENS: leftover
```

**Send-removed.** Create ≠ send.

[[CLOUD-HOST]] · [[memories]] · [[GOAL-GAP-BOARD]] · [[HIVE-DAILY-AUTOMATION]] · [[SIGNAL-TRAIN-LOOP]]

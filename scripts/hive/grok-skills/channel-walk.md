---
name: channel-walk
description: >-
  Channel catalog + walk queue: list public uploads, ingest ONE
  uningested tape (PACKET+full.txt), then STOP so the parent can
  spawn 17. Use when the operator says channel-walk, walk @nateherk,
  Nate Herk channel, or drops a channel handle. Sequence, not dump.
  Cursor plus Grok Bot. No Grok Bot HTTP.
---

# Channel walk

**Stack:** Cursor + Grok Bot. Workflow = funnel. One tape per iteration.

**First channel:** `@nateherk`  
**Catalog:** `docs/hive/outer-heaven/CONTENT/watch-later/channels/nate-herk/`  
**Cursor copy:** `.cursor/skills/channel-walk/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/channel-walk/SKILL.md`

Coverage-loop takes a **model row** or a **tape**. A **channel handle** or “new YouTube URL / channel” starts **here**, then coverage-loop after the packet exists.

## When

Operator says **channel-walk** · **walk @nateherk** · **Nate Herk channel** · a channel handle plus this goal.

## Funnel

**In:** a channel handle (first: `@nateherk`). Evens may paste one or two video URLs to override the next pick.

**Stages:**

1. **Catalog** — public Videos tab via yt-dlp / hive youtube tools. No cookies. No members-only. Write `INDEX.md` + `CATALOG.json`. Do not invent rows. Refresh only if Evens asks or the catalog is missing.
2. **Pick next** — first `ingested: no` row (most recent public upload). Evens can override. Default batch = **1 tape** (or **2** if Evens pastes two URLs).
3. **Ingest** — `PACKET.md` + `full.txt` (+ VTT). Official captions, else auto `en`. Do not invent `full.txt`. If captions fail, leave queued and STOP.
4. **Parent may spawn 17** — `hive-spawn-desks` / `tape-self-teach` with `--video-id`. Study method = `deep-video-learning`: A–K globally, then steal the machine, then L. This skill does not spawn. This skill does not HTTP Grok Bot. Do not re-walk the 82.
5. **Extract** — steal machines vs operate-never, **informed by A–K** (why it works, conditions, exceptions, examples). Not a skim one-liner. Nate $ / student counts = UNVERIFIED. Operate our stack (Cursor + Grok), not his tool list as a shopping cart. Never “understand only, don’t steal.” Never “steal first, skip the transcript.”
6. **Score** — if a BUSINESS-MODEL-FIT row moved, run `coverage-loop` score fields. Clients parked — do not unpark Normand or start a Path A client.
7. **STOP** — checkable: packet on disk + (17 takes filled **or** Evens says skip spawn). Next tape = a **new** iteration.

**Out / hard step:** send, pay, book, publish stay Evens. Teaching videos ≠ auto-upload copies of Nate. Do not republish his scripts as our product.

## Steal vs operate-never

**Steal:** agent loops, n8n *machines*, verification/stop, one workflow that moves a needle.

**Operate-never (this walk):** spawn 17×N in one session · treat Nate $ / student counts as FACT · unpark Normand / start a Path A client · install every n8n template he sells · join Skool/community without Evens · install Claude Cowork / Claude Code / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus · dump every video into takes.

## Related (do not replace)

| Skill | Job |
|-------|-----|
| `coverage-loop` | After one tape is on disk: teach → spawn (parent) → extract → score → wire one → dry-run. Channel input starts here. |
| `deep-video-learning` | How you study the tape. A–K then steal. |
| `multimodal-youtube-learning` | Caption-only: no invented clicks. |
| `capability-acquisition` | After study: six + flags, UNTESTED. Do not clone Nate. |
| `knowledge-architecture` | Atoms + candidates. Not a corpus compile. |
| `tape-self-teach` + `hive-spawn-desks` | Parent only, after PACKET+full.txt. `--video-id`. |
| `steal-usecases` + `steal-sheet` | After A–K + Steal block. No new `icp_id`. |
| `icp-runbook` | Clients parked (Evens skipped 2026-08-14). Do not hunt. |

## Stop

Packet on disk + 17 takes filled **or** Evens says skip spawn. This skill never sends, pays, books, or publishes.

## Never

- Spawn the 17 from this skill (parent does)
- Spawn 17×N in one session
- Caption-dump the whole channel
- New `icp_id`
- Treat Nate $ / student counts as FACT
- Unpark Normand / start a replacement client
- Install his sold n8n templates / join Skool without Evens
- Republish his scripts as our product
- Claude Cowork, Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
- Grok Bot HTTP / `/api/sendPrompt`

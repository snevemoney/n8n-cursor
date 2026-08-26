# Researcher — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Prompt-cache / session-limit 80/20. Beats: (1) Dashboard: one day **91M** cache-read; week **300M** (UNVERIFIED) — automatic on Claude Code. Token dashboard + session-handoff → Skool. (2) Cached input = **10%** of normal; sub TTL **1 hour** idle = uncache; API/sub-agents TTL **5 min** (can pay for 1h). Thoric: they SEV low cache-hit (speed + their cost + limits feel bigger). (3) Layers: global system+tools cached; per-project `CLAUDE.md`/memory; session; growing user turns. Turn 1 = cache create; later turns = cache read + new reply/message. Change system prompt or wait 1h on turn 16 = recache the world. (4) Confusion: weekly-limit overflow → extra usage is API-priced **5 min** TTL; rumor they silently cut sub to 5 min — he says no; web Claude undocumented, he assumes sub-like; docs mix Code vs API. (5) **Three habits (~95%):** don’t pause >1h (handoff to a new session); start fresh on task switch (`/compact` breaks cache, `/clear`, or his **session handoff** — 205k example, <1 min vs slow compact); Claude chat big docs → **project** not paste. (6) Breaks cache: `/model` switch (prefix match); **`/opus plan` (Opus plan / Sonnet exec) recaches every toggle** — he used to teach it as a save; long-run maybe still saves, but know the recache. Mid-session `CLAUDE.md` edit is OK (applies on restart). (7) Dashboard is **local** (laptop ≠ desktop); repo → “set up on localhost”; reads past sessions. 80/20: you don’t need Thoric-depth unless you’re on API heavy. Timestamp UNKNOWN. 91M/300M/10%/95% UNVERIFIED. Claude on-tape.

## B. Atomic Knowledge

### Keep the prefix; handoff instead of dying
- **Claim:** Most session burn is cache miss (idle > TTL, model switch, compact, dumped docs). Stay in-window, one task, project-files not pastes; when you must reset, write a handoff blob and `/clear`.
- **Reasoning:** Prefix match; create is expensive; read is 10%.
- **Mechanism:** 1h sub / 5min API-or-subagent; three habits; don’t `/opus plan` without knowing the recache.
- **Evidence:** Four-turn diagram; 205k handoff; Thoric SEV quote.
- **Conditions:** Claude Code billing. Hive is not on Claude — analog: don’t thrash context; handoff desks.
- **Exceptions:** `/opus plan` may still win overall (he hedges). Web cache unknown.
- **Action:** Steal TTL-awareness + handoff-not-compact + “model switch recaches.” Do not install his dashboard. Do not join Skool.
- **Confidence:** high as Claude-specific ops; numbers UNVERIFIED.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
80/20 over vendor essays. Cache-hit is a joint utility (you + Anthropic). Local dashboard ≠ cloud truth. He retracts a prior “hack” (`/opus plan`) in the same genre.

## D. Procedures
1. One task per session; if idle ≥ TTL, new session + handoff.
2. Don’t paste novels into chat — pin in a project/repo.
3. Don’t switch models mid-thread unless you accept a full recache.
4. Prefer handoff summary over `/compact` if compact is slow.
5. If you track tokens, know the meter is machine-local.
6. Hive: same hygiene in Cursor (don’t dump, don’t idle-and-retry a huge thread).

## E. Examples
- **Situation:** 205k session. **Action:** Session handoff → copy → clear → paste. **Reasoning:** Compact is slow; cache would break anyway on compact. **Outcome:** “Feels like I haven’t lost anything.” **Lesson:** Blob > compact. Implicit rule: he published the same handoff in `kB9iMD0EjT8` for Claude↔Codex.

## F. Decision Rules
- If >1h idle → don’t send one more message into the corpse; handoff.
- If you would `/opus plan` to save tokens → count the recache.
- Refuse: quote 91M/300M as FACT; Skool dashboard as hive; Claude.

## G. Contrarian
The popular save (`/opus plan`) breaks the thing you’re saving. Also vs “treat yourself to more Opus” (`3QclAjmu5Tw`) — this tape is still about not wasting the window. Keep both.

## H. Assumptions
10% and TTLs as he states. Thoric quote accurate. Web = sub is a guess he labels.
**Desk dissent:** none yet.

## I. Questions
- Exact handoff skill fields? (talked/files/decisions/next from `kB9iMD0EjT8`)
- Claude.ai project cache — still undocumented?

## J. Connections
- **SYSTEM SYNTHESIS:** `kB9iMD0EjT8` (handoff). `3QclAjmu5Tw` (limits). `XTBWVVcF3Pk` (effort/routing). `context-docs`.

## K. Future-Use
Handoff-instead-of-compact as unassigned context hygiene.

## Steal / Operate-never

### Machine: stay-in-ttl-or-handoff
- **Epistemic:** SOURCE
- **Workflow / loop:** one task → keep session warm inside TTL → no mid-thread model switch → if reset needed, write handoff → clear → paste → continue
- **Questions / signals:** Idle >1h? About to `/model`? About to paste a book? Compact vs handoff?
- **Qualify / frame / objections:** “Opus plan saves limits” → recache every toggle.
- **Procedure:** D.
- **Example that proves it:** 205k handoff <1 min; four-turn cache diagram; `/opus plan` apology.
- **Why it works:** Reads are cheap; prefix breaks are not.
- **Conditions / exceptions:** Claude TTLs. 91M UNVERIFIED. Hive analog only.
- **Operate-never payload:** Claude dashboard/Skool; quote 91M/300M as FACT; new ICP.
- **Hive run:** `context-docs` · `kB9iMD0EjT8` handoff schema
- **Source:** `6cEQEba0i2A` @ UNKNOWN

**Operate-never**
- Install Claude token dashboard. Join Skool. Quote tape tokens as FACT. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Handoff schema is now on two tapes. Do not stand up his localhost dashboard. Token $ UNVERIFIED.

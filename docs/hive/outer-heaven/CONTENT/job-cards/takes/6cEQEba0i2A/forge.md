# Forge — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Prompt-cache / session-limit tape. Beats: 91M cached tokens that day, 300M+ in a week (UNVERIFIED) — automatic on Claude → cached input = **10%** of fresh → Claude Code TTL **1 hour**; idle >1h un-caches the session; API/sub-agents TTL **5 min** (can pay for 1h) → Thoric/Anthropic SEV on low cache-hit (faster, cheaper serve, limits feel bigger) → layers: global system+tools cached; per-project CLAUDE.md/memory; growing user turns → turn 1 = cache create; later turns = cache read + new tail; **change system prompt or wait 1h = recache everything** (painful at turn 16) → weekly-limit overflow = API 5-min TTL (dangerous) → rumor they silently switched 1h→5m: he says they didn’t → 80/20 habits: don’t pause >1h (handoff to a new session); `/compact` or `/clear` or **session-handoff** when switching tasks; big docs → Projects not chat paste → **model switch recaches** (including Opus-plan→Sonnet-exec — each plan toggle is a fresh cache; may still save long-run) → edit CLAUDE.md mid-session is OK (applies on restart) → local token dashboard GitHub via Skool; session-handoff <1 min vs slow compact (205k token example). Timestamp UNKNOWN. Claude/Skool on-tape.

## B. Atomic Knowledge

### Prefix cache dies on idle, model switch, or system-prompt change
- **Claim:** Stay inside the TTL; don’t `/model` mid-run if you care about the cache; don’t rewrite the system prefix on turn 16.
- **Reasoning:** Prefix match; whole history re-billed.
- **Mechanism:** 1h sub / 5m API & sub-agents.
- **Evidence:** Four-turn graphic + Opus-plan warning.
- **Conditions:** Claude Code / API as he uses them.
- **Exceptions:** CLAUDE.md edit mid-session doesn’t apply until restart (cache safe).
- **Action:** Steal the habits. Do not install Claude or his dashboard. Session-handoff shape we already stole (`kB9iMD0EjT8`).
- **Confidence:** high on the habits; 91M/10%/SEV UNVERIFIED.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

### Handoff > compact when the window is full
- **Claim:** He prefers a 1-minute summary (talked/files/decisions/next) + `/clear` over `/compact`.
- **Reasoning:** Compact is slow; handoff feels lossless.
- **Mechanism:** Skill → copy → clear → paste.
- **Evidence:** 205k token project demo.
- **Conditions:** Same human, new session.
- **Exceptions:** None.
- **Action:** Steal the card. No Skool repo.
- **Confidence:** high.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
80/20 of caching is enough; the deep article is for API people. Cache-hit is a vendor SEV because it saves *them* too. Opus-plan-as-a-hack has a hidden recache tax.

## D. Procedures
1. One task per session. 2. Don’t idle past the TTL. 3. Don’t switch models mid-task if you can avoid it. 4. Big files in a project, not a paste. 5. When switching: write handoff, clear, paste. 6. Don’t recache a 16-turn prefix for a system-prompt tweak — new session.

## E. Examples
**Situation:** 205k-token HTML project.  
**Action:** Session-handoff → clear → paste.  
**Reasoning:** Compact too slow.  
**Outcome:** Feels continuous (claimed).  
**Lesson:** Summary object > hoping the window lives.

## F. Decision Rules
- If idle ≥ TTL → new session + handoff, don’t poke the corpse.
- If you toggle plan-model → expect a cache miss.
- If the CTA is a token dashboard in Skool → park.
- If 91M/300M appears → UNVERIFIED.

## G. Contrarian
Field uses Opus-plan to save limits. He says it recaches every toggle — still maybe worth it long-run, but know the tax.

## H. Assumptions
Web Claude cache undocumented (he admits). Falsifier: 1h TTL that isn’t. We don’t run Claude.

## I. Questions
Does Cursor have an analog TTL we should not cargo-cult? Same handoff skill as `kB9iMD0EjT8`?

## J. Connections
SYSTEM SYNTHESIS: `kB9iMD0EjT8` handoff. `3QclAjmu5Tw` limits. `XTBWVVcF3Pk` effort knobs. No Claude. `session-bootstrap`.

## K. Future-Use
Handoff card when a Cursor thread is too fat.

## Steal / Operate-never

### Machine: one-task session + handoff before the window dies
- **Epistemic:** SOURCE
- **Workflow / loop:** one job → don’t idle/switch-model/rewrite-prefix → when done or fat, write files/decisions/next → new session
- **Questions / signals:** Are we about to `/model`? Has it been an hour?
- **Qualify / frame / objections:** 91M cached is not a trophy.
- **Procedure:** No Claude dashboard. No Skool.
- **Example that proves it:** 205k handoff vs compact; Opus-plan recache tax.
- **Why it works:** A dead prefix is a silent tax. A card is cheap.
- **Conditions / exceptions:** TTLs are Claude’s. Habits transfer.
- **Operate-never payload:** Claude seat; quote 91M/10%/300M as FACT; Skool dashboard.
- **Hive run:** `session-bootstrap` + Cursor threads only.
- **Source:** `6cEQEba0i2A` @ UNKNOWN

### Operate-never
- Install Claude to “save tokens.” Quote cache $ as FACT.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add a token dashboard. One job per thread. Handoff when fat. Deploy HITL.

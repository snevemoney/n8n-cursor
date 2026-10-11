---
name: Verify then done
description: >-
  Use before calling any AI build or research task done — prove it the way a
  human would, with a bounded goal and rewind on wrong turns.
---
# Verify, then done

Sources enriched: Nate Claude Code (`yt:vfWTyEreOEc`) — `/goal` needs definition-of-done + time/turn bound; `/rewind` beats arguing with a wrong turn. Berman cleanup (`yt:5CSXUsljJ_E`) — weekly verify-before-delete. Simon Scrapes 19 mistakes `yt:icM0ewXGvAw`; LIVE: Chase concepts `yt:eF20iepBQCU`; Cole AI-native cycle `yt:Tliio-33w4g` (CAPTION_GAP — PIV validate gate).

## When
An agent says a site, workflow, packet, or L2 is finished.

## Do
1. Write DONE_WHEN as a check a human would actually do (click, test, screenshot, claim card on disk).
2. Set a **bound**: time or turn budget. Prefer short goals (lunch/bed), not 24–48h unattended runs.
3. Make the worker run that check. If wrong turn → rewind/restart from last good state; don’t argue the model into a corner.
4. Do not accept “looks good” without the check.
5. Research close: also run [research-signal-to-skills](sand-workflow:research-signal-to-skills) — findings without skill delta are not done.

## Don’t
- Stop at 70% and call it shipped
- Skip mobile/screenshot on UI work
- Unattended `/goal` or cloud routine that messages clients
- Unattended file delete

## Tools
| Need | Path |
|---|---|
| Browser | Playwright / Browser-use / vibe-click-live — **PROVE** |
| GitHub | gh / GitHub MCP — **PROVE** |
| Claude Code verify UI | **BLOCKED** — Playwright on preview URL **WORKAROUND** |

## Prompts
**ASR thicken:** Austin `yt:IiZ5HRaeX4s` — plan-before-build + paste/screenshot errors; Hostinger troubleshoot remap to our Hostinger MCP / HITL.

**Verify done**
```
Claim done:
Success check (URL/cmd): …
Bounds: …
Run check; rewind if fail. Docs ≠ done.
```

**AI-native cycle done gate**
```
Plan issue URL:
PR / preview URL:
Click/mobile/reduced-motion OR test cmd:
Skill delta path if research:
```

**Austin plan-then-build verify (FACT)**
```
Before complex build: interview + written plan (features I actually need).
After build: open the app / site; if error → paste or screenshot into Cursor+Grok and fix.
MVP done-when: I can use it TODAY for [named task], not “looks like a template.”
Deploy check (if public): Hostinger MCP or Hostinger HITL — not Claude Design; Vercel needsAuth = BLOCKED.
```

## Steal thicken — Simon 19 mistakes (`yt:icM0ewXGvAw`) FACT
Remap Claude Code → Cursor cloud agent + Grok. Do **not** install Claude desktop.

1. **Spend prompt words on triad, not persona fluff:** (a) where to look / which folder, (b) definition of done, (c) self-check — Anthropic phrasing: “Before you finish, verify your answer against …” Persona/role lines tested no better (162 personas / ~2500 prompts — FACT from tape citing study).
2. **Verification ladder (Anthropic power-user #1 tip):**
   - L1: same-prompt self-check
   - L2: separate evaluator / done-when recheck each turn ([golden-test-loop](sand-workflow:golden-test-loop))
   - L3: stop/gate script that blocks “done” until check passes (Playwright / test cmd — **PROVE**; Claude stop-hooks product = **BLOCKED**)
   - L4: adversarial review agent — **flag only what affects correctness / stated requirements / DONE_WHEN**; treat rest as optional (else it hunts forever)
3. **Rewind > argue** — selective summarize-up-to-here / restart beats mid-thread rule edits.

**Prompt — triad + verify**
```
Where to look:
Done when (shape of output):
Before you finish, verify against:
Adversarial? Flag only correctness / DONE_WHEN (optional rest).
```

## LIVE enrich 2026-08-24 — Nate ScrollCraft verify (`yt:QUI6Ug4cHnE`) FACT
After premium/scroll site builds:
1. **Keyframe screenshot pass** — scroll hero → mid → CTA; inspect faces, captions, links, live numbers.
2. Fail if motion too fast to read, hero bland (no hook), wrong outbound links, or claims without receipts.
3. Feedback loop: list concrete fails → rebuild → re-screenshot (Nate ~30m first pass then nitpick).
4. Reduced-motion + mobile click still required.
Pair cinematic-site-recipe. Claude Design harness screenshot judge = **WORKAROUND** Playwright / box browser on preview URL.

## Implement 2026-08-26
You are the verifier node, separate from the builder. hive-smarter-loop.

## Matrix 2026-08-26
Verifier is a different node than the builder. hive-smarter-loop step 6.


## WL26-100 remaining L2 2026-08-27 — holdouts + review branch (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

- Cole `yt:eecUhBpTz_g`: holdout suite is a **different session** from the builder. Builder unit/integration tests OK; holdouts stay blind.
- Codesistency `yt:p80OV6kjIO8`: CodeRabbit-class review on a **feature branch** after the operator already clicked the app. Screenshot-vs-design loop until close enough, then human nitpick.

## Tim hang + BMAD slop 2026-08-28
- `yt:ezANo2RNryU` FACT: a running computer view is not done. Bound + check. Hanging tasks fail the gate.
- `yt:6XgSpFdD3EU` FACT creator description (ASR CAPTION_GAP): slop is comments out of sync + no refactor of agent code. Verifier must catch drift, not only "it compiled." Do not install BMAD-METHOD.

## Jason + Awesome 2026-08-29
- `yt:_9OT25ZvrWs` CAPTION_GAP + secondary: **generator ≠ verifier**. Spawn a separate read-only verifier with the spec. Writer does not grade its own homework.
- `yt:23dY7YDgXDI` watch-page PROVE: **green tests ≠ maintainable**. Agents add junk abstractions. Understandable / extendable is the bar, not "it compiled."
- Hang / lights-off still fails this gate (thickens Tim hang 08-28). A busy computer view is not done. Bound + check.
- Budget + hard stop required. Open "make it better" loop = slop machine.
- $ burn anecdotes (Uber-style) stay **UNVERIFIED**. Do not install Claude `/loop` as the verifier.

## Simon 37 2026-08-30 (`yt:RDeofKimDxo`) watch-page PROVE
Rewind to last good, then retry. Do not "fix" a broken webpage/output in-place. Rewind does not restore files you deleted in bash — use git. Pair ZERO-LOSS (never rm -rf).


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.


## Repass delta — video-training 20260909 Wave I
- yt:6XgSpFdD3EU: DONE_WHEN must catch comment/code drift and refactor lag ("slop"), not only green tests. Human-on-loop gate.

## Wave-M repass 2026-09-09 (`yt:vfWTyEreOEc`)
EN VTT now on disk (was page-recovery). Packet: `/workspace/research/youtube-daily/repass-20260909/vfWTyEreOEc/`. Claude Code install still **BLOCKED**; hive remap unchanged.


## Cole writer≠approver 2026-09-09 (`yt:UbylWXukvR8`) delta PARTIAL
- Never let the writer approve the work — verifier is a different node (pairs hive-smarter-loop).
- Over-revise is a defect: when DONE_WHEN check passes, stop.
- Deterministic "run tests before done" belongs in a named hook/script, not a hope-rule.

## Enrich 2026-09-23 — yt:Vok_nReMFaU
Packet: `/workspace/research/youtube-daily/l2-20260923/Vok_nReMFaU/`

**FACT:** Green tests only prove what the AI thought to test — not that the screen/flow exists. Pair DONE_WHEN with `/check verify` (real drive) and a separate reviewer model. Cross-ref `jsm-ae-check` + Watchdog critic lock.

## Enrich 2026-10-10: evidence pack per agent change (`yt:bs1qPy_CWkM` IBM)
Before you call an agent change done, attach answers to: what changed · why · what could break · downstream impact · objective met (tested). PROVE: `evidence_pack.py` builds this from git + a test command.

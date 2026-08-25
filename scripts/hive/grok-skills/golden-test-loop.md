---
name: golden-test-loop
description: >-
  Compare a fixture to last-known-good before calling a path green.
  Watchdog owns this machine. Do not live-POST webhooks.
---

# Golden test loop

**Owner:** Watchdog. **SSOT name:** `hive-golden-path-smoke` (JSON path). Not `hive-smoke-notify`.

## When
After a deploy/change, or when docs and fixture disagree. Pick one recurring check and run it until known-good.

## Steps
1. Load `CONTENT/job-cards/takes/watchdog.md` then this skill.
2. Parse the on-disk fixture: `workflows/hive/golden-path-smoke-notify.json`.
3. Compare path / responseMode / register URL / code nodes to the one-pager. Docs follow JSON.
4. Run a local check (`should-run`, `product-state --validate`, or `json.loads` on the fixture). Do not POST the live webhook.
5. Report pass/fail vs last-known-good. Preview host ≠ custom domain.
6. **Separate-verifier** (Watchdog fills GRADE — Forge must not):

```
BUILDER: Forge
VERIFIER: Watchdog
HYPOTHESIS: fixture matches last-known-good
LABELED: workflows/hive/golden-path-smoke-notify.json
MISS: <row or none>
GRADE: pass | fail
```

7. **Side-effect-not-essay:** CLAIM + SIDE-EFFECT + DIFF. Chat-refine / OAuth connected is not a ship.

## Stop
Live webhook POST, prod deploy, custom-domain attach, Stripe live = operator.

## Never
- POST `/webhook/hive-golden-path-smoke` or `/webhook/hive-smoke-notify` from this desk
- Call a ship done from a dashboard reload or `*.vercel.app` 200
- Invent a second golden-path name

## Cache-first self-heal (merged 2026-08-16 · `tDGiWn0flK8`)

Caption-only Claude Code tape; loop ported, vendors on-tape only.

- **First output is a hole-finder.** Run 1–2 are allowed to be ugly (white-logo scar: colors passed, the logo was invisible until a second look). A parse-pass is not the grade — eyeball the artifact before `GRADE: pass` when the output is visual.
- **Error → read → patch the tool → update the workflow file.** The fix lands in the tool + SOP, not in chat (a Unicode/emoji fail became a tool patch on tape).
- **Cache what run 1 fetched** so the regen is cheap; durable business facts go to a profile JSON once (`state-json`) so nobody re-tells them.
- Keys HITL. Tape $ ($1.50 / $1.43) UNVERIFIED.

**Merged 2026-08-14:** `eecUhBpTz_g` hold-outs written before the bite; builder must not see the exam. `U6k4MeVks_Y` objective done-when. Claude/Codex operate-never.

## Repeat-signal shard 0 (2026-08-17)
Labeled merges, not new skills. Caption-only. $ UNVERIFIED. Claude/Vapi/n8n-cloud operate-never.

| tape | fragment |
|------|----------|
| `3QclAjmu5Tw` | `retest-the-wall-then-hitl-callback` |
| `8C6iCpJ9HPo` | `no-cta-inbound-then-value-then-number` |
| `AYsg5gAMWyo` | `ready-row-lock-still-poll-hitl-post` |
| `HNKlFTd1maM` | `four-deal-ladder-then-roi-sop` |
| `RzLV8sfFdMM` | `plan-sandwich-prove-evolve` |
| `X80ljdCPM_U` | `eval-then-wrap-tools` |
| `a5sJNwfZ528` | `pin-then-linear-builder` |
| `oWdJMJp2HgM` | `sanitize-in-check-out` |
| `w9-gfaV5vlM` | `diagnose-solve-value-price` |

## Repeat-signal leftover sweep (2026-08-17)
Labeled merges, not new skills. Caption-only. $ UNVERIFIED. Claude/Vapi/n8n-cloud operate-never.

| tape | fragment |
|------|----------|
| `0WDkwMxj13s` | `4c-default-tab` |
| `2J3uX8iRNng` | `same-prompt-bench` |
| `3XIGcM7VICc` | `relative-roi-then-taste-then-vending` |
| `62Rfe1w9NBc` | `glance-idle-then-stop-or-load` |
| `8MEJen0nblQ` | `outcome-story-catalyst-router` |
| `8QQ_INxAhRs` | `4c-router-keys-grill-verify` |
| `AO5aW01DKHo` | `interview-never-rules-wat` |
| `EuzYhzB0vbI` | `reason-act-observe-until-metric-or-cap` |
| `FHsY924cEAk` | `post-publish-moneyball-party` |
| `R0qF17BVl9w` | `file-goal-tournament-then-red-team` |
| `UGIZnh6HNLc` | `write-local-host-cloud-prove-idempotency` |
| `XNQBCRcwXV4` | `a-b-thin-skills-not-sweep` |
| `brB-hSiV2iU` | `wrapper-not-weights` |
| `e18sdZLwP7o` | `pile-to-sub-tune-description-allow-list` |
| `iTY8Q449YNQ` | `roast-verify-handoff-goal` |
| `jZgcWCzxh1I` | `width-vs-depth-ladder` |
| `kOKavHnlPik` | `human-gesture-retriever` |
| `lcNN3X9gXls` | `table-as-control-plane-then-log-and-eval` |
| `lokbsA5VXOk` | `responses-brain-tools-vs-agent-tools` |
| `pbrln2TVeh4` | `roast-then-slice-then-prove` |
| `vFepZE_wrfg` | `plan-interrogate` |
| `xn6Z5PYyAIE` | `reference-log-winner-skill` |
| `zWLZ3bVVwD8` | `file-kb-now-tz-eoc-prod` |
| `13eo8dWa1Gw` | `isolated-workers-follow-one-destination` |
| `ESIxitOLYoQ` | `list-anneal-funnel` |
| `IVx8OSMbTss` | `six-p-sprint-waitlist-aha-charge` |
| `f4mI3d-nTrI` | `stateless-call-named-handle-roundtrip` |
| `kwSVtQ7dziU` | `macro-action-metric-named-workers` |
| `mjg_JUMar04` | `bible-plan-one-job-test` |
| `nS2FrgXN-EY` | `pack-cards-human-mouth-same-day` |
| `2074046218741678570` | `click-live-site` |

---
name: Jev craft gate
description: >-
  Use when Creative Studio needs expert-dense Jev judgments for CapEx craft,
  research/scope/plan, maker↔viewer intent, or the mandatory ≥50 pre-video gate
  after a real frame scrub — criteria from operator teardown, Leo/Commas/Shipper
  denseness, CRAFT_DENSITY, and JEV_PREMIUM_BAR_20260923 — before boards or show.
---

# Jev craft gate (expert criteria + premium denseness)

**SSOT criteria:** `docs/DENSE_RESEARCH_20260922/JEV_EXPERT_CRITERIA.md`  
**Premium bar (2026-09-23):** `docs/DENSE_RESEARCH_20260922/JEV_PREMIUM_BAR_20260923.md`  
**Prompts:** `craft_prompts.py` (`SYSTEM_CRAFT_BAR` prepended) · **Slots:** `slots.py` · **Visual:** `visual_inspect.py` · model `typesafe/jev-1.13`

## Capability truth (do not lie to the operator)
- **Jev does NOT see pixels.** Decisions API is JSON-state only; wire forbids images.
- **Creative Studio / frontier vision SEES frames.** Run `--prepare-visual` (ffmpeg PNGs), Read/scrub frames, fill `VISUAL_LEDGER` (`composition_per_keyframe`, motion-between-frames, hierarchy, cheap/still) from pixels.
- **Only then** run `--pre-video` (≥56 questions). `assert_inspect_ready` blocks Jev if `visual_inspect.complete` is false.

## HARD LOCK — no CapEx video produce until
1. `visual_inspect.complete == true` with real `frame_paths` on disk and pixel-grounded ledger
2. All **`PRE_VIDEO_REQUIRED`** slots answered (56/≥50)
3. `pre_video_ready_noul` = yes (not no/uncertain)

```bash
PYTHONPATH=.../typesafe-jev-hive/src python3 -m typesafe_jev_hive.craft_gate \
  --prepare-visual --ref REF.mp4 [--candidate CUT.mp4] --work-dir ./visual-work

# SEE PNGs → fill ledger → complete=true in state

PYTHONPATH=.../typesafe-jev-hive/src python3 -m typesafe_jev_hive.craft_gate \
  --pre-video --state-file state_with_visual.json --out pre-video-receipt.json
```

## Always load state fields
beat_id, product, job, what_pixels_show, ui_fill_pct_estimate, mean_rgb_estimate, color_world, path_role, material_finish, maker_intent, viewer_payoff, viewer_question, emotion_target, ref_bar, motion_family_declared, anti_patterns_present, operator_feedback_points, enter_frames_est, already_on_disk, second_by_second_motions, density_peak_timestamps, continuity_mechanism, engagement_hooks, cheap_still_risks, transfer_verbs_not_clone, duration_target_s, micros_per_chapter_est, camera_continuity_plan, overlap_layers_active, visual_inspect, frame_paths, beat_jobs, sfx_events

## Slot packs
**PRE_VIDEO_REQUIRED (56):** run via `--pre-video` / `--list-pre-video` — denseness pillars, continuity, motion, engagement, timing, camera, Clearfield locks, invent_kpi=0, transfer-not-clone, visual_inspect_complete, ready_noul.

**AUTO-FAIL / craft:** craft_self_gate · craft_pass_noul · craft_bar_score · craft_color_world_match · craft_ui_macro_fill · craft_material_ladder · craft_one_idea_frame · craft_path_job · craft_pacing_density · craft_cta_commit · craft_soft_mood_fail · craft_invent_kpi_risk · premium_vs_ref_gap · operator_feedback_resolved · craft_motion_family · craft_maker_viewer_aligned · craft_density_overlap · craft_continuity_flow · craft_engagement_pull · craft_minimal_fail

**Research/plan:** research_signal_keep · research_scope_depth · plan_ready_noul · process_next_stage

**INTENT:** intent_maker_notice · intent_why_motion · intent_emotion_sold · viewer_feel · viewer_question_answered · viewer_boredom_risk

## World locks (always)
Clearfield = `ui_glass_scenic` high-key + airy glass · invent_kpi=0 · steal verbs not mint/Leo void · denser@42s not shorter.

Explicit AUTO-FAIL in state → treat as FAIL even if mid confidence.


## Per-frame sequential gate (hard produce lock)
Before CapEx video produce: scrub frames into VISUAL_LEDGER **one entry per frame**, then run:
`craft_gate --per-frame-seq --frame-index N` for N=0..total-1 (same `PER_FRAME_REQUIRED_SLOTS` each time).
No skipping. Unlock with `--check-all-frames-done`. Optional `--pre-video` rollup after.


## Catalog triage pointer 2026-09-24 (`yt:qkCHiEFEZQg`)
When scoring **external** Jev/demo catalogs (not CapEx craft frames): prefer **utility** axis over wow/creativity before prove-one. Full pattern distill lives in `system-one-decision-gate` + packet `l2-20260924/qkCHiEFEZQg/`. Do not treat 562 posts as 562 craft gates.

## X bookmark 20260924-1044 (`x:2102881280115249597` nutlope + `x:2100984487802708306` 0xCodila)
FACT-as-stated: open “train your own Jev-like classifier” posts exist (Together/Tev1-4B-experimental on Qwen3.5 4B cited).
- Atom: local small classifier recreation is EXPERIMENT_REQUIRED under METHOD_PROMOTION_WITHOUT_LOCAL_EVIDENCE — Cap-gated; not ADOPTED from bookmark.
- Prefer enrich match-model-to-task / cheap-read; no new skill mint this fire.
- Label: RESEARCH-OK / WORKAROUND (hive already has local ranker recreation path from YT Cody/Jev demos).

## Remotion + 21st compact pack (2026-09-26)

**SSOT:** `/workspace/research/packets/jev-remotion-21st-20260926/JEV_REMOTION_21ST_BAR.md`  
**Methods ledger (uncapped):** `…/METHODS_LEDGER.md` · `REMOTION_21ST_FULL_METHOD_INDEX`  
**Bar version:** `20260926-remotion21st`

Day-to-day CapEx Remotion / 21st product chrome / showreel chapters — **not** a second brain; still advisory; still no vision.

```bash
PYTHONPATH=/workspace/packages/typesafe-jev-hive/src python3 -m typesafe_jev_hive.craft_gate \
  --list-remotion-21st

# After VISUAL_LEDGER filled:
PYTHONPATH=/workspace/packages/typesafe-jev-hive/src python3 -m typesafe_jev_hive.craft_gate \
  --remotion-21st --state-file STATE.json --out remotion-21st-receipt.json
```

**Pack highlights:** spring settle · easing≠linear · path truth · no phase pop · no sin-wobble glass · transition grammar · 21st real chrome · search-before-invent · glass layering · cursor commit · showreel beat job · jank rank — plus denseness/CTA/invent_kpi/material/UI fill gates.

Keep `--pre-video` for full Clearfield produce lock. Do **not** re-enable spammy per-frame 20×92 by default.



## X bookmarks 20260930-1616-desktop
`x:2105284180242559167` @svpino — confidence-score branching in Jev workflows (Cap HELD). Advisory only; Jev packs not universal second brain. Map confidence gates into existing craft/router checks; do not widen pack surface from tweet alone. Install: **none**.

---
name: Media-gen cost gate
description: >-
  Use before any paid video/image generation (Seedance/Enhancor, Higgsfield,
  Kling, Runway...) — draft-first, approve-by-fingerprint, finish-the-draft-id,
  resume-never-requeue, plus a rights + purpose gate that refuses likeness/IP
  filter evasion. Protects spend and keeps gen jobs consented.
---
# Media-gen cost gate

**Owner:** Forge (runs the gate) · Publishing / Creative Studio (submit intent) · pairs with [motion-pipeline](sand-workflow:motion-pipeline), [effectcraft-headless-motion](sand-workflow:effectcraft-headless-motion).
**Platform:** Grok Bot box (gate is pure Python, no spend) + connectors for the actual gen. **Install:** none — **PROVE** (`paid_gen_gate.py` 9/9, L2 `yt:d6spCMcfkew` 2026-10-11).

## Source (FACT, yt:d6spCMcfkew Sirio "reverse engineered Higgsfield" + repo sirioberati/Genjustsu-Open-Source-Workflow, MIT)
The tape's cost discipline: Seedance makes a cheap 480p **draft tied to a task ID**; iterate drafts, then finish THAT draft in 1080p once — re-uploading the draft file is a new request that loses settings. Repo docs add: webhook required, poll + save request IDs, resume (never auto-requeue a paid job), approval invalid after any artifact change. **The tape's headline chain (depth-mask the identity + isolate vocals + composite to beat the provider's IP/likeness filter on celebrity footage) is filter evasion — this skill REFUSES it; it is not hive procedure.**

## When
- Any job that will spend on generated media (video or image), especially draft→HD flows.
- Wiring a gen connector (Higgsfield `motion_control`/`generate_video`, Enhancor/Seedance, Kling, Runway) into a desk.

## The gate (PROVE) — `paid_gen_gate.py`
1. **preflight** — every input must be `own|licensed|consented`; refuse purpose tags `bypass_ip_block`, `strip_music_to_avoid_detection`, `hide_identity_from_filter`, `pitch_shift_to_evade`; estimate ≤ budget cap.
2. **approve_inputs** — bind approval to a SHA-256 **fingerprint** of the inputs; stale if any input changes.
3. **submit_draft** — cheap draft only; saves `draft_request_id`; a second call **resumes** (never re-queues a paid job).
4. **finalize** — HD completes **by draft_id** (no new prompt/files); re-uploading the draft file is refused; needs explicit operator OK (Tier-3 spend).
Tests: `test_paid_gen_gate.py` → 9/9 (rights, purpose, budget, review-required, stale approval, submit-once/resume, no-reupload, HD-approval, HD-by-draft-id).

## Sanctioned transfer path (WORKAROUND)
Subject/motion transfer with **consented** inputs → `user-Higgsfield.motion_control` (Kling 3.0: image_id + motion_video_id, 720p/1080p). No Seedance key, no evasion. For face-landmark **motion capture** on own footage, use [effectcraft-headless-motion](sand-workflow:effectcraft-headless-motion) (MediaPipe 478 pts) or MediaPipe directly; drive a Remotion/own rig.

## Never
- Recreate or skill the IP/likeness-filter evasion chain (depth-mask + vocal isolation + composite to defeat a provider filter). Documented for understanding only.
- Spend without operator Tier-3 approval (building mode: no selling, no auto-spend).
- Paste provider keys in chat — `.env`/secret store only. OpenRouter stays in Cursor.

## Done when
- The gate code gates a real (stubbed on box) submit→approve→finalize path, or an honest BLOCKED with "would work if we had <key> + consented inputs + operator approval".

## Tools
| Need | Path |
|---|---|
| Cost/approval/rights gate | box `paid_gen_gate.py` — **PROVE** |
| Motion transfer, consented | `user-Higgsfield.motion_control` — **PROVE** (connector; gen needs Tier-3) |
| Seedance/Enhancor | **BLOCKED** no key + evasion purpose; Higgsfield **WORKAROUND** |
| LLM orchestration | Cursor cloud agent — **BLOCKED on box** |

---
name: Remotion asset dictionaries
description: >-
  Use when a Remotion / motion brief needs curated b-roll, SFX, or icon banks
  with a JSON dictionary (file→description→when_to_use) so the agent picks
  assets without vision-scanning every file. Trigger: b-roll bank, SFX library,
  icon/logo pack, “dictionary JSON”, pre-editor asset pick, Matt Penny connector
  #6–#8. Anti-trigger: one-off stock grab with no bank; generative-only b-roll
  with no curated folder; non-video asset catalogs (code deps, n8n nodes).
---
# Remotion asset dictionaries

**Owner:** Creative Studio · **Path:** **PROVE** recipe (sample schemas). Pair with [remotion-brief-to-render](sand-workflow:remotion-brief-to-render) · [when-remotion](sand-workflow:when-remotion).

## What
Maintain three JSON dictionaries beside asset folders:
- `broll-dictionary.json` — file, description, when_to_use, duration/aspect
- `sfx-dictionary.json` — file, description, when_to_use, gain_db
- `icons-dictionary.json` — file, description, when_to_use, license_note

Agent reads the dictionary first; only opens vision on ambiguous ties.

## Triggers
- Operator/brief says b-roll bank, SFX pack, icon/logo library, asset dictionary
- Remotion edit asks “pull suitable b-roll/SFX/icon for this beat”
- Closing a Matt Penny–style connector stack (`yt:6bZrTSUR0RM`)

## Anti-triggers
- Single stock image download with no bank
- Pure generative plate (Higgsfield) with no curated folder — use brief-to-render plates path
- Non-motion catalogs (npm packages, n8n nodes, Mobbin screens)

## Steps
1. Put vetted files under `broll/` · `sfx/` · `icons/` in the Remotion repo.
2. Write/update the three JSON dictionaries (see L2 samples).
3. In brief: point agent at dictionary paths; forbid blind folder vision sweeps.
4. Prefer curated over on-the-fly ElevenLabs SFX / AI logos (FACT from tape).
5. Brand logos = real marks only.

## Samples (2026-09-14)
`/workspace/research/youtube-daily/l2-20260914/6bZrTSUR0RM/recreation/{broll,sfx,icons}-dictionary.json`

## Labels
| Need | Label |
|---|---|
| Dictionary schema + pick recipe | **PROVE** |
| Brave search to fill icon gaps | **BLOCKED** until Brave connected |
| AI-generated brand logos | **BLOCKED** (quality) |
| Higgsfield to grow b-roll bank | **WORKAROUND** / Tier-3 if paid |

## Never
- Invent captions or asset descriptions not grounded in files
- Auto-spend gen credits to fill the bank
- Treat Applied AI Mastermind asset packs as required rent

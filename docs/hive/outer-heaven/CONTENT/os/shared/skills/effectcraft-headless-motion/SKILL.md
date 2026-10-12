---
name: EffectCraft headless motion
description: >-
  Use when a motion job needs real After-Effects-style ops bound to footage —
  point/face tracking, stabilize, keying, LUT/Lumetri, render — that Remotion
  cannot do in code. EffectCraft (ArtCraft's AE clone, pure Rust) runs fully
  headless on the box via its CLI + MCP; Remotion stays the assembler.
---
# EffectCraft headless motion

**Owner:** Forge runs it · Creative Studio owns the cut · pairs with [motion-pipeline](sand-workflow:motion-pipeline) and [motion-pipeline](sand-workflow:motion-pipeline).
**Platform:** Grok Bot box. **Install:** release tarball only (no cargo build, no desktop) — **PROVE** (v0.8.0 run headless 2026-10-11, L2 `yt:5mi_tYSdkWQ`). Named-tool import stays behind [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate).

## Source (FACT, yt:5mi_tYSdkWQ FUTC + GitHub storytold/effectcraft, Apache-2.0/MIT)
FUTC drove EffectCraft by hand (Track Motion on his nose) and then via Claude Code + the repo's `.mcp.json`. His MCP attempt timed out because `cargo run --release` compiles past the 30 s connect timeout; the fix is a prebuilt release binary. Clone/releases cadence ~daily (v0.6.0 10-08 → v0.8.0 10-11).

## When
- Footage-bound AE ops: track a point/face, stabilize, mask, key, apply a LUT/Lumetri, render a comp.
- An agent (Cursor cloud agent / a desk) should drive a motion app over MCP with confined file access.
- A tape shows After Effects / an AE clone and we need the technique, not just a screenshot.

## Anti-triggers
- Code-first motion (charts, timed captions, TSX comps) → [motion-pipeline](sand-workflow:motion-pipeline) / [motion-pipeline](sand-workflow:motion-pipeline).
- Generative plates / Seedance-class clips → [motion-pipeline](sand-workflow:motion-pipeline) (Higgsfield).
- Likeness/IP-filter evasion → [media-gen-cost-gate](sand-workflow:media-gen-cost-gate) refuses it; do not.

## Setup (box, no install)
```
cd /workspace && mkdir -p effectcraft-sandbox-<date> && cd $_
curl -sL -o ec.tar.gz https://github.com/storytold/effectcraft/releases/download/v0.8.0/effectcraft-0.8.0-linux-x86_64.tar.gz
curl -sL -o SHA256SUMS.txt https://github.com/storytold/effectcraft/releases/download/v0.8.0/SHA256SUMS.txt
sha256sum -c <(grep linux-x86_64.tar.gz SHA256SUMS.txt | sed 's#effectcraft-.*tar.gz#ec.tar.gz#')  # verify
tar xzf ec.tar.gz
EC=$PWD/effectcraft-0.8.0-linux-x86_64/bin/effectcraft-cli   # also: .../bin/effectcraft (GUI, needs a display)
```

## Recipes (PROVE on box 2026-10-11)
**Point track + attach text, headless:**
```
$EC --empty run file.import '{"paths":["clip.mp4"]}' file.newCompFromSelection '{}' --save-as p.ecproj
$EC --project p.ecproj run \
  layer.newText '{"text":"LABEL","position":[x,y]}' layer.setText '{"size":44,"fill":"#fff"}' \
  track.new '{"layer":"clip.mp4","kind":"transform","position":true,"target":"LABEL"}' \
  track.setPoint '{"layer":"clip.mp4","point":1,"center":[x,y],"featureSize":[40,40],"searchSize":[160,160],"attachOffset":[0,-50]}' \
  track.analyze '{"layer":"clip.mp4","direction":"forward","wait":true}' \
  track.apply '{"layer":"clip.mp4","dimensions":"xy"}' --save
$EC --project p.ecproj render --out out.mp4 --format h264     # also render-frame, --gpu
```
Accuracy check against a synthetic Lissajous target: **mean 1.5 px, p95 2.4 px over 120 frames**.

**Face tracking (Google MediaPipe, 478 pts — same model FUTC/Sirio use):**
```
$EC --empty run file.import '{"paths":["face.mp4"]}' file.newCompFromSelection '{}' \
  face.model.download '{"id":"mediapipe-face","wait":true}' face.model.select '{"id":"mediapipe-face","wait":true}' \
  layer.addMask '{"layer":"face.mp4","shape":"ellipse","rect":[x,y,w,h]}' \
  track.mask '{"layer":"face.mp4","method":"faceDetailed","direction":"forward","wait":true}' \
  track.extractFaceMeasurements '{"layer":"face.mp4"}' --save-as f.ecproj
# -> per-frame head pos/scale/orientation + eye/mouth openness TSV (drive a mascot/own rig)
```

**Agent control over MCP (confined):**
```
$EC mcp --automation-read-root /workspace/sb --automation-write-root /workspace/sb
# stdio JSON-RPC, 27 tools: execute_command, command_batch, run_script, get_property, add_keyframe, render_frame, save_project ...
# always pass read/write roots so the agent cannot touch the rest of the box.
```
`script FILE.jsx` runs AE-style JSX (`app.project.items.addComp`, `layers.addSolid`, `transform.scale.setValueAtTime`). `file.exportLottie` keeps tracked position as per-frame keys (footage → null; text bakes at t0 unless kept as text).

## Hand-off to Remotion
Render mp4 from EffectCraft, or exportLottie → `@remotion/lottie` in a Remotion repo (UNVERIFIED on box — no node_modules; Forge/Cursor to confirm). EffectCraft does the footage-bound tracking/keying; Remotion assembles the final cut. Do not reimplement tracking in CSS.

## Done when
- A tracked/keyed/rendered artifact on disk + the command list that made it, OR honest WORKAROUND/BLOCKED.
- Close via [research-signal-to-skills](sand-workflow:research-signal-to-skills) (Platform + Install).

## Tools
| Need | Path |
|---|---|
| CLI (track/render/script) | box `effectcraft-cli` (release tarball) — **PROVE** |
| Face model | `face.model.download mediapipe-face` (Google, sha256-verified) — **PROVE** |
| Agent control | `effectcraft-cli mcp` with read/write roots — **PROVE** |
| GUI `--control 9877` | needs a display — **WORKAROUND** (headless CLI/MCP first) |
| Lottie → Remotion render | **UNVERIFIED** — Forge/Cursor repo |
| LLM-driven agent (Claude/Opus) | Cursor cloud agent (OpenRouter in Cursor) — **BLOCKED on box** |

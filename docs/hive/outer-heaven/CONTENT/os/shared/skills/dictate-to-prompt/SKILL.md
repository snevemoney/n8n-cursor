---
name: dictate-to-prompt
description: >-
  Use when turning a voice note or audio file into a clean agent prompt. Triggers: dictate, voice note to prompt, transcribe and clean. Anti-triggers: meeting minutes, subtitles.
---
# dictate-to-prompt

Run: `bash dictate.sh <audio> [--hotwords "a,b"]` → transcript + cleaned prompt under $DICTATE_OUT (default /workspace/research/dictation). Uses fw-transcribe.

Source: methods-gap close packet 2026-10-12 (approved "do it all" 2026-10-13). Jev advisory only; no self-PASS.

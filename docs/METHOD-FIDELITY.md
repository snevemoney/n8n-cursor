# METHOD-FIDELITY — demo vs live :4018, judged only from dense storyboards
Updated 2026-10-13 13:40 ET. Rule (Evens 12:45/12:52): no method is built until a live :4018 capture matches the video's frames step by step.
Storyboards: round2/storyboards/<M>/ — 4 fps across each window ±2 s plus every scene change (ffmpeg scene>0.2), numbered sheets with timestamp + aligned transcript line (storyboard.tsv), SPEC.md = what the video did. Builder: round2/storyboard.py. Z11 transcript = local ASR (faster-whisper base.en), YouTube subs were 429.
Head at capture: a34e7b028 (branch jarvis/live-4018-20261013, CANDIDATE).

| M | Demo (frames) | Live capture | Before | After | Verdict |
|---|---|---|---|---|---|
| Z02 pointer | storyboards/Z02 (177 fr), zoom_target.png | storyboards/Z02/Z02_side_by_side.png, live3.png | FAIL (screenshot offer) | ack 0.09 s, tag 4.69 s (demo 0 / 4.9 s), demo pill+arrow style, bob, 10 s, cursor not moved (650,1005 before/after), on-device OCR, nothing sent | **PARTIAL** |
| Z12 reflex gate | storyboards/Z12 (249 fr), demo_panel.png | storyboards/Z12/Z12_side_by_side.png, live_c.png | FAIL (log only) | 5-row panel with bars, ticks, chips, footer naming the note + ms (16.9 ms); "pull up my social bios" read the named note in 0.18 s | **PARTIAL** |
| Z11 write-back | storyboards/Z11 (512 fr), demo_1209.png | storyboards/Z11/Z11_side_by_side.png, live.png | FAIL (hidden JSONL) | each finished result → own vault note in 00_Outer_Heaven/JARVIS-INBOX + JARVIS · INBOX card with Got it | **PARTIAL** |
| Z14 cost card | storyboards/Z14 (337 fr), demo_590.png | storyboards/Z14/Z14_side_by_side.png | FAIL (natural ask went to the model, which invented prices) | "what does each thing you do cost me?" → cost_card in 0.21 s: typical cost each from real logs + busy-day line | **PARTIAL** |
| Z03 barge-in invite | storyboards/Z03 (81 fr) | storyboards/Z03/Z03_side_by_side.png | FAIL | invite line now spoken on Watch start; verbal arm is locked to his tap (safety rule), so not captured live | **FAIL (not captured)** |
| Z01 takeover+handback | storyboards/Z01 (331 fr) | text only: "Stop, Jarvis, I want to take over the screen." → handback in 3.5 s, "The wheel is yours. Nothing was mid-step." | FAIL (demo phrase fell to the model) | handback phrase fixed; the narrated takeover itself needs Jarvis to click/type on his Mac, which is barred, so not captured | **FAIL (not captured)** |
| Z09 pre-brief | storyboards/Z09 (180 fr), demo_msg.png | none: no calendar event in the 15-35 min window; calendar wire answered "still opening" | FAIL | wording matched (Prep header, minutes in words, notes-on-file check, two options); delivery is Orb-only, demo pushes Telegram text + voice note | **FAIL (not captured; delivery differs)** |

## Remaining gaps per method (why none is MATCH)
- Z02: label is the on-screen text ("Routines"), demo names the function ("Create button"); icon-only controls (the demo's "+") need AX, and the face's python3.14 is not Accessibility-trusted (AX works from a trusted shell: ax_trusted true); spoken line is generic, demo names place + next step. Icon matching without AX is not feasible on-device yet.
- Z12: lane shows hand name, not the demo's agent-task class; no graph highlight of the notes; panel briefly overlaps the answer (now 4 s).
- Z11: card shows the spoken result, not structured fields (quote id, amount, links); no "sent to your phone".
- Z14: spoken/Orb text, not a meter page; per-class costs are our real logs (cents differ from the demo's Sonnet numbers by design).
- Z03: needs Evens to tap Watch once to capture; actual voice cut-off (VAD) not exercised live.
- Z01: needs a sanctioned live takeover run (his go-ahead to let Jarvis click in a draft-only app).
- Z09: needs an event 15-35 min out and his OK for a phone push channel (a send).

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

## Round 2 (2026-10-13 13:41-13:45 ET, heads 51c1666b3 + bbe87dd22) — re-captured against the 4 fps storyboards
| M | Demo step (SPEC.md) | Live round 2 | Side-by-side (box, round2/storyboards/) | Verdict |
|---|---|---|---|---|
| Z02 | ack "Let me have a look, sir." instantly; 4.9 s later pill "Create button" + arrow on "+"; line names place + next step | ack 0.08 s; tag 1.13 s; pill "Routines section", arrow on it; said "The Routines section in the middle of your screen, sir; click it to open Routines. The red arrow is on it." Cursor not moved. | Z02/Z02_side_by_side_r2.png, Z02/r2-z02.png | **PARTIAL**: steps 1-5 match in order, style and timing; the label names a function and the line names the place and next step. But for icon-only targets ("+"), the label has to come from OCR text, because the face is not Accessibility-trusted. So the demo's exact "Create button" on an icon is not reproduced live. |
| Z12 | 5-row panel (lane / complete / addressed / stakes / vault hit), bars, verdict chips, footer with the note + ms; notes light up in the graph | Panel with all 5 rows, bars, ticks, chips CHAT/ACT/ACT/CLEAN/NAMED (chip fix bbe87dd22), footer "VAULT HIT · NAMED 76% · SOCIAL-BIOS-2026… · 11.7 ms"; answer read from the note in 0.05 s | Z12/Z12_side_by_side_r2b.png, Z12/r2-z12b.png | **PARTIAL**: the panel now matches row for row. The graph highlight (`lightNote`) is not visible in the widget Orb, which has no graph view on screen. |
| Z11 | finished result → own note + phone push with structured fields | Result → JARVIS-INBOX note + "JARVIS · INBOX" card with 🔎 icon, fields (ids, money, links), SAVED TO YOUR VAULT, Got it; 1.62 s | Z11/Z11_side_by_side_r2.png, Z02/r2-z11.png | **PARTIAL**: there is no "sent to your phone". That is a send and needs Evens's OK. |
| Z14 | rendered "meter" page: per-action cost + busy-day total | Orb meter card (per-class typical cost from real logs + busy-day line) + JARVIS-INBOX/THE-METER-EVERYDAY.md; 0.99 s | Z14/Z14_side_by_side_r2.png, Z02/r2-z14.png | **PARTIAL**: this is a card plus a markdown page, not the demo's rendered page. Our costs come from real logs, so they differ from the demo's numbers. |
Not changed: Z03, Z01 and Z09 remain FAIL (not captured), for the reasons above. **No method is MATCH. Everything not MATCH is listed as NOT-WORKING in STATUS-30.md.**

## Batch 3 (14:25 ET, heads e09a1fa4b + 3d761a6d4): new methods, no model call in any of them
| M | Demo step (SPEC.md) | Live | Side-by-side (box round2/storyboards/) | Verdict |
|---|---|---|---|---|
| Z51 dup-send guard | D5v4 7:30: "A quick flag before I proceed, sir… same subject, same wording to john… already gone out… Shall I still draft another one, or was this already handled?"; nothing drafted | 79 ms, no model: "A quick flag before I proceed, sir. This exact note to Zubair, same subject "Jarvis Scorecard Complete", same wording, was already drafted 5 times today (latest …). Shall I still draft it, or was this already handled?"; nothing drafted; "anyway/again" overrides | Z51/Z51_side_by_side.png | **PARTIAL**: steps 1-5 and wording match. It checks Jarvis's own drafts folder, not sent Gmail (no mailbox read wired), so it counts drafted, not sent. |
| Z54 not shared | U-LX 7:57: share cancelled → "The screen was not shared, sir." | "Jarvis, watch my screen" with Watch off → 27 ms "The screen was not shared, sir. Watch is off. Tap Watch on the face to share it."; screen_see no-source paths say the same | Z54/Z54_side_by_side.png | **PARTIAL**: line and trigger class match. Our trigger is Watch off, not a cancelled Chrome share picker (Jarvis has none). The reply also carries a leading "Sir." prefix plus an extra instruction. |
| Z60 approval read-back | zdnijkAbknA 3:31: read-back of condition + action + channel; 4:26 inbox card "approval granted" | 32 ms read-back: "I'll check your schedule and if there's no conflict, book kickoff call with Dana for Monday at 10, put it on your calendar and confirm it to you via Telegram. Did I get that right, sir?…"; JARVIS-INBOX "approval granted.md" (who/what/condition/follow-up/status) + bus card "📝 Approval granted (pending check)" | Z60/Z60_side_by_side.png, Z60/r3-z60b.png | **PARTIAL**: read-back and record match. In the capture, though, the Orb showed a later card, because it shows one card and the demo stacks two. It's a typed turn, not a phone call, and no booking or Telegram send happens (gated). |

## Batch 4 (14:39-14:42 ET, head b898a4be5): live captures r4-z52/z53/z58/z56.png (Mac ~/jarvis-proof/score30/)
| M | Demo | Live | Verdict |
|---|---|---|---|
| Z52 slot question | D5v4 9:20: stakes 79%, vault 32% → "A deal for whom, sir — and covering what?", footer "…NOTHING IMPROVISED" | "Jarvis, create a deal and send it to me." → 128 ms "A deal for whom, sir — and covering what?" (stakes 0.9, vault miss), reflex verdict "ASK · NOTHING IMPROVISED", nothing created | **MATCH** on wording, gate and timing; Jarvis's reply also carries a leading "Sir." |
| Z53 one filler | D5v4 7:10-7:27: 3 fillers ~7 s apart, user says "relax" → lesson: at most one | 5.5 s web search: exactly one filler ("On it.") then the answer; no timed fillers exist in code | **MATCH** for the lesson (counter-evidence method) |
| Z56 lapsed question | whIp 16:07: "The calendar question lapsed, sir. The unnamed contact booking, 10 am, is not on your calendar yet." via Telegram | Z60 approval left unanswered → 121 s later one "⏳ Question lapsed" inbox card: "The calendar question lapsed, sir. The kickoff call with Dana booking, Monday at 10, is not on your calendar yet." + JARVIS-INBOX note; once only; a new turn clears it | **PARTIAL**: the line matches, but it goes to the Orb and vault, not a Telegram push (a send needs Evens). The wording "kickoff call with Dana booking" is clunky. |
| Z58 today recap | whIp 11:08: "what did we work on today?" → short spoken recap | 136 ms: "Today, sir, we finished 36 distinct jobs. Most recent first: 8 web searches, latest …; 6 loop jobs…; 3 drafts…" | **PARTIAL**: it comes from real logs and is fast, but it's dominated by test-probe jobs and reads as a list, not the demo's two-item story. |

## Batch 5 (14:43-14:46 ET, heads e7768c03f + Z76 fix): storyboards from signals frames (4 fps) at round2/storyboards/<M>/ (box); live probes ~/jarvis-proof/b5/baseline.json + b5/Z75.png, b5/Z76.png
| M | Live result | Verdict |
|---|---|---|
| Z75 hush | "hold on, I'm talking to my audience, be quiet" → 0.94 s "Off you go, sir." (bus hush on, mic stays on) | **MATCH** (with Jarvis's "Sir." prefix) |
| Z76 resolved-entity ack | 0.92 s: names the record lookup (no Mike Johnson note in his vault, so it says so), "$2,500 for AI reputation build", local invoice draft file, email not drafted/sent | **PARTIAL**: no ETA, no phone or drive-link delivery, and no real record matched |
| Z71 value precedence | request amount beats a stored amount (code + toy test); not exercised live because there's no matching record | **PARTIAL** (not captured on a real record) |
| Z65 critique rubric | strengths first, then gaps quoting "Familiarity with" and naming the missing evidence (deal counts, revenue); 42 s | **PARTIAL** (slow; no persona quip) |
| Z67 no invented numbers | resume bullets contained an invented "30%" | **FAIL** |
| Z84 tool-gap disclosure | model explains it can't check that and offers options, but there's no "isn't in your arsenal" line from the tool inventory | **PARTIAL** |
| Z72 facts + one quip | calendar ask → "Allow Terminal to control Calendar. Can't get start date of {}." | **FAIL** (needs Evens's Calendar permission; error text leaks) |
| Z70 / Z74 / Z82 / Z83 vault pull-up / show-first / find→confirm→fetch / grounding | routed to workspace_read → "outside the allowed folders" | **FAIL** (the other worker is fixing "pull up my X" routing) |
| Z68 research critique | web query became "ideas"; no share | **FAIL** |
| Z34 proactive follow-up | booking ask refused as a hard step; no follow-up offer | **FAIL** |
| Z04 sight ends with share | not captured (needs his Watch tap) | **FAIL (not captured)** |
| Z06 / Z07 / Z40 phone | no phone agent (telephony on HOLD) | **FAIL (HOLD)** |
| Z42 approval-by-call | approval record + card exist (Z60), no call, no execution | **PARTIAL** (workaround only) |
| Z66 review→do chain, Z69 stale speech on stop, Z73 gestures, Z77/Z78/Z79 connect tools, Z81 heartbeat, Z86/Z87 automation contract + prove-before-done | not built this round | **FAIL (not built)** |

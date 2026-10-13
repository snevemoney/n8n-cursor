# Latency after "On it." — findings (2026-10-13, Consultant, CANDIDATE)

**Symptom.** On :4019, "What branch are you working from right now?" streamed "On it." at 1.46 s and the final reply at 9.37 s. The tool itself (workspace_read, 3 git calls) took 0.18 s. Mac load average was 60–250 all night.

**Profile** (offline `apply_turn_iter`, cProfile, same ask, total 4.35 s):
| Stage | Time | Note |
|---|---|---|
| run_tool → workspace_read | 0.18 s | not the problem |
| `_commit_spoken` → `chats.archive_turn` → `append_jarvis_turn` | **2.90 s** | 20 `read_text` calls: every turn re-read and rewrote each root's whole daily Face log (Obsidian vault, ~100–260 KB/day, slow under I/O load), then `os.replace` |
| `live_cursor_ready` → `cursor_logged_in` (subprocess) | 1.15 s | runs on a model-free tool route that never uses Cursor (cache miss) |

**Fixed in this round.** `append_jarvis_turn` now appends to an existing day log instead of read+rewrite (check latency/01: 20 MB log, <0.3 s, no whole-file read). A new day still gets its header atomically.

**Left (next rounds).**
1. Skip `live_cursor_ready` / `cursor_logged_in` on model-free routes, or warm its cache at boot (~1.1 s).
2. Emit the final event before archiving (archive after the yield or on a worker thread) so log I/O never sits on the reply path.
3. Re-measure on :4018 once load < 20; the 10–27 s seen live scales with I/O load on the vault, so the soak should report p50/p95 `first_chunk_ms` and total.

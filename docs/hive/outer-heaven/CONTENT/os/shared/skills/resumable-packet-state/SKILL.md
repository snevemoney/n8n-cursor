---
name: resumable-packet-state
description: >-
  Use for any multi-item or multi-stage job that may be cut off (turn end, kill,
  crash, quota): keep an append-only STATE.jsonl plus a RESUME.md in the job
  folder, skip already-done items on restart, and prove it with a
  kill-and-resume test.
---
# Resumable packet state

## Layout (in the job/packet folder)
- `STATE.jsonl`: append-only, one JSON object per event: `{"id":..., "stage":..., "status":..., "at": ISO-8601-with-offset, ...}`. Never rewrite past lines. Add a `START` line per run (pid, how many it is skipping).
- `RESUME.md`: plain steps for the next run: what is running, how to check it, how to stop it, how to re-derive status, then dated `## Update <date time zone>` sections with counts.
- Optional: a rebuild script that re-derives every item's status from files on disk (status = f(evidence), not memory).

## Loop pattern
1. On start, read STATE.jsonl and build `done = {id for lines with a terminal stage}` (DONE, FAILED_FINAL, SKIPPED…).
2. Append a `START` line.
3. For each item not in `done`: do the work, then append `{"id", "stage":"DONE"}` **only after the output is verified**, and flush + fsync.
4. Retry transient failures up to N with backoff, logging every attempt (`FAILED` then a retry). Mark `FAILED_FINAL` after N.
5. At the end append `COMPLETE` and add a RESUME.md update with counts.
6. Make the work per item idempotent (re-running a half-done item overwrites, never duplicates).

## Backfilling a folder that has no state
Derive state from files only: file count, newest file, final-looking artifacts, open markers (BLOCKED/PENDING/TODO). Write one `BACKFILL` line with `progress_invented:false`. Never overwrite existing STATE/RESUME files.

## Kill-and-resume test (run once per new job type)
1. Make a small synthetic job (for example 30 items × 0.2 s) with the loop above.
2. Start it, then `kill -9` it partway.
3. Restart it. Check: the restart's START line shows skipping = items done before the kill, every id is DONE exactly once (0 duplicates), and the last line is COMPLETE.
4. Record PASS/FAIL plus those numbers in the job's RESUME.md.

## Don'ts
- Don't mark DONE before the output exists.
- Don't keep progress only in chat or in memory.
- Don't infer progress you can't see on disk.

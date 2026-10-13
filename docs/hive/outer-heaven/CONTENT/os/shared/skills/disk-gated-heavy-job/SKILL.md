---
name: disk-gated-heavy-job
description: >-
  Use before any heavy box job (bulk downloads, ASR/transcription, renders, model
  weights, big clones, archives): check free disk first, run only under the
  threshold, wait/back off or skip when over it, and clean up per item so the
  job never fills the disk.
---
# Disk-gated heavy job

## When
Any job that writes more than ~1 GB in total or more than ~200 MB per item, or runs unattended over many items.

## Steps
1. **Gate before starting.** Run `df -P <target-mount> | awk 'NR==2{print $5}'` to get the percent used, and also read free GB. Pick a threshold (default: start only if used < 85% **and** free GB is at least 2× the largest expected item). Over it means do not start: write a `SKIPPED_DISK` receipt line with used% and free GB, and stop or schedule a retry.
2. **Size the job.** Estimate the per-item peak (download, intermediate files and output). Put temp files on the same mount you gate on.
3. **Re-check per item**, inside the loop, before each item starts:
   - Under the threshold → run the item.
   - Over it → back off (sleep 5 → 10 → 20 min, capped at 60), re-check, and give up after N tries with a `WAIT_TIMEOUT_DISK` state line. Never delete other jobs' files to make room; ask the owner or the disk cleaner.
4. **Bound the item.** Cap memory or size where the tool allows (RSS limit, `--max-filesize`, a chunked mode). Kill and mark the item `FAILED_CAP` if it exceeds the cap.
5. **Clean up per item.** Delete that item's intermediates (wav, raw video, unpacked archive) as soon as its output is verified. Keep only the deliverable.
6. **Log.** For each item, append a state line with `{id, stage, used_pct, free_gb, at}` (see resumable-packet-state), so a restart resumes and the disk trend is visible.
7. **Close.** Report items done, skipped or waiting, the final used%/free GB, and anything left on disk.

## Don'ts
- Don't start a heavy job "just this once" over the threshold.
- Don't clean shared caches or other packets to make room. That is a separate, approved task.
- Don't keep intermediates "for later". Re-derive them instead.

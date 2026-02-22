# YouTube Transcript Ingestion — Operator Runbook

> **System**: Private Operator Intelligence Pipeline  
> **Purpose**: Ingest YouTube transcripts → classify → propose learning → human approves  
> **Philosophy**: Acquire / Deliver / Improve — no auto-modify, no auto-promote

---

## Provider Order & Fallback Chain

| Priority | Provider | Requires | Notes |
|----------|----------|----------|-------|
| 1 | TranscriptAPI | Network access | Fast, no binary needed. Uses `yt.lemnoslife.com` or configured `TRANSCRIPT_API_URL` |
| 2 | YouTube Captions | Network access | Scrapes video page for caption track URLs. Subject to bot detection |
| 3 | yt-dlp | `yt-dlp` binary in PATH | Downloads subtitle files directly. Robust but slower |
| 4 | Whisper (optional) | `yt-dlp` + `OPENAI_API_KEY` | Last resort. Downloads audio → sends to OpenAI Whisper. Opt-in only (`YOUTUBE_WHISPER_ENABLED=true`) |

If all providers fail, the job is marked `FAILED_TRANSCRIPT` with the specific failure reason from each provider attempt logged.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRANSCRIPT_API_URL` | `https://yt.lemnoslife.com/noKey` | TranscriptAPI base URL |
| `YOUTUBE_TRANSCRIPT_API_ENABLED` | `true` | Enable/disable TranscriptAPI provider |
| `YOUTUBE_CAPTIONS_ENABLED` | `true` | Enable/disable YouTube Captions scraping |
| `YOUTUBE_YTDLP_ENABLED` | `true` | Enable/disable yt-dlp provider (binary must exist) |
| `YOUTUBE_WHISPER_ENABLED` | `false` | Enable Whisper transcription (requires `OPENAI_API_KEY`) |
| `OPENAI_API_KEY` | — | Required for Whisper provider |
| `DATABASE_URL` | — | PostgreSQL connection string |

---

## Retry Policy

- **Per-provider**: Each provider is tried once per ingest attempt. No retries within a single provider call.
- **Fallback**: If provider 1 fails, provider 2 is tried, then 3, then 4.
- **Manual retry**: Failed jobs show a "Retry" button in the Failures & Interventions panel. Retry re-runs the full cascade.
- **Channel ingest concurrency**: Max 3 videos processed simultaneously. Safe default to avoid rate limiting.

---

## What "Reliability Guarantee" Means in Practice

There is no 100% guarantee any YouTube video can be transcribed. What this system guarantees:

1. **Multi-provider cascade**: 4 independent methods tried in order
2. **Structured failure logging**: Every attempt is recorded with provider name, error, and duration
3. **Visible failures**: Failed jobs immediately appear in the Failures panel
4. **Easy retry**: One-click retry from the UI
5. **De-duplication**: Videos already transcribed are not re-processed (unless retried explicitly)
6. **No silent failures**: Every job has a terminal status (COMPLETED, FAILED, PARTIALLY_COMPLETED)

---

## Human-Gated Promotion Policy

**Non-negotiable guardrails:**

1. No transcript content automatically modifies any playbook, SOP, prompt, or template
2. No learning proposal is automatically promoted — every proposal starts as `READY_FOR_REVIEW`
3. Promotion to playbook requires explicit human action via the UI (Promote button + optional notes)
4. Three human actions available:
   - **Promote to Playbook**: Creates/updates a playbook artifact
   - **Reject**: Discards the proposal (with optional notes)
   - **Knowledge Only**: Stores as reference material, no action taken
5. The `confirmPromotion: true` flag is required in the API — no accidental promotion

---

## Status Lifecycle

### Transcript Status
```
PENDING → FETCHING → TRANSCRIBED → READY_FOR_REVIEW
                   ↘ FAILED_TRANSCRIPT (retry possible)
                                      ↗ PROMOTED_TO_PLAYBOOK (human only)
                                      → REJECTED (human only)
                                      → KNOWLEDGE_ONLY (human only)
```

### Ingest Job Status
```
QUEUED → RUNNING → COMPLETED
                 → PARTIALLY_COMPLETED (some videos failed in channel ingest)
                 → FAILED
```

---

## Common Failure Causes & Interventions

| Failure | Likely Cause | Intervention |
|---------|-------------|--------------|
| `PROVIDER_BLOCKED` on TranscriptAPI | API rate limit or temporary outage | Wait 60s, retry. System will fall through to next provider |
| `TRANSCRIPT_UNAVAILABLE` | Video has no captions (music, live, private) | Expected failure. Mark as known or use Whisper if enabled |
| `PROVIDER_BLOCKED` on YouTube Captions | YouTube bot detection | Retry after delay. Consider enabling yt-dlp |
| `PROVIDER_NOT_AVAILABLE` for yt-dlp | Binary not installed | Install: `pip install yt-dlp` or `brew install yt-dlp` |
| `PARSING_FAILED` | Unexpected response format from provider | Check provider API changes. May need code update |
| `RATE_LIMITED` | Too many requests to a provider | Reduce channel ingest batch size or add delay |
| `CHANNEL_RESOLUTION_FAILED` | Handle/channel not found | Verify URL. Try using channel ID format (youtube.com/channel/UC...) |
| `INVALID_URL` | Not a valid YouTube URL | Check URL format. System accepts watch, shorts, embed, youtu.be |

---

## Database Schema

Tables: `youtube_sources`, `youtube_ingest_jobs`, `youtube_transcripts`, `learning_proposals`

Schema file: `database/schemas/youtube_ingest.sql`

Run migration:
```bash
psql $DATABASE_URL -f apps/scorpion/database/schemas/youtube_ingest.sql
```

All tables use `IF NOT EXISTS` — safe to re-run.

---

## API Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/youtube/ingest/video` | POST | Ingest single video `{ url }` |
| `/api/youtube/ingest/channel` | POST | Ingest channel `{ url, limit? }` |
| `/api/youtube/jobs` | GET | List recent jobs `?failed=true&limit=50` |
| `/api/youtube/transcripts` | GET | List transcripts `?status=TRANSCRIBED&provider=youtube_captions` |
| `/api/youtube/learning` | GET | List proposals `?status=READY_FOR_REVIEW` |
| `/api/youtube/learning/promote` | POST | Promote proposal `{ proposalId, confirmPromotion: true }` |
| `/api/youtube/learning/reject` | POST | Reject proposal `{ proposalId, markAsKnowledgeOnly? }` |
| `/api/youtube/stats` | GET | Summary stats for Command Center |

---

## Business Lens

Every transcript should help improve one of:
- **Acquire**: Prospecting, approach, follow-up, referral, positioning
- **Deliver**: Client workflows, quality, speed, results
- **Improve**: Reusable assets, playbooks, leverage score, process refinement

If a transcript does not create a likely benefit, mark it `KNOWLEDGE_ONLY`.

The system classifies automatically, but the human reviews and decides. The classification is a starting point, not a verdict.

---

## Sample Objects

### Sample Ingest Job
```json
{
  "id": "a1b2c3d4-...",
  "source_type": "video",
  "source_id": "e5f6g7h8-...",
  "status": "COMPLETED",
  "attempts": 1,
  "provider_used": "transcript_api",
  "last_error": null,
  "run_summary_json": {
    "total_found": 1,
    "already_ingested": 0,
    "transcribed": 1,
    "failed": 0,
    "queued_for_review": 1,
    "provider_attempts": [
      { "provider": "transcript_api", "success": true, "durationMs": 1243 }
    ]
  },
  "queued_at": "2026-02-22T10:00:00Z",
  "started_at": "2026-02-22T10:00:01Z",
  "completed_at": "2026-02-22T10:00:03Z"
}
```

### Sample Learning Proposal
```json
{
  "id": "x9y0z1a2-...",
  "transcript_id": "b3c4d5e6-...",
  "video_id": "dQw4w9WgXcQ",
  "summary": "Key insights on follow-up cadence for closed-lost deals...",
  "extracted_points_json": [
    { "claim": "You should follow up within 72 hours of a lost deal", "confidence": 0.85 },
    { "claim": "The mistake most people make is never following up on closed-lost", "confidence": 0.78 }
  ],
  "category": "follow_up_retention",
  "system_area": "Acquire",
  "contradiction_flags_json": [],
  "proposed_actions_json": [
    { "type": "script_improvement", "description": "Review and potentially create/update followup script based on 2 extracted points", "target": "follow_up_retention" }
  ],
  "produced_asset_type": "followup_script",
  "expected_impact": "Acquire",
  "revenue_link": "improves follow-up discipline, client retention; directly supports revenue acquisition",
  "status": "READY_FOR_REVIEW",
  "reviewer_notes": null
}
```

---

## Test Checklist

- [ ] Single video URL → transcript created, proposal generated
- [ ] Channel URL → multiple videos ingested with summary
- [ ] De-dupe: re-ingesting same video returns "already ingested"
- [ ] When TranscriptAPI fails → fallback to YouTube Captions (or next available)
- [ ] Failed job visible in Failures tab with error details
- [ ] Retry button works on failed jobs
- [ ] Promote proposal → status changes to PROMOTED_TO_PLAYBOOK
- [ ] Reject proposal → status changes to REJECTED
- [ ] Knowledge Only → status changes to KNOWLEDGE_ONLY
- [ ] Stats card shows correct counts on Command Center
- [ ] Invalid URL returns 400 with clear error message

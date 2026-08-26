---
chatId: 75d0fa82-c74d-4a3e-b6c0-55d64964112f
workspace: client-engine-1
source: cursor
title: "YouTube ingest feature audit"
updated: 1772756728245
messageCount: 5
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# YouTube ingest feature audit

**Workspace:** `client-engine-1`  
**Chat ID:** `75d0fa82-c74d-4a3e-b6c0-55d64964112f`  
**Messages:** 5  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/187e6d13-59df-4361-94fd-beacfaa485e9/subagents/75d0fa82-c74d-4a3e-b6c0-55d64964112f.jsonl`

## What you asked

- Perform a comprehensive audit of the YouTube ingest feature in this codebase. Map out:

1. **Page structure**: src/app/dashboard/youtube/ (page.tsx, transcripts/page.tsx)
2. **Client component**: src/components/dashboard/youtube/YouTubeIngestClient.tsx - props, state, tabs, data flow
3. **API routes**: /api/youtube/* - ingest/video, ingest/channel, ingest/playlist, jobs, transcripts, learning
4. **Queries**: src/lib/youtube/queries.ts - getRecentJobs, getFailedTranscripts, getTranscripts, getLearningProposals
5. **Ingest pipeline**: src/lib/youtube/videoIngest.ts - flow, de-dupe, proposal retr

## Assistant (excerpts)

- Auditing the YouTube ingest feature. Exploring the codebase systematically.

---

- Checking transcripts API response shape and whether the transcripts page receives `transcriptText`:

---

- Verifying one more detail about the transcripts API and the `getProposalById` query:

---

- ---

# YouTube Ingest Feature Audit Report

## 1. Current Architecture

### Page Structure

| Path | Type | Data Source |
|------|------|-------------|
| `src/app/dashboard/youtube/page.tsx` | Server component | `getRecentJobs`, `getTranscripts`, `getLearningProposals`, `getFailedTranscripts` (parallel) |
| `src/app/dashboard/youtube/transcripts/page.tsx` | Client component | Fetches `/api/youtube/transcripts` (no `transcriptText` in response) |

### Client Component (`YouTubeIngestClient.tsx`)

**Props:**
- `initialJobs`, `initialTranscripts`, `initialProposals`, `initialFailedTranscripts`

*

## Composer meta

- Name: YouTube ingest feature audit
- Subtitle: Read whisper.ts, ytDlp.ts, queries.ts, page.tsx, channelIngest.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260306-production-deployment-plan-and-issues-187e6d13|Production deployment plan and issues]]
- [[20260304-command-center-data-fetching-analysis-cecf72a7|Command-center data fetching analysis]]
- [[20260304-client-engine-1-codebase-exploration-4c9a9d3d|Client-engine-1 codebase exploration]]
- [[20260227-client-engine-dashboard-audit-586691d6|Client Engine dashboard audit]]
- [[20260222-cursor-cloud-agent-integration-plan-623a99f6|Cursor Cloud Agent integration plan]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->

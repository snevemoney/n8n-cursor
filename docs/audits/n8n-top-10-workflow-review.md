# n8n top-10 workflow review

Audit date: 2026-08-06  
Instance: `https://evenslouis.ca/n8n/` (`n8n 2.34.1`)

## Scope and safety

- Inventoried all 162 workflows: 57 active and 17 archived.
- Ranked active workflows by business utility, integration depth, complexity, maintainability, and recency, then removed duplicate/template-heavy candidates.
- The execution database contains only two post-migration manual failures, both for `rag agent`; that is not enough history to rank reliability.
- All changes are drafts. Every selected workflow stayed active on the same published `activeVersionId`.
- No workflow was executed, tested, published, unpublished, archived, or activated.
- MCP visibility was enabled temporarily for review and restored to its original disabled state.
- Full before/after JSON and validation evidence is retained in the ignored local backup directory referenced by `backups/n8n-top10-audit-latest.txt`.

## Portfolio findings

- None of the 57 active workflows had a workflow description before this audit.
- 54 of 57 active workflows had no workflow-level error handler.
- 54 of 57 active workflows had no nodes configured to retry.
- Twelve active workflows contain disabled nodes.
- Three active copies share the name `Build a PDF Document RAG System with Mistral OCR, Qdrant and Gemini AI`; the credentialed copy was treated as canonical.

## Changes applied

All retry changes use three attempts with a one-second delay. Retries were limited to reads, searches, or model calls; email sends, Telegram sends, database writes, and other non-idempotent operations were not given automatic retries.

| Rank | Workflow | Draft changes | Rollback version | New draft version |
|---:|---|---|---|---|
| 1 | On-demand calling | Added description; retries on `Azure OpenAI Chat Model1` and idempotent `Get Current Assistant1` | `f70a78e7-aecd-4404-a6c7-ce869ccd064b` | `489ad8da-b39b-43b6-9518-d13917ca6938` |
| 2 | Voice assistant agent (with Telegram and Gcal) | Added description; retries on read-only `Get Emails` and `Get Events` | `cdb55bf0-641a-4573-ad38-cb11ab7a97ad` | `6135f252-04dd-4558-b9a0-ef7173449632` |
| 3 | Automated Stock Analysis Reports… | Added description; retries on `Get News Data` and `GPT 4o` | `4cfe8086-0494-4e8b-833f-686e8427db6e` | `b35b7de2-062f-4a5c-b977-aba3636c4006` |
| 4 | Build a PDF Document RAG System… | Added canonical-copy description; retries on signed-URL lookup and Gemini; set custom text splitting; made Drive search operation explicit | `89e95f66-5172-498c-903e-a6f49ed11338` | `2ab01df5-9c51-497a-9135-a7b7eb8bb88c` |
| 5 | Nano Photoshop Agent | Added description; retries on `Sonnet 3.5` and `GPT 5 mini` | `836d0f1b-59a5-451b-9ba2-f246a6f1d6b5` | `a41e6c2f-1675-4776-b14d-7bf69c36dfed` |
| 6 | Ultimate Browser Agent | Added description; retry on `3.5 Sonnet`; repaired expression prefixes in `Query`, `Load URL`, `Type`, `End Session`, and `Click` | `8c3a0d95-10c6-4399-a63e-205941f5876d` | `57e7e6c3-87d4-49f5-aa9c-cb3824e9142a` |
| 7 | Scrape Ads | Added description; retries on OpenAI and Tavily search | `3857029c-36de-4fc4-856a-e8aa9f888397` | `b9b2ff44-2d9f-4ecd-a0f3-e04c72118d3e` |
| 8 | Asset Management API (Corrected) | Added description; retry only on `Get Assets`; repaired n8n expression prefixes in all four CRUD SQL nodes | `7b5770f2-e6e0-495b-9fbf-2aabfb1c6025` | `ac37138d-cd2b-4a67-884d-116a3575709a` |
| 9 | Chat AI Agent - Asset Management | Added description; retries on tenant validation and OpenAI; repaired expression prefixes in seven PostgreSQL read/context nodes | `13f2440d-701d-473e-a8bd-d00cdc9ae000` | `14b20189-d9e7-4211-857d-607e67af1dff` |
| 10 | PI Attorney Lead Qualifier | Added description; retry on the OpenAI model | `12c65a0a-fef6-4c76-a8f7-1a8ce7a5a8ca` | `e631a351-e14c-427b-a401-1624e195d2b9` |

## Per-workflow critique

### 1. On-demand calling

This is the broadest and most valuable orchestration workflow, but at 350 nodes, 363 connections, and more than twenty trigger/response nodes it is also the highest operational risk.

Deferred issues:

- Many AI agents have multiple language-model subnodes even though the input accepts one model.
- Three Set nodes contain assignments without names.
- The data-loader/text-splitter branch is inconsistent.
- Several static agent prompts may not consume input data.
- External HTTP, Sheets, email, and calendar behavior is concentrated in one workflow; credentials are not attached to nodes in the exported definition.
- Split the calling, profile, scheduling, emergency, and RAG domains into versioned subworkflows only after representative test fixtures and production execution history are available.

### 2. Voice assistant agent

The Telegram-to-personal-assistant design has useful breadth, but 30 credential bindings across 44 nodes create a large authentication and rate-limit surface.

Deferred issues:

- `Generate audio` uses a resource value that no longer matches its upgraded node schema.
- `Get Labels` is missing a required name and `Label Emails` supplies the wrong label-ID type.
- Gmail and Telegram nodes rely on omitted default discriminators.
- Add a production error-notification strategy after choosing a shared error workflow or an in-workflow Error Trigger.

### 3. Automated Stock Analysis Reports

The workflow combines multiple data sources and analysis stages well, but only the subworkflow trigger is currently enabled; schedule and form triggers are disabled.

Critical deferred issue:

- `Set Stock Symbol and API Key` stores `TwelveData_API_Key` in workflow data. Move this secret into an n8n credential and rotate the exposed key before publishing this draft.

Other deferred issues:

- No failure path for partial market/news API outages.
- Multiple Code nodes make report calculations harder to test independently.

### 4. PDF Document RAG

This is the canonical copy because it is the only active duplicate with Qdrant credentials attached.

Deferred issues:

- Two other active workflows have the same name and near-identical graph; review and archive duplicates separately.
- `Qdrant Vector Store1` is wired as a retrieval subnode without an explicit compatible mode.
- `Create collection` and `Summarization Chain` are disconnected functional nodes.
- Only the execute-subworkflow trigger remains enabled, so editor chat and manual ingestion are not active entry points.

### 5. Nano Photoshop Agent

The flow is compact and cohesive, but the `Photoshop Agent` has both Sonnet and GPT models connected to a single-model input.

Deferred issues:

- Select one primary model (or introduce an explicit fallback branch) before publishing.
- Google Drive operations rely on omitted default operation discriminators.
- No explicit failure response exists for model, Drive, or Telegram errors.

### 6. Ultimate Browser Agent

The Airtop session lifecycle is well represented, and this audit repaired the expression syntax in five connected browser tools.

Deferred issues:

- `ClickTool` is disconnected, has invalid Airtop resource configuration, and still contains malformed expression fields.
- `Window` has a resource value that is incompatible with the current node schema.
- The chat trigger is disabled, leaving execute-subworkflow as the effective entry point.
- Session cleanup should eventually move to a guaranteed failure/finally path.

### 7. Scrape Ads

The workflow integrates research, Sheets, media analysis, and creative generation in a small graph.

Deferred issues:

- `Generate a video in Google Gemini` uses a `video` resource that the installed node version rejects.
- Sheet writes and media generation need idempotency keys before retries can safely be added.
- No workflow-level failure notification exists.

### 8. Asset Management API

The four webhook routes are cleanly separated and all nodes are connected. Write operations were intentionally left without retries.

Critical deferred issue:

- SQL is built with direct string interpolation from webhook input. Replace it with parameterized queries and add webhook authentication/tenant authorization before publishing the draft.

### 9. Chat AI Agent - Asset Management

The graph is concise and separates tenant validation from read tools. SQL expression syntax was repaired in the connected database nodes.

Critical deferred issues:

- SQL tools interpolate tenant/user input directly and need parameterized queries.
- The agent system-message expression still lacks a valid expression prefix; individual validation requires full subnode context.
- `set_tenant_context` may mutate connection/session state and should not be retried automatically.

### 10. PI Attorney Lead Qualifier

This is a focused lead-intake flow with memory, attorney/prospect email, and Sheets persistence.

Deferred issues:

- Sensitive personal-injury intake data needs explicit retention, redaction, and access rules.
- Email and Sheets writes need an idempotency strategy before retrying.
- Gmail operations rely on omitted default discriminators.

## Validation evidence

- All 33 changed node configurations passed `validate_node_config` after the edits.
- Node counts and connection graphs are unchanged for all ten workflows.
- The published `activeVersionId` is unchanged for all ten workflows.
- The execution list remains exactly IDs `1` and `2`; this audit created no execution.
- Every draft has a named version-history entry and its pre-audit migration version remains available for rollback.

## Recommended next approvals

1. Rotate and migrate the TwelveData API key to credentials.
2. Parameterize SQL and add webhook authentication for both asset workflows.
3. Resolve duplicate AI-model connections in On-demand calling and Nano Photoshop.
4. Repair upgraded-node incompatibilities in Voice Assistant, Browser Agent, and Scrape Ads.
5. Choose an error-notification pattern, then publish a dedicated shared Error Trigger workflow if desired.
6. Review the ten drafts in the editor; publish only after explicit approval and controlled test executions.

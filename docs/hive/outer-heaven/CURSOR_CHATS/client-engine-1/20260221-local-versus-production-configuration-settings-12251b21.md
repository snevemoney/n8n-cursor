---
chatId: 12251b21-c3ee-4ea4-b7d5-e20a322a45b6
workspace: client-engine-1
source: cursor
title: "Local versus production configuration settings"
updated: 1771718052008
messageCount: 9
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Local versus production configuration settings

**Workspace:** `client-engine-1`  
**Chat ID:** `12251b21-c3ee-4ea4-b7d5-e20a322a45b6`  
**Messages:** 9  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/12251b21-c3ee-4ea4-b7d5-e20a322a45b6/12251b21-c3ee-4ea4-b7d5-e20a322a45b6.jsonl`

## What you asked

- what might have been set locally, not on prod but should (or the other way around)?

---

- both. make a checklist

---

- i mostly work on prod so i dont want to get mixed up with dev

## Assistant (excerpts)

- Checking for `.env.example` and how env vars are used in the app:

---

- Checking capture and other env-only usage:

---

- Here’s a concise summary of what’s likely set only locally vs only in prod, and what should or shouldn’t be.

---

## Set locally, should **not** be in prod

| Variable | Why |
|----------|-----|
| **`AUTH_DEV_PASSWORD`** | Lets you log in as any email with one password and skips the DB. Your `.env` has it; the comment says “Remove in production.” The code only uses it when `NODE_ENV === "development"`, so if it’s set on prod it’s ignored (and you get a console warning), but it’s safer to leave it unset on prod. |
| **`NEXTAUTH_URL=http://localhost:3000`** | Must be the real app URL in prod (e

---

- Here’s a single checklist you can keep in the repo (e.g. as `docs/ENV_CHECKLIST.md`) or copy into your notes.

---

## Environment checklist (local + production)

Use this to audit what’s set locally vs on the server and avoid drift.

---

### Local only (do **not** set in production)

| Variable | Set locally? | Set in prod? | Notes |
|----------|--------------|--------------|--------|
| `AUTH_DEV_PASSWORD` | ✅ Optional | ❌ No | Dev login bypass; code ignores it when `NODE_ENV !== 'development'`. |
| `NEXTAUTH_URL` | ✅ `http://localhost:3000` | — | Prod uses real URL (see below). |
| `DATABAS

---

- Here’s a **prod-focused** checklist so you don’t mix in dev when you mostly work on prod.

---

## Production-only checklist (avoid mixing in dev)

Use this when you’re setting or checking the **server / prod** `.env`. Treat local as “don’t copy from here.”

---

### Never set on prod (do not copy from local)

| Variable | Why |
|----------|-----|
| `AUTH_DEV_PASSWORD` | Dev-only login bypass. Leave **unset** on prod. |
| `NEXTAUTH_URL=http://localhost:3000` | Prod must use the real app URL. |
| `DATABASE_URL=...localhost:5432...` | Prod must use the prod database. |
| `REDIS_URL=redis://local

## Composer meta

- Name: Local versus production configuration settings
- Subtitle: Read auth.ts, .env.example, docker-compose.yml, VPS_DEPLOY_CHECKLIST.md, .env

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260221-email-and-password-access-issue-42b0f013|Email and password access issue]]
- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]
- [[20260226-website-performance-issues-2db66e24|Website performance issues]]
- [[20260222-deployment-from-dev-to-prod-2094e507|Deployment from dev to prod]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->

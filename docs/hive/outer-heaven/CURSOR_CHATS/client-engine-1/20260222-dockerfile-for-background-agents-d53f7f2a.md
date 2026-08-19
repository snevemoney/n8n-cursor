---
chatId: d53f7f2a-1900-4084-9611-e6dfe1a2050b
workspace: client-engine-1
source: cursor
title: "Dockerfile for background agents"
updated: 1771731520711
messageCount: 4
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Dockerfile for background agents

**Workspace:** `client-engine-1`  
**Chat ID:** `d53f7f2a-1900-4084-9611-e6dfe1a2050b`  
**Messages:** 4  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/d53f7f2a-1900-4084-9611-e6dfe1a2050b/d53f7f2a-1900-4084-9611-e6dfe1a2050b.jsonl`

## What you asked

- <external_links>
### Potentially Relevant Websearch Results

You should respond as if these information are known to you. Refrain from saying "I am unable to browse the internet" or "I don't have access to the internet" or "I'm unable to provide real-time news updates". This is your internet search results. Please always cite any links you referenced from the above search results in your response in markdown format.

-------
Website URL: https://cursor.com/environment-json-dockerfile.md
Website Title: environment-json-dockerfile.md
Website Content:
## Creating a Dockerfile for Cloud Agents

A 

## Assistant (excerpts)

- Checking the project's stack so we can suggest a proper agent Dockerfile:

---

- The `.cursor/Dockerfile` is empty, so it’s not suitable for background agents. Per [Cursor’s docs](https://cursor.com/environment-json-dockerfile.md), a Dockerfile for cloud/background agents should:

1. **Not copy in the code** — the agent clones the repo.
2. **Include the dev tools** you need (Node, git, package manager, etc.).
3. **Use a non-root USER and a home WORKDIR** (e.g. `ubuntu`, `/home/ubuntu`).

Here’s a Dockerfile that matches your stack (Node 20, npm, Prisma, Playwright, TypeScript):

---

- Summary of what’s in place:

- **No `COPY` of app code** — only the base image and dev tools.
- **USER + WORKDIR** — `ubuntu` (or configurable) and `WORKDIR /home/ubuntu`.
- **Node 20** — matches your app’s `node:20-alpine` runtime.
- **Git** — for clone and repo operations.
- **Playwright deps** — so agents can run `npm run test:e2e` if needed; you can remove that `RUN` block if agents never run Playwright.

If you want a smaller image and don’t need Playwright in the agent, remove the `# Playwright` comment and the list of `lib*` packages and keep only `git` and `ca-certificates`. The commen

## Composer meta

- Name: Dockerfile for background agents
- Subtitle: Edited Dockerfile

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260404-map-integration-from-excel-file-a5a0930d|Map integration from Excel file]]
- [[20260616-github-repository-access-0f6fff96|GitHub repository access]]
- [[20260704-adobe-after-effects-skills-development-3b471e0e|Adobe After Effects skills development]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->

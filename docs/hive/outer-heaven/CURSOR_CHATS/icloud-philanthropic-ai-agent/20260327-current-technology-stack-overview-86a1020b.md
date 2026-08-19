---
chatId: 86a1020b-b20d-4d3b-8ff2-7e9b573790ad
workspace: icloud-philanthropic-ai-agent
source: cursor
title: "Current technology stack overview"
updated: 1774578205374
messageCount: 163
archived: false
projects: ["[[PROJECTS/n8n-cursor]]", "[[PROJECTS/philanthropic-ai-agent]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Current technology stack overview

**Workspace:** `icloud-philanthropic-ai-agent`  
**Chat ID:** `86a1020b-b20d-4d3b-8ff2-7e9b573790ad`  
**Messages:** 163  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-Library-Mobile-Documents-com-apple-CloudDocs-philanthropic-ai-agent/agent-transcripts/86a1020b-b20d-4d3b-8ff2-7e9b573790ad/86a1020b-b20d-4d3b-8ff2-7e9b573790ad.jsonl`

## What you asked

- whats our current stack (language, DB, which LLMs, VPS specs)? so I can sketch concrete function signatures and file structure

---

- is that from what we currently have on github?

---

- is that from what we currently have on vps?

---

- lsb_release -a || cat /etc/os-release
free -h
df -h
pm2 list
systemctl --user status openclaw-gateway
docker ps
ss -lntp | egrep ':(3002|8000|5432|6333|6379|18789)\b'

---

- lsb_release -a || cat /etc/os-release
free -h
df -h
pm2 list
systemctl --user status openclaw-gateway
docker ps
ss -lntp | egrep ':(3002|8000|5432|6333|6379|18789)\b'

---

- that is the output

---

- ss -lntp | egrep ':(3002|8000|5432|6333|6379|18789)\b'

---

- root@srv765579:~# lsb_release -a || cat /etc/os-release
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 24.04.3 LTS
Release:        24.04
Codename:       noble
root@srv765579:~# free -h
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       1.8Gi       213Mi       6.5Mi       6.0Gi       5.9Gi
Swap:          4.0Gi       1.9Gi       2.1Gi
root@srv765579:~# df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           795M  1.8M  793M   1% /run
/dev/sda1        96G   87G  9.7G  90% /
tmpfs           3.9G  1

## Assistant (excerpts)

- ## The least confusing + safest path (given what you want)
**Yes: Option 2 is the right call.**  
Make **OpenClaw the only component that ever selects/calls LLMs** (primary + fallback), and keep **Philanthropy as a pure tool executor** (Qdrant, Postgres, Brave, Todoist, SMTP/IMAP, Kling/FAL, etc.).

That’s the cleanest long-term mental model:

- **OpenClaw = “brain”** (LLM calls, model choice, fallbacks, tool orchestration)
- **Philanthropy = “hands”** (deterministic tools + persistence + integrations)

## Why you felt confused (you’re not wrong)
Right now the repo has **LLM SDKs inside Philan

---

- **Clarifying philanthropy keys**

I need to clarify that the philanthropy's .env.example file still has the ANTHROPIC_API_KEY, but that's only for the native tools in philanthropy. If we centralize the LLM in OpenCl

---

- ## The least confusing + safest model
**Make OpenClaw the only component that ever calls/chooses LLMs (OAuth primary + API-key fallbacks).**  
Keep Philanthropy as **pure tool execution** (Qdrant, Postgres, Brave, email, etc.) with **zero LLM codepaths**.

That way:
- **One place** owns “which model/provider did we use?” + retries/fallback.
- Philanthropy never needs `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`, so you avoid split-brain auth.

You already said you want this. Good call.

---

## What “OAuth fallback” should mean in OpenClaw
In OpenClaw terms there are **two separate knobs**:

1) **Au

---

- ### What you have *right now* (from your VPS snippets)
- Your agents already have a **model fallback configured**:

  - `primary`: `anthropic/claude-sonnet-4-6`
  - `fallbacks`: `openai/gpt-4o`

  (shown in the `bigboss` / `solidsnake` blocks you pasted)

- But your **openclaw-gateway systemd environment** (what the running process can actually use) currently shows only things like:

  - `PHILANTHROPY_WEBHOOK_URL=...`
  - `ORGO_[REDACTED]
  - `OPENCLAW_GATEWAY_*`

  It **does not show `OPENAI_API_KEY`**, which is the most common reason fallbacks “exist in JSON” but never actually work.

### Th

---

- Use SSH from your local terminal.

```bash
ssh root@69.62.66.78
```

If your key is not default:
```bash
ssh -i ~/.ssh/<your_key_file> root@69.62.66.78
```

If root login is disabled, use your user:
```bash
ssh <username>@69.62.66.78
```

If port is non-standard:
```bash
ssh -p <port> root@69.62.66.78
```

After connecting, confirm host quickly:
```bash
hostname && whoami && pwd
```

If you want, I can give you a tiny “first 5 commands after login” checklist specific to your OpenClaw/Philanthropy setup.

## Composer meta

- Name: Current technology stack overview
- Subtitle: Read telegram-posting.ts, telegram.ts, openai.ts, anthropic.ts, route.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/philanthropic-ai-agent]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260320-vps-health-check-and-pm2-status-8f6ce894|VPS health check and pm2 status]]
- [[20260320-vps-disk-usage-and-resource-overview-fe85dd27|VPS disk usage and resource overview]]
- [[20260323-tool.md-file-in-openclaw-workspace-65580f3d|Tool.md file in openclaw workspace]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260325-branch-cleanup-and-typescript-errors-b647570a|Branch cleanup and TypeScript errors]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->

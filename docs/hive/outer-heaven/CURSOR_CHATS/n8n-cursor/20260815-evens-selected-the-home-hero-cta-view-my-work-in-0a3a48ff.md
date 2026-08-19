---
chatId: 0a3a48ff-532e-4afc-b78b-c93835c4b05c
workspace: n8n-cursor
source: cursor
title: "Evens selected the home hero CTA \u201cView my work\u201d in the browser preview. It still has `href=/pro/work`. It must go to the"
updated: 2026-08-15T22:29:02.332340+00:00
messageCount: 7
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Evens selected the home hero CTA “View my work” in the browser preview. It still has `href=/pro/work`. It must go to the

**Workspace:** `n8n-cursor`  
**Chat ID:** `0a3a48ff-532e-4afc-b78b-c93835c4b05c`  
**Messages:** 7  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/c7f2f99c-2f1e-4dff-b245-29e61bad49df/subagents/0a3a48ff-532e-4afc-b78b-c93835c4b05c.jsonl`

## What you asked

- Evens selected the home hero CTA “View my work” in the browser preview. It still has `href=/pro/work`. It must go to the real catalog: `https://evenslouis.ca/work` (path `/work`), not the duplicate `/pro/work`.

Repo: /Users/evenslouis/client-engine-1
Likely file: `src/app/page.tsx` (hero: `section.flex-shrink-0` … `a.inline-flex.items-center.gap-2.bg-white` “View my work”).
SiteLink / `siteHref` / `base-path.ts` were just changed — they are still emitting `/pro/work` for this CTA. Fix that.

DO NOT send / pay / deploy / book / publish. DO NOT commit. DO NOT mint icp_id. DO NOT open new tabs.


## Assistant (excerpts)

- Source already has a catalog exception, but the preview still shows `/pro/work` — I'll trace `siteHref`, the running build, and any leftover prefixing.

---

- The preview is still on stale `next/link`, which prefixes `basePath` `/pro`. I’ll emit a raw `/work` href and stop SiteLink from adding that prefix.

---

- Parent already touched some of those files — I’ll re-read them and apply the remaining catalog-href fixes.

---

- Core CTA files are updated. Next I’ll grep for leftover `/pro/work` catalog links and run the unit tests.

---

- The hero **View my work** button now points at **`/work`**.

`next/link` was prefixing Next’s `basePath` (`/pro`) onto the catalog. That CTA is a raw `<a href="/work">` so it cannot pick up `/pro`. `siteHref` / `SiteLink` also leave `/work` alone and rewrite leftover `/pro/work` to `/work` (same rule as the 308 alias). `/pro` login is unchanged.

**Hero href:** `/work`

**Files**
- `src/app/page.tsx` — hero CTA
- `src/lib/base-path.ts` + `src/lib/base-path.test.ts`
- `src/components/site/SiteLink.tsx`
- `src/app/campaigns/[slug]/page.tsx`, `src/app/proof/[slug]/page.tsx`, `src/app/demos/[slug]

## Files touched

- `scripts/hive/grok-skills/checkable-stop.md`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260815-evens-https-evenslouis.ca-work-is-the-real-catal-d49faf0f|Evens: https://evenslouis.ca/work is the **real** ]]
- [[20260815-implement-evens-s-correction-in-users-evenslouis-53bd9e4e|Implement Evens's correction in `/Users/evenslouis]]
- [[20260815-fix-evenslouis.ca-client-engine-catalog-case-pag-efb61348|Fix evenslouis.ca / Client Engine catalog + case-p]]
- [[20260815-evens-asked-do-our-system-and-agents-work-this-w-49b662c5|Evens asked: do our system and agents work this wa]]
- [[20260814-evens-asked-test-prospects-leads-clients-buyers--7c7a4163|Evens asked: test prospects, leads, clients, buyer]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->

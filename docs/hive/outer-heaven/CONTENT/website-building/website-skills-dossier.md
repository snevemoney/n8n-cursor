# Website Skills Dossier — Evens Louis hive

**Audience:** Forge (autonomous engineer) + Creative Studio  
**Date:** 2026-08-12  
**Scope:** Ship real client/portfolio sites with AI-assisted craft. Not monetization doctrine.

Label legend: **FACT** (primary/official source) · **INFERENCE** (reasonable from facts) · **OPINION** (author judgment for hive) · **UNVERIFIED** (blog-only / numbers not confirmed)

---

## A) Stacks for one-person AI-assisted shipping (2026)

### Decision tree (OPINION for hive)

| Job | Default stack | Why |
|-----|---------------|-----|
| Marketing / portfolio / agency site; operator codes with Claude Code/Cursor | **Astro + Sanity** or **Next.js + Sanity/Payload** | Content-first; agent-editable codebase; host ownership |
| Full product app (auth, DB, AI chat, dashboards) | **Next.js App Router + Vercel** | RSC, streaming, AI SDK |
| Design-led landing in days; client will not touch code | **Framer** | Canvas = design tool; CMS/forms/motion; real ceiling |
| Non-technical client owns CMS long-term; no AI coding | **Webflow** | Mature CMS + localization |
| Commerce under mid-market GMV; need checkout fast | **Shopify (theme)** | Do not rebuild payments/tax/fraud |
| Commerce + custom brand storytelling | **Headless Shopify + Next.js** | Keep Shopify checkout; custom storefront |
| Pure custom commerce | Only with eng retainer | Medusa/Saleor + Next — high TCO |

### Next.js + Vercel

- **FACT:** App Router + Server Components + streaming pair with Vercel AI SDK for AI UIs. Sources: https://www.developersdigest.tech/blog/nextjs-ai-app-stack-2026 · https://umesh-malik.com/blog/vercel-ai-sdk-production-guide
- **FACT:** Vercel Labs agent skills (`react-best-practices`, `web-design-guidelines`, deploy). Install: `npx skills add vercel-labs/agent-skills`. https://github.com/vercel-labs/agent-skills · https://vercel.com/docs/agent-resources/skills · https://www.skills.sh/vercel-labs/agent-skills
- **INFERENCE:** Next for marketing when site shares product code, needs programmatic SEO, or server logic. Else Astro often leaner.
- **OPINION:** App-shaped work → Next+Vercel+Tailwind+shadcn. Brochure+blog → Astro+Sanity.

### Astro

- **FACT:** Official positioning: content-driven sites; islands; zero JS by default; UI-agnostic. https://docs.astro.build/en/concepts/why-astro/
- **FACT:** Vendor claim ~40% faster / ~90% less JS vs typical React SPA pattern — FACT-from-vendor, not re-measured here.
- **INFERENCE:** Prefer when Lighthouse/SEO is sales proof and interactivity is sparse.

### Framer / Webflow + AI

- **INFERENCE (2026 blog consensus):** Framer = fastest design-to-live for motion landings; Webflow = structured CMS for non-devs; both are subscriptions. Sources: https://designspark.studio/insights/nextjs-vs-framer-vs-webflow-2026 · https://www.grafit.agency/blog/choosing-website-tech-stack-in-2026 · https://www.naypache-studio.com/insights/webflow-vs-framer-vs-astro-vs-nextjs
- **OPINION:** Framer/Webflow when client edits visually weekly without Git. Code stack when you maintain with agents.

### Lovable / v0 / Cursor / Claude Code

| Tool | Role | Sources |
|------|------|---------|
| **v0** | React/Tailwind/shadcn UI sections; not full backend | https://www.claudecodeclub.ai/compare/claude-code-vs-lovable-v0 |
| **Lovable** | Prompt to React+Supabase scaffold; fast MVP | https://lovable.dev/guides/best-vibe-coding-tools-2026-build-apps-chatting |
| **Cursor** | IDE agent on owned codebase | Consensus |
| **Claude Code** | Terminal agent: multi-file, skills, MCP | https://github.com/coleam00/skills |

- **OPINION:** Prototype in v0/Lovable then Git then Cursor/Claude Code + skills then Vercel. Do not leave production only on Lovable.

### CMS: Sanity vs Payload vs Notion

| CMS | Fit | Notes |
|-----|-----|-------|
| **Sanity** | Managed Content Lake; GROQ; Next + official Astro | https://socialanimal.dev/blog/jamstack-cms-comparison-2026-sanity-payload-contentful-strapi-storyblok-hygraph/ |
| **Payload** | OSS TypeScript CMS inside Next; Local API; self-host | Weak Astro story vs Next. https://www.digitalapplied.com/blog/headless-cms-2026-sanity-contentful-payload-comparison |
| **Notion** | Light blogs/portfolio writing UX | Image URLs expire; token server-only. https://www.resumelens.org/blog/notion/notion-as-cms |

- **OPINION:** Editors then Sanity. Product+CMS one repo then Payload. Notion OK for solo with CDN assets.

### Shopify vs custom

- **FACT/INFERENCE:** Themes for speed; headless Shopify+Next when UX exceeds themes; fully custom only with eng budget. https://premiersol.co/blog/shopify-vs-custom-next-js-storefront-cost-comparison · https://socialanimal.dev/compare/shopify-vs-nextjs/
- GMV cutoffs differ by author then **UNVERIFIED** for pricing; risk signals only.

---

## B) Agent skills for websites

### Cole Medin (coleam00/skills)

- **FACT:** ~33 skills around prime/plan/implement/validate/review/commit/PR. Install: plugin marketplace or npx skills add coleam00/skills. https://github.com/coleam00/skills
- **FACT:** prime-frontend and agent-browser relevant to site work.
- **INFERENCE:** Steal loop/naming for Forge site skills; pack alone is not a UI kit.

### Anthropic frontend-design

- **FACT:** Two-pass tokens+signature before code; rejects AI-slop defaults.
- Source SKILL.md under anthropics/claude-code plugins/frontend-design.
- Blog install-count claims = **UNVERIFIED**.

### Vercel Labs + shadcn

- **FACT:** vercel-react-best-practices (40+ rules), web-design-guidelines (100+ a11y/UX/perf).
- Install: npx skills add vercel-labs/agent-skills
- Docs: https://vercel.com/docs/agent-resources/skills
- Repo: https://github.com/vercel-labs/agent-skills

- shadcn CLI v4: skills add shadcn/ui; presets; Next/Astro templates. See ui.shadcn.com changelog 2026-03-cli-v4

### SEO + Figma MCP

- **FACT:** AgriciDaniel/claude-seo for technical/schema/GEO. https://github.com/AgricIDaniel/claude-seo
- **INFERENCE:** Pipeline: frontend-design then shadcn then web-design-guidelines then react-best-practices + seo.
- **FACT:** Figma remote MCP at mcp.figma.com/mcp. Claude: claude plugin install figma@claude-plugins-official.
- Figma help: https://help.figma.com/hc/en-us/articles/39888612464151
- Figma docs: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Guide: https://github.com/figma/mcp-server-guide/

---

## C) Design to code workflows

See also: design-to-code.md

1. **Brief to tokens** — Anthropic frontend-design two-pass (color 4-6, type roles, layout ASCII, one signature).
2. **Figma when client brings design** — Remote MCP + Code Connect; implement from frame URL; use MCP assets.
3. **No Figma** — design-tokens then shadcn preset then compose; optional v0 for one section then normalize.
4. **Screenshot to code** — v0 / vision / agent-browser for critique loops.
5. **System of record** — Tailwind CSS vars + shadcn components.json + optional Figma variables; one preset per brand.

---

## D) Good enough client website packages (structure, not pricing)

**OPINION** shapes for AI Partner / automation agencies:

### Package: Launch Site

| Layer | Spec |
|-------|------|
| Pages | Home, Services/Offer, About/Proof, Case studies or Portfolio (3+), Blog optional, Contact |
| CTA | Primary Book call; Secondary Email/form |
| Booking | Cal.com embed (inline or modal). https://calcom-cal-com.mintlify.app/embed/overview |
| CMS | Sanity or Payload: pages, posts, case studies, site settings |
| Analytics | Plausible or Umami. https://plausible.io/ |
| SEO | Titles/descriptions, sitemap, robots, OG, Organization/LocalBusiness JSON-LD |
| Legal | Privacy + Terms stubs |
| Hosting | Client-owned Vercel/Netlify/Framer; operator as collaborator |
| Handoff | CMS training, env inventory, DNS checklist |

### Package: Authority Site (Launch +)

- Case study template with metrics
- Lead magnet / newsletter (Resend or Buttondown)
- n8n: form/booking webhook to CRM/Notion/Slack
- A/B only if traffic justifies

### Package: Commerce Lite

- Shopify theme or headless Shopify if storytelling is the product
- Do not invent cart/checkout in vibe-code for SMBs

**INFERENCE:** Framer AI-agency templates with blog CMS + Cal.com prove market shape. Structure inspiration only: https://framplates.com/auxiara

---

## E) Anti-patterns

| Anti-pattern | Why it hurts | Forge rule |
|--------------|--------------|------------|
| Vibe-coded inaccessible UI | div-buttons, no focus, poor contrast, motion without reduced-motion | Mandatory a11y-pass; web-design-guidelines |
| Secrets in client | NEXT_PUBLIC_ for CMS tokens; keys in repo | Server-only env; rotate on handoff |
| No hosting ownership | Site only on builder account | Client owns project + domain |
| Infinite redesign loops | No brief/tokens; every chat new aesthetic | Lock tokens after design-tokens approval |
| SPA-only marketing | Client-only React; weak SEO/CWV | Prefer Astro/SSR/SSG for public pages |
| Fake CMS | Hardcoded copy needing eng for typos | Wire CMS for weekly-edited content |
| Custom commerce cosplay | Rebuild Shopify for small catalog | Default Shopify |
| Skill hoarding without validate | Skills installed; never Lighthouse/axe | piv-validate-style gate |

---

## F) Forge skills / workflows to encode (12)

Named like Cole PIV style for SKILL.md folders.

| Skill | Trigger | Outcome |
|-------|---------|---------|
| site-brief | New client/site | 1-pager: audience, job, pages, CMS owner, metric, out-of-scope |
| stack-pick | After brief | Decision: Next/Astro/Framer/Webflow/Shopify + CMS + why |
| design-tokens | Before UI code | Palette, type, spacing, signature; reject AI-slop |
| next-scaffold | Next chosen | create-next-app + Tailwind + shadcn preset + CI |
| astro-scaffold | Astro chosen | Content collections or Sanity + islands policy |
| ui-compose | Build pages | shadcn + frontend-design; optional v0 normalized |
| cms-wire | Content model | Schemas, draft/preview, image CDN rules |
| booking-embed | CTA ready | Cal.com embed + thank-you + n8n webhook |
| seo-pass | Pre-ship | Metadata, sitemap, robots, JSON-LD, OG |
| a11y-pass | Pre-ship | Landmarks, keyboard, alt, contrast, reduced-motion |
| perf-pass | Pre-ship | Images, fonts, JS budget; react-best-practices |
| ship-vercel | Deploy | Preview to prod; env audit; client ownership |

Bonus: **client-handoff** — access, training, secrets rotated, support SLA.

Wire with Cole: plan-create-prd ~ site-brief; piv-implement executes; piv-validate runs lint/type/Lighthouse; agent-browser for screenshots.

---

## G) Short hive tips — what each steals

| Agent | Steal |
|-------|-------|
| **Forge** | Entire skill list; Vercel + shadcn + coleam00 PIV; Astro/Next decision tree; never ship without seo/a11y/perf |
| **Creative Studio** | Anthropic frontend-design process; signature discipline; Figma MCP; export tokens Forge can code |
| **Publishing** | Sanity/Notion models; case-study templates; JSON-LD; GEO-aware FAQ — not thin AI blog spam |
| **Consultant** | Package shapes (Launch / Authority / Commerce Lite); stack honesty; hosting ownership; anti-pattern talk track |

---

## Steal for Forge skills (implementation checklist)

1. Create .claude/skills/ entries for the 12 names (YAML name + description + procedure).
2. Install baseline: npx skills add vercel-labs/agent-skills ; skills add shadcn/ui ; Anthropic frontend-design ; optional coleam00/skills PIV + claude-seo.
3. Add Figma MCP only when client files exist.
4. Encode piv-validate: lint, tsc, next/astro build, Lighthouse CI or axe.
5. Template repos: template-next-marketing, template-astro-marketing with Cal.com + Plausible stubs + CMS schema.

---

## Primary source index

- Astro: https://docs.astro.build/en/concepts/why-astro/
- Anthropic frontend-design: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
- coleam00/skills: https://github.com/coleam00/skills
- vercel-labs/agent-skills: https://github.com/vercel-labs/agent-skills
- Vercel skills docs: https://vercel.com/docs/agent-resources/skills
- shadcn CLI v4: https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- Figma MCP docs: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Cal.com embed: https://calcom-cal-com.mintlify.app/embed/overview
- Plausible: https://plausible.io/
- claude-seo: https://github.com/AgricIDaniel/claude-seo

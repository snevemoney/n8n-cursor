# Vercel + Next.js patterns for Forge (2026)

Companion to website-skills-dossier.md.
Labels: FACT / INFERENCE / OPINION / UNVERIFIED

---

## Default app scaffold (OPINION)

When stack-pick chooses Next:
1. create-next-app App Router + TS + Tailwind + ESLint
2. shadcn init with hive preset (CLI v4)
3. npx skills add vercel-labs/agent-skills
4. skills add shadcn/ui
5. Optional Anthropic frontend-design before page UI

## Routing and rendering
- FACT: App Router + RSC keep data/secrets on server; stream UI.
- INFERENCE: Prefer SSG/ISR for public marketing; dynamic SSR for auth/app.
- OPINION: No client-only marketing SPA. Mostly content? Reconsider Astro.

## Metadata and SEO (seo-pass)
- generateMetadata: title, description, openGraph, twitter, canonical
- app/sitemap.ts and app/robots.ts
- JSON-LD Organization / LocalBusiness / Article as needed
- One OG image strategy
- Deeper audits: github.com/AgricIDaniel/claude-seo

## Performance (perf-pass)
- FACT: Vercel react-best-practices encodes 40+ rules (github.com/vercel-labs/agent-skills).
- INFERENCE: next/image with sizes; next/font subset; no heavy libs on marketing home without islands.
- AI SDK routes need abortSignal + rate limits; SDK owns transport not policy.

## Accessibility (a11y-pass)
- FACT: web-design-guidelines audits 100+ UI rules.
- Checklist: real button/a/label; visible focus; Escape closes dialogs; prefers-reduced-motion; decorative alt=""; landmarks.

## AI features (optional)
- FACT: Vercel AI SDK streamText / useChat for streaming UIs.
- OPINION: Brochure sites rarely need on-site chatbots day one. Prefer Cal.com + n8n.

## Env, secrets, deploy
- Never put CMS/Stripe secrets in NEXT_PUBLIC_*
- CMS fetches in server components or route handlers only
- Preview per PR; production on CLIENT Vercel team; operator = collaborator
- Rotate keys at handoff

## When NOT to use Next (OPINION)
- Pure marketing + blog: Astro
- Client owns visual CMS without Git: Webflow/Framer
- Simple commerce: Shopify theme first

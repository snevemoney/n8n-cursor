# MCP Connector Demo

A minimal Next.js 14 App Router demo that live-reads GitHub data and renders it server-side. Proves connector-backed UI works with real public API data — no mocks.

## What it does

- Fetches the latest open Pull Requests from `snevemoney/n8n-cursor` via the GitHub REST API
- Renders them server-side with ISR (revalidate every 60 seconds)
- Shows PR title, number, author, update date, and links
- Includes a client-side Refresh button that triggers `router.refresh()` for immediate re-fetch

## Run locally

```bash
# From workspace root
pnpm install
pnpm --filter mcp-connector-demo dev

# Or from this directory
cd apps/mcp-connector-demo
pnpm install
pnpm dev
```

Open [http://localhost:3005](http://localhost:3005).

## Port

**3005** (configured in package.json scripts).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | Optional GitHub PAT for higher rate limits. The app works without it since the repo is public. |

If you want to set it:

```bash
echo "GITHUB_TOKEN=ghp_your_token_here" > .env.local
```

## Build

```bash
pnpm build
```

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Server-side data fetching with ISR (`next: { revalidate: 60 }`)
- No external UI library — inline styles with dark theme tokens (`#0A0A0C` bg, `#5B8CFF` accent)

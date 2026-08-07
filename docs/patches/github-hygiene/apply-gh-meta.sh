#!/usr/bin/env bash
# Requires: gh auth as a user with admin on snevemoney/* repos
set -euo pipefail

apply() {
  local repo="$1"
  local desc="$2"
  shift 2
  echo "==> $repo"
  gh repo edit "snevemoney/$repo" --description "$desc" "$@"
}

apply n8n-cursor \
  "Hive monorepo: evenslouis.ca path map, portfolio, Scorpion, n8n tooling. Not Client Engine or Outer Heaven." \
  --add-topic monorepo --add-topic n8n --add-topic nextjs --add-topic scorpion --add-topic caddy --add-topic hive \
  --homepage "https://evenslouis.ca/"

apply client-engine \
  "Private Client Engine business OS (leads/builds/proofs). Operator-only at /pro — not ProofCheck or Scorpion." \
  --add-topic business-os --add-topic crm --add-topic nextjs --add-topic prisma --add-topic operator-only \
  --homepage "https://evenslouis.ca/pro"

apply philanthropic-ai-agent \
  "Outer Heaven hands: OpenClaw Telegram agent tool API. Not Scorpion UI, not Client Engine, not a public SaaS." \
  --add-topic openclaw --add-topic telegram --add-topic multi-agent --add-topic outer-heaven --add-topic hive

apply outer-heaven-backups \
  "Outer Heaven encrypted hourly backups (AES-256, 7 versions). Ops infra — not the agent runtime." \
  --add-topic backups --add-topic ops --add-topic outer-heaven --add-topic encrypted

apply shield-buddies \
  "SENTINEL — offline Quebec emergency PWA (supplies, check-ins, OSINT, vault). Not Clearfield investigation workbench." \
  --add-topic pwa --add-topic emergency-preparedness --add-topic offline-first --add-topic quebec --add-topic osint

apply clipengine \
  "ClipEngine — rights-aware stream clip detect→review→publish. Phase 0 WIP. Not Bookflix; not Outer Heaven Creator." \
  --add-topic stream-clipping --add-topic nestjs --add-topic bullmq --add-topic content-ops --add-topic wip

apply trendspotter-ai \
  "TikTok→ticker→Kalshi trend scanner (WIP). Not OpenClaw Scout/Radar and not Client Engine lead intel." \
  --add-topic tiktok --add-topic trend-detection --add-topic kalshi --add-topic supabase --add-topic wip

apply proof-qc-assist \
  "ProofCheck QC — nursing claim verification (EN/FR). Not Client Engine proofs, InsightsLM, or Clearfield." \
  --add-topic nursing-education --add-topic claim-verification --add-topic academic --add-topic bilingual --add-topic wip

apply autoflow-finance \
  "Auto-loan finance desk (income OCR, credit/funding queues) — side WIP. Not Client Engine or LightningFlow." \
  --add-topic auto-finance --add-topic fintech --add-topic ocr --add-topic supabase --add-topic side-project

apply book-reimagined \
  "Bookflix — book→AI scenes→watch UX (side WIP). Not ClipEngine stream clipping." \
  --add-topic book-to-video --add-topic ai-scenes --add-topic supabase --add-topic side-project --add-topic wip

apply quick-list-hub-42 \
  "QuickMarket — local classifieds (side WIP, demo payments). Not LightningFlow or Client Engine." \
  --add-topic marketplace --add-topic classifieds --add-topic supabase --add-topic side-project

apply clearfield-evidence-flow \
  "Clearfield — OSINT evidence/claims workbench (capability). Feeds SENTINEL intel; not a second emergency PWA." \
  --add-topic osint --add-topic evidence --add-topic knowledge-graph --add-topic fact-checking --add-topic capability

apply insights-lm-private \
  "InsightsLM — self-hosted NotebookLM-style RAG. Reserved /insights later; not a parallel public product vs Scorpion RAG." \
  --add-topic notebooklm --add-topic rag --add-topic n8n --add-topic supabase --add-topic hive-capability

apply lightning-ui \
  "LEGACY Lightning business OS dump. Prefer apps/lightningflow in n8n-cursor. Do not develop in parallel." \
  --add-topic legacy --add-topic lightning-network --add-topic archive

apply lightningflow \
  "SUPERSEDED stub. Canonical LightningFlow is apps/lightningflow in snevemoney/n8n-cursor (parked)." \
  --add-topic legacy --add-topic superseded --add-topic lightning-network

echo "Done. Paste headers from docs/patches/github-hygiene/headers/ into each README."

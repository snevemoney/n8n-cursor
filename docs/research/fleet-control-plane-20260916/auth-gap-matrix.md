# Auth gap matrix — Phase 2 Control Plane

**Census evidence:** 2026-09-16 ~17:31 ET (immutable snapshot live-probes)
**Policy:** Never request or store secret values. No MCP connects / routine changes in this packet.
**recommended_next enum:** `reconnect MCP` | `login CLI` | `leave HOLD` | `broker later`

| Surface | Path | Evidence | Auth state | Impact | Recommended next |
|---|---|---|---|---|---|
| Vercel CLI | cli | CLI 59.16.0 on PATH; whoami logged out; config dir without login token keys | logged_out | Cannot deploy/promote via CLI; does not unblock MCP Vercel | **login CLI** |
| Vercel MCP | mcp | GetMcpServerStatus: Vercel needsAuth tools=0 | needs_auth | No MCP deploy/project tools until reconnect; capability:vercel rollup=broken | **reconnect MCP** |
| AWS | cli | aws-cli/2.36.44 present; NoCredentials; credentials/config files MISSING | logged_out | Cloud infra via AWS unusable; no owning desk for AWS work | **leave HOLD** |
| gcloud | cli | Google Cloud SDK 584.0.0; no credentialed accounts; credentials.db REF broken | logged_out | GCP workflows blocked | **leave HOLD** |
| Stripe | cli+api | stripe CLI 1.50.5 present; API keys ABSENT in config.toml | logged_out | Money Desk stripe-cfo-weekly-scan cannot observe live Stripe; advise-only remains | **broker later** |
| Docker daemon | local_service | Docker CLI OK; daemon socket permission denied | none | Container runtime actions fail; CLI alone insufficient | **leave HOLD** |
| Canva | mcp | needsAuth tools=0 | needs_auth | Creative extras via Canva MCP unavailable; Higgsfield still usable for CapEx | **leave HOLD** |
| Lovable | mcp | needsAuth tools=0 | needs_auth | Lovable app-builder path unavailable | **leave HOLD** |
| Heygen | mcp | needsAuth tools=0 | needs_auth | Avatar/video gen via Heygen blocked; Higgsfield alternative may cover CapEx | **leave HOLD** |
| Amplitude | mcp | needsAuth tools=0 | needs_auth | Product analytics MCP unavailable | **leave HOLD** |
| Prisma-Remote | mcp | needsAuth tools=0; Prisma-Local connected (3 tools) as separate plane | needs_auth | Remote Prisma cloud features blocked; local Prisma still OK | **leave HOLD** |
| gh CLI (vs MCP Github) | cli vs mcp | gh CLI logged out; MCP Github connected tools=45 | cli=logged_out; mcp=authenticated | CLI-only GitHub workflows BROKEN; API/MCP GitHub WORKS — different auth planes | **login CLI** |
| credential provider / 1Password | local_service | GetCredentialProviderStatus: not connected; saved=0; no op/1password status files | logged_out | Secret injection / broker path UNKNOWN/BROKEN; cannot safely hydrate Stripe/AWS/etc. | **broker later** |

## Notes by row

### Vercel CLI
- **id:** `vercel_cli`
- **notes:** CLI login alone insufficient for MCP plane; still subject to live `/` HOLD + Tier-3 HITL on deploy

### Vercel MCP
- **id:** `vercel_mcp`
- **notes:** Primary recommended path for agent routing once reconnected; NEVER request secret values in chat

### AWS
- **id:** `aws`
- **notes:** Defer until operator decides broker vs CLI login; no secret capture

### gcloud
- **id:** `gcloud`
- **notes:** Same deferral as AWS unless a concrete GCP task appears

### Stripe
- **id:** `stripe`
- **notes:** Prefer credential broker/provider when available; never paste API keys into graph or chat

### Docker daemon
- **id:** `docker_daemon`
- **notes:** Needs host/socket permission fix by operator — not an MCP reconnect

### Canva
- **id:** `canva`
- **notes:** Reconnect only if CapEx workflow explicitly needs Canva

### Lovable
- **id:** `lovable`
- **notes:** Not on critical path for current building-mode cycle

### Heygen
- **id:** `heygen`
- **notes:** Public Ironlane HOLD still applies even after reconnect

### Amplitude
- **id:** `amplitude`
- **notes:** Reconnect when analytics instrumentation is in-scope

### Prisma-Remote
- **id:** `prisma_remote`
- **notes:** Do not confuse with Prisma-Local (verified connected)

### gh CLI (vs MCP Github)
- **id:** `gh_cli_vs_mcp`
- **notes:** Optional: login gh for CLI workflows; prefer MCP for agent routing. Do not infer one plane from the other.

### credential provider / 1Password
- **id:** `credential_provider_1password`
- **notes:** Operator-owned reconnect; NEVER request secret values; graph stores REF only

## Auth-plane reminders

1. **gh CLI ≠ MCP Github** — CLI logged out; MCP authenticated (45 tools). Prefer MCP for routing.
2. **Vercel CLI ≠ MCP Vercel** — both broken; reconnect MCP is the agent-primary fix; CLI login is secondary.
3. **Prisma-Local ≠ Prisma-Remote** — Local connected; Remote needsAuth.
4. **Credential broker** — required before safely hydrating Stripe/AWS/gcloud without pasting secrets.
5. **Deploy / money / send** remain Tier-3 HITL + building mode + live `/` HOLD even after auth recovery.

## Sources

- `/workspace/research/packets/fleet-reentry-20260916-IMMUTABLE-SNAPSHOT/live-probes-20260916.md`
- `/workspace/research/packets/fleet-reentry-20260916-IMMUTABLE-SNAPSHOT/shared-surface.md`
- `/workspace/research/packets/fleet-reentry-20260916-IMMUTABLE-SNAPSHOT/FLEET_REPORT.md`

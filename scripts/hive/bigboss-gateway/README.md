# BigBoss Context Gateway — slice 1

Organizational memory API between ElevenLabs (voice) and GitHub. Hive process, not a sold product.

**Home:** `scripts/hive/bigboss-gateway` — same lane as other hive HTTP helpers (`ce-hive-bridge`). Not a second app in `apps/`.

Locked path (2026-08-28): phone → Twilio → ElevenLabs Big Boss → this gateway (HMAC or Bearer) → compact facts → spoken answer.

Do **not** dump live org state into the ElevenLabs Knowledge Base. One broad read tool. Write tools stay later and HITL-gated.

```
DONE-CHECK: tests green + curl returns a compact briefing or unavailable:github
CAP: slice 1 only (GitHub public API + static org pack)
COST: this sitting — no ElevenLabs publish, no prod host
STOP-KIND: metric
```

## HITL — do not merge main / do not prod-deploy from this PR

Public HTTPS + ElevenLabs wire = operator. This PR is local/code only.

- Do not merge to `main` from this PR as a ship.
- Do not prod-deploy.
- Do not paste a real secret into chat, git, or the tool JSON.
- Do not call ElevenLabs APIs. Do not publish the agent.
- Do not activate n8n. Do not clone other repos.

## Local run

```bash
cd scripts/hive/bigboss-gateway
export BIGBOSS_GATEWAY_SECRET='choose-a-local-secret-never-commit-it'
# optional: export GITHUB_TOKEN='…'   # otherwise unauthenticated public API
# optional: export BIGBOSS_GATEWAY_PORT=3210
# optional: export BIGBOSS_GATEWAY_HOST=127.0.0.1
node src/index.js
```

Binds **127.0.0.1** only. `GET /healthz` is unauthenticated. Every `/v1/*` route fail-closes if the secret is unset.

## Env vars

| Name | Required | Purpose |
| --- | --- | --- |
| `BIGBOSS_GATEWAY_SECRET` | yes for `/v1` | HMAC key and Bearer token. Unset → 401. |
| `GITHUB_TOKEN` | no | Raises GitHub rate limit. Public API works without it. |
| `BIGBOSS_GATEWAY_HOST` | no | Default `127.0.0.1` |
| `BIGBOSS_GATEWAY_PORT` | no | Default `3210` |

Never commit a real secret. Do not put these values in markdown.

## Auth

Fail-closed.

1. `x-voice-signature`: HMAC-SHA256 of the **raw body**, hex.
2. `Authorization: Bearer <BIGBOSS_GATEWAY_SECRET>` — same secret, for ElevenLabs (it typically cannot HMAC the body).

## Curl

HMAC (body bytes must match the signature):

```bash
BODY='{"query":"look at my signals","scope":"all","time_range":"7d","depth":"standard","caller_class":"CEO"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$BIGBOSS_GATEWAY_SECRET" | awk '{print $2}')"
curl -sS http://127.0.0.1:3210/v1/organizational_search \
  -H 'Content-Type: application/json' \
  -H "x-voice-signature: $SIG" \
  -d "$BODY"
```

Bearer:

```bash
curl -sS http://127.0.0.1:3210/v1/ceo_briefing \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BIGBOSS_GATEWAY_SECRET" \
  -d '{}'
```

Personalization (ElevenLabs conversation-initiation webhook):

```bash
curl -sS http://127.0.0.1:3210/v1/personalization \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BIGBOSS_GATEWAY_SECRET" \
  -d '{"caller_id":"+14384019991","agent_id":"agent_0001m12xxdbge58ttc2701w67nyk"}'
```

`+14384019991` or any ANI ending in `4019991` → CEO vars. Anyone else → PUBLIC empty pack (no private project names, no money).

## Tests

```bash
cd scripts/hive/bigboss-gateway
node --test tests/*.test.js
```

Covers: secret unset + bad signature, GitHub shaper from fixtures (no network), CEO vs PUBLIC, responses never contain tokens/secrets.

If this sandbox has no GitHub egress, live curl may return `unavailable: ["github"]`. That is correct. Tests still prove the shaper.

## ElevenLabs paste files

Operator pastes later. Do not publish from this PR.

- `elevenlabs/organizational_search.tool.json`
- `elevenlabs/ceo_briefing.tool.json`

Replace `https://YOUR_PUBLIC_HOST` after a HITL public host exists. Set ElevenLabs secret / env var `BIGBOSS_GATEWAY_SECRET` and send it as `Authorization: Bearer …`. Optional local header: `x-voice-signature`.

Conversation-initiation URL (when you wire it): `POST /v1/personalization` with the same auth.

## Sources (slice 1)

- **Wired:** GitHub public API for `snevemoney/n8n-cursor` and `snevemoney/client-engine` (open PRs + recent commits).
- **Not wired:** memory, Grok, Obsidian. `scope=memory` or `all` lists those names in `unavailable`.
- If GitHub fails: `unavailable` includes `github`. Never invent PRs.

Open PR whose title says "fix" / done / ship → `kind` is **attempted**, not completed, and a `possible_conflicts` row says so.

## Org pack (static, no secrets)

CEO Evens Louis. Building mode `factory_os`. Voice line `+1 825 450 1273`. Agent id `agent_0001m12xxdbge58ttc2701w67nyk`. No money. No vault paths.

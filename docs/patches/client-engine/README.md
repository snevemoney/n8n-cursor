# Client Engine `/pro` path + Auth.js fixes

These patches belong in `snevemoney/client-engine` (VPS: `/root/client-engine`).

They are mirrored here because this cloud agent’s Cursor GitHub App installation
currently only includes `snevemoney/n8n-cursor` (`repository_selection=selected`,
`total_count=1`). Calls to `snevemoney/client-engine` return **404 Not Found**
for the agent token even when the human owner has granted access elsewhere.

## Grant access to this agent

In GitHub → **Settings → Applications → Cursor** (GitHub App) → **Repository access**:

1. Either choose **All repositories**, or
2. **Only select repositories** and add **`client-engine`** (exact name).

Then re-run / resume the agent so it gets a new installation token.

Verify with:

```bash
gh api /installation/repositories --jq '.repositories[].full_name'
# should list snevemoney/client-engine
```

## Apply on a machine that already has the repo

```bash
cd /path/to/client-engine
git checkout -b cursor/domain-path-consolidation-59dd
git apply docs/../   # or copy from n8n-cursor:
git apply /path/to/n8n-cursor/docs/patches/client-engine/pro-path-auth-basepath.diff
# key files also under files/ if apply fails
```

## Already applied live on VPS

- Auth.js basePath + request rewrite for `/pro`
- `docker-compose.yml` `pro` service on `:3204`
- `DATABASE_URL` host fixed to `postgres` (not a bridge IP)
- Apex Caddy `/api*` → Client Engine `:3200` (see `infra/caddy/Caddyfile.evenslouis.prod`)

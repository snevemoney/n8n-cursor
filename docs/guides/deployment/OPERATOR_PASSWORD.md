# Operator password procedure

Used by Caddy `basic_auth` on operator paths (`/pro`, `/n8n` UI, `/scorpion`, `/lightningflow`, `/builder`, related apex API/asset routes).

## Create or rotate

```bash
# 1) Create a strong password (example)
openssl rand -base64 24

# 2) Hash for Caddy (run on VPS or any machine with caddy)
caddy hash-password --plaintext 'PASTE_PASSWORD_HERE'

# 3) Install on VPS
install -m 600 /dev/null /etc/caddy/ops.env
cat >/etc/caddy/ops.env <<'EOF'
OPS_USER=evens
OPS_PASS_HASH='PASTE_HASH_HERE'
EOF

# 4) Ensure Caddy loads the env (systemd)
# EnvironmentFile=-/etc/caddy/ops.env

systemctl daemon-reload
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

## Verify

```bash
# Should be 401 without credentials
curl -sI https://evenslouis.ca/n8n/home/workflows | head -5

# Should succeed with credentials (then app may still require n8n login)
curl -sI -u 'evens:YOUR_PASSWORD' https://evenslouis.ca/n8n/healthz | head -5

# Webhooks must NOT require basic_auth (expect non-401 from n8n itself)
curl -sI https://evenslouis.ca/n8n/webhook/test-does-not-exist | head -5
```

Store the plaintext password only in a password manager. Never commit `ops.env` or hashes into the repo.

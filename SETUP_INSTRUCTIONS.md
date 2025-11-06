# LightningFlow AI - Setup Instructions

## 🚨 Quick Fix for 502 Bad Gateway

**Run this on your VPS to diagnose the issue:**

```bash
# Upload and run the diagnostic script
./scripts/diagnose-502.sh
```

**Most likely fixes:**

1. **Services not running:**
   ```bash
   # Start your services
   docker compose -f infra/docker/docker-compose.int.yml up -d
   ```

2. **Caddy not configured:**
   ```bash
   # Copy the production Caddyfile
   sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile
   sudo caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

3. **Port conflicts:**
   ```bash
   # Check what's using your ports
   sudo netstat -tlnp | grep -E ':80|:443|:3000|:3001|:3002|:4000|:5678'
   ```

## 🖥️ Local Development Setup

### 1. Add Local Domains to /etc/hosts

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 lightningflow.local
127.0.0.1 app.lightningflow.local
127.0.0.1 ops.lightningflow.local
127.0.0.1 api.lightningflow.local
127.0.0.1 n8n.local
127.0.0.1 mail.local
127.0.0.1 logs.local
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp env.dev.example .env.dev

# Edit with your values
nano .env.dev
```

**Required values:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE` - Your Supabase service role key
- `LNBITS_API_KEY` - Your LNbits dev wallet key

### 3. Start Local Development Stack

```bash
# Start all services with friendly domains
docker compose -f infra/docker/docker-compose.dev.yml up -d --build

# Check health
for h in lightningflow.local app.lightningflow.local ops.lightningflow.local api.lightningflow.local n8n.local; do
  echo "== $h =="; curl -sw 'status:%{http_code} t:%{time_total}\n' -o /dev/null http://$h/healthz || true;
done
```

### 4. Access Your Local Services

- **Landing:** http://lightningflow.local
- **Customer App:** http://app.lightningflow.local  
- **Ops Dashboard:** http://ops.lightningflow.local
- **API:** http://api.lightningflow.local/healthz
- **n8n:** http://n8n.local
- **Email (MailHog):** http://mail.local
- **Logs:** http://logs.local

## 🚀 Production Deployment

### 1. VPS Setup

```bash
# On your VPS, create production environment
cp env.dev.example .env.production
nano .env.production  # Fill with production values

# Deploy production stack
docker compose -f infra/docker/docker-compose.prod.yml up -d

# Configure Caddy
sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 2. Cloudflare Configuration

**DNS Settings:**
- `lightningflow.online` → Your VPS IP (orange cloud ON)
- `app.lightningflow.online` → Your VPS IP (orange cloud ON)
- `ops.lightningflow.online` → Your VPS IP (orange cloud ON)
- `n8ncloud.tech` → Your VPS IP (orange cloud ON)

**SSL/TLS Settings:**
- Mode: Full (strict)
- Edge Certificates: Always Use HTTPS ON

### 3. Health Checks

```bash
# Test all production endpoints
for d in lightningflow.online app.lightningflow.online ops.lightningflow.online n8ncloud.tech; do
  echo "== $d =="; curl -sw 'status:%{http_code} t:%{time_total}\n' -o /dev/null https://$d/healthz;
done
```

## 🔧 Troubleshooting

### 502 Bad Gateway
1. Run `./scripts/diagnose-502.sh` on VPS
2. Check if services are running: `docker ps`
3. Check Caddy logs: `sudo journalctl -u caddy -f`
4. Verify port bindings: `ss -Hlnpt | grep -E ':80|:443|:3000|:3001|:3002|:4000|:5678'`

### Local Development Issues
1. Check if ports are free: `lsof -i :80`
2. Verify /etc/hosts entries
3. Check Docker containers: `docker compose -f infra/docker/docker-compose.dev.yml ps`
4. View logs: `docker compose -f infra/docker/docker-compose.dev.yml logs -f`

### Environment Variables
- Never commit `.env.*` files to git
- Use different Supabase projects for dev/staging/prod
- Use different LNbits wallets for each environment
- Keep production secrets secure

## 📋 Next Steps

1. **Fix 502 issue** using diagnostic script
2. **Set up local dev** with friendly domains
3. **Configure production** with proper secrets
4. **Test all endpoints** for health checks
5. **Set up monitoring** and alerts

## 🆘 Need Help?

If you're still getting 502 errors:
1. Run the diagnostic script and share the output
2. Check if your VPS has enough resources
3. Verify your domain DNS is pointing to the VPS
4. Check Cloudflare SSL/TLS mode is set to "Full (strict)"

# Portfolio Deployment Checklist ✅

Complete checklist for deploying the portfolio to your VPS.

## Pre-Deployment Validation ✅

All required files are verified:

- ✅ `apps/portfolio/app/page.tsx` - Main portfolio page
- ✅ `apps/portfolio/app/layout.tsx` - Root layout
- ✅ `apps/portfolio/app/globals.css` - Dark theme styles
- ✅ `apps/portfolio/package.json` - Contains `"start": "PORT=4010 next start"`
- ✅ `apps/portfolio/deploy.sh` - Deployment script
- ✅ `apps/portfolio/DEPLOYMENT.md` - Deployment guide
- ✅ `apps/portfolio/app/healthz/route.ts` - Health check endpoint
- ✅ `tooling/ports.yml` - Port 4010 registered
- ✅ `infra/caddy/Caddyfile` - Portfolio route configured

## Deployment Commands (Run on VPS)

### Step 1: Create Directory

```bash
mkdir -p ~/portfolio
cd ~/portfolio
```

### Step 2: Upload Files

**Choose one method:**

**Option A: rsync (from local machine)**
```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /Users/evenslouis/n8n-cursor/apps/portfolio/ \
  user@your-vps-ip:~/portfolio/
```

**Option B: Git (if repo is on GitHub)**
```bash
# On VPS
cd ~/portfolio
git clone <your-repo-url> .
cd apps/portfolio
```

**Option C: Manual Upload**
```bash
# Upload portfolio folder via SFTP/SCP, then:
cd ~/portfolio
```

### Step 3: Install Dependencies

```bash
cd ~/portfolio
npm install
```

### Step 4: Build Application

```bash
npm run build
```

**Verify build:**
```bash
ls -la .next
# Should show .next directory
```

### Step 5: Start with PM2

```bash
pm2 start npm --name "portfolio" -- start
pm2 save
pm2 status portfolio
```

### Step 6: Update Caddy Configuration

```bash
# Backup current Caddyfile
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)

# Copy updated Caddyfile (adjust path as needed)
# If you have the monorepo on VPS:
sudo cp ~/path/to/infra/caddy/Caddyfile /etc/caddy/Caddyfile

# Or manually add portfolio route to existing Caddyfile:
sudo nano /etc/caddy/Caddyfile
```

**Verify Caddyfile includes:**
```caddy
portfolio.n8ncloud.tech {
    import common
    reverse_proxy localhost:4010
}
```

**Reload Caddy:**
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy
```

### Step 7: Test Health Endpoint

```bash
# Local test
curl http://localhost:4010/healthz
# Expected: {"status":"ok"}

# HTTPS test (after DNS propagates)
curl https://portfolio.n8ncloud.tech/healthz
# Expected: {"status":"ok"}
```

### Step 8: Configure DNS

**Add A record in your DNS provider:**

- **Name:** `portfolio`
- **Type:** `A`
- **Value:** `[Your VPS IP Address]`
- **TTL:** `3600`

**Verify DNS:**
```bash
dig portfolio.n8ncloud.tech +short
# Should return your VPS IP
```

**Wait for DNS propagation:** 5-60 minutes

## Post-Deployment Validation

### Run Validation Script

```bash
# On VPS or local machine
bash scripts/check-portfolio.sh
```

### Manual Verification

```bash
# 1. Check PM2
pm2 status portfolio
pm2 logs portfolio --lines 20

# 2. Check local health
curl http://localhost:4010/healthz

# 3. Check HTTPS health
curl https://portfolio.n8ncloud.tech/healthz

# 4. Check DNS
dig portfolio.n8ncloud.tech +short

# 5. Check Caddy
sudo systemctl status caddy
```

## Quick Reference Commands

### Start Portfolio
```bash
cd ~/portfolio
pm2 start npm --name "portfolio" -- start
pm2 save
```

### Stop Portfolio
```bash
pm2 stop portfolio
```

### Restart Portfolio
```bash
pm2 restart portfolio
```

### View Logs
```bash
pm2 logs portfolio
```

### Update Portfolio
```bash
cd ~/portfolio
git pull  # if using git
npm install
npm run build
pm2 restart portfolio
```

### Check Status
```bash
pm2 status portfolio
curl http://localhost:4010/healthz
```

## Troubleshooting Quick Fixes

### PM2 Not Running
```bash
pm2 start npm --name "portfolio" -- start
pm2 save
```

### Port Already in Use
```bash
sudo lsof -i :4010
# Kill process or change port in package.json
```

### Caddy Not Routing
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo journalctl -u caddy -f
```

### SSL Certificate Issues
```bash
# Check DNS first
dig portfolio.n8ncloud.tech +short

# Check Caddy logs
sudo journalctl -u caddy | grep -i ssl

# Reload Caddy
sudo systemctl reload caddy
```

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Success Criteria ✅

- [ ] PM2 shows portfolio as "online"
- [ ] `curl http://localhost:4010/healthz` returns `{"status":"ok"}`
- [ ] `curl https://portfolio.n8ncloud.tech/healthz` returns `{"status":"ok"}`
- [ ] Browser shows portfolio at https://portfolio.n8ncloud.tech
- [ ] No errors in PM2 logs
- [ ] No errors in Caddy logs
- [ ] DNS resolves correctly

## Final Verification

```bash
echo "=== PM2 Status ==="
pm2 status portfolio

echo "=== Local Health ==="
curl -s http://localhost:4010/healthz

echo "=== HTTPS Health ==="
curl -s https://portfolio.n8ncloud.tech/healthz

echo "=== DNS Check ==="
dig portfolio.n8ncloud.tech +short

echo "=== Caddy Status ==="
sudo systemctl status caddy --no-pager | head -5
```

## 🎉 Success!

If all checks pass, your portfolio is live at:

**https://portfolio.n8ncloud.tech**

Visit the site in your browser to confirm!


# 🚀 Portfolio Deployment - Final Commands

**Complete deployment pipeline ready. Copy and paste these commands on your VPS.**

## ✅ Pre-Deployment Validation Complete

All files verified:
- ✅ Portfolio app structure complete
- ✅ Health endpoint configured
- ✅ Caddyfile updated
- ✅ Port 4010 registered
- ✅ Deployment scripts created
- ✅ Validation script ready

## 📋 Exact Commands to Run on Your VPS

### Step 1: Create Directory

```bash
mkdir -p ~/portfolio
cd ~/portfolio
```

### Step 2: Upload Portfolio Files

**Choose ONE method:**

**Method A: rsync (from your local Mac)**
```bash
# Run this from your local machine
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /Users/evenslouis/n8n-cursor/apps/portfolio/ \
  user@your-vps-ip:~/portfolio/
```

**Method B: Git Clone (if repo is on GitHub)**
```bash
# On VPS
cd ~/portfolio
git clone <your-repo-url> .
cd apps/portfolio
```

**Method C: Manual Upload**
- Use SFTP/SCP to upload the `apps/portfolio` folder
- Extract to `~/portfolio/` on VPS

### Step 3: Install Dependencies

```bash
cd ~/portfolio
npm install
```

### Step 4: Build Application

```bash
npm run build
```

**Verify build succeeded:**
```bash
ls -la .next
# Should show .next directory
```

### Step 5: Start with PM2

```bash
# Start portfolio
pm2 start npm --name "portfolio" -- start

# Save PM2 process list (survives reboots)
pm2 save

# Verify it's running
pm2 status portfolio
```

**Expected output:**
```
┌─────────────┬────┬─────────┬──────┬──────────┐
│ Name        │ id │ mode    │ ↺    │ status   │
├─────────────┼────┼─────────┼──────┼──────────┤
│ portfolio   │ 0  │ cluster │ 0    │ online   │
└─────────────┴────┴─────────┴──────┴──────────┘
```

### Step 6: Test Local Health Endpoint

```bash
curl http://localhost:4010/healthz
```

**Expected response:**
```json
{"status":"ok"}
```

### Step 7: Update Caddy Configuration

**Option A: Copy Updated Caddyfile (if you uploaded it)**

```bash
# Backup current Caddyfile
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)

# Copy updated Caddyfile (adjust path as needed)
sudo cp ~/path/to/infra/caddy/Caddyfile /etc/caddy/Caddyfile
```

**Option B: Manually Add Portfolio Route**

```bash
# Edit Caddyfile
sudo nano /etc/caddy/Caddyfile

# Add this block (if not already present):
portfolio.n8ncloud.tech {
    import common
    
    @health path /healthz
    handle @health {
        respond 200 {
            body "OK"
            header Content-Type "text/plain"
        }
    }
    
    handle {
        reverse_proxy 127.0.0.1:4010 {
            health_uri /
            health_interval 30s
            health_timeout 5s
            
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Host {host}
            header_up X-Real-IP {remote_host}
        }
    }
}
```

**Validate and Reload Caddy:**

```bash
# Validate configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy (no downtime)
sudo systemctl reload caddy

# Check status
sudo systemctl status caddy
```

### Step 8: Configure DNS

**Add A Record in Your DNS Provider:**

- **Name:** `portfolio`
- **Type:** `A`
- **Value:** `[Your VPS IP Address]`
- **TTL:** `3600`

**Verify DNS:**

```bash
dig portfolio.n8ncloud.tech +short
# Should return your VPS IP address
```

**Wait for DNS propagation:** 5-60 minutes

### Step 9: Test HTTPS Endpoint

```bash
# After DNS propagates
curl https://portfolio.n8ncloud.tech/healthz
```

**Expected response:**
```json
{"status":"ok"}
```

### Step 10: Run Validation Script

```bash
# From your local machine or VPS
bash scripts/check-portfolio.sh
```

**Or manually verify:**

```bash
# Check PM2
pm2 status portfolio

# Check local health
curl http://localhost:4010/healthz

# Check HTTPS health
curl https://portfolio.n8ncloud.tech/healthz

# Check DNS
dig portfolio.n8ncloud.tech +short

# Check Caddy
sudo systemctl status caddy
```

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] VPS SSH access confirmed
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PM2 installed (`pm2 --version` or `npm install -g pm2`)
- [ ] Caddy installed and running (`sudo systemctl status caddy`)

### Deployment Steps
- [ ] Created `~/portfolio` directory
- [ ] Uploaded portfolio files
- [ ] Installed dependencies (`npm install`)
- [ ] Built application (`npm run build`)
- [ ] Started with PM2 (`pm2 start npm --name "portfolio" -- start`)
- [ ] Saved PM2 process list (`pm2 save`)
- [ ] Updated Caddyfile with portfolio route
- [ ] Validated Caddyfile (`sudo caddy validate`)
- [ ] Reloaded Caddy (`sudo systemctl reload caddy`)
- [ ] Configured DNS A record
- [ ] Verified DNS resolution

### Post-Deployment Validation
- [ ] PM2 shows portfolio as "online"
- [ ] Local health check passes (`curl http://localhost:4010/healthz`)
- [ ] HTTPS health check passes (`curl https://portfolio.n8ncloud.tech/healthz`)
- [ ] Browser shows portfolio at https://portfolio.n8ncloud.tech
- [ ] No errors in PM2 logs (`pm2 logs portfolio`)
- [ ] No errors in Caddy logs (`sudo journalctl -u caddy`)

## 🔧 Quick Troubleshooting

### PM2 Not Running
```bash
cd ~/portfolio
pm2 start npm --name "portfolio" -- start
pm2 save
pm2 logs portfolio
```

### Port Already in Use
```bash
sudo lsof -i :4010
# Kill the process or change port in package.json
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

# Check Caddy logs for SSL errors
sudo journalctl -u caddy | grep -i ssl

# Reload Caddy
sudo systemctl reload caddy
```

### Build Errors
```bash
cd ~/portfolio
rm -rf .next node_modules
npm install
npm run build
```

## 📊 All-in-One Verification Command

```bash
echo "=== PM2 Status ===" && \
pm2 status portfolio && \
echo "" && \
echo "=== Local Health ===" && \
curl -s http://localhost:4010/healthz && \
echo "" && \
echo "=== HTTPS Health ===" && \
curl -s https://portfolio.n8ncloud.tech/healthz && \
echo "" && \
echo "=== DNS Check ===" && \
dig portfolio.n8ncloud.tech +short && \
echo "" && \
echo "=== Caddy Status ===" && \
sudo systemctl status caddy --no-pager | head -5
```

## 🎉 Success!

If all checks pass, your portfolio is live at:

**https://portfolio.n8ncloud.tech**

Visit the site in your browser to confirm everything is working!

## 📝 Files Reference

- **Deployment Guide:** `apps/portfolio/DEPLOYMENT.md`
- **VPS Instructions:** `apps/portfolio/VPS_DEPLOYMENT.md`
- **Checklist:** `apps/portfolio/DEPLOYMENT_CHECKLIST.md`
- **Summary:** `apps/portfolio/DEPLOYMENT_SUMMARY.md`
- **Validation Script:** `scripts/check-portfolio.sh`

## 🚀 Ready to Deploy!

All files are created and validated. Follow the commands above to deploy to your VPS.

**Next Step:** SSH into your VPS and run Step 1!


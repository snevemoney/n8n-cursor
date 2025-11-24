# Portfolio VPS Deployment Instructions

Complete step-by-step guide to deploy the portfolio website to your Hostinger KVM2 VPS.

## Prerequisites

- Access to your Hostinger KVM2 VPS via SSH
- Node.js 18+ installed (`node --version`)
- npm installed (`npm --version`)
- PM2 installed globally (`npm install -g pm2`)
- Caddy installed and running (`sudo systemctl status caddy`)
- DNS A record for `portfolio.n8ncloud.tech` pointing to your VPS IP

## Step-by-Step Deployment

### Step A: Create Directory Structure

```bash
mkdir -p ~/portfolio
cd ~/portfolio
```

### Step B: Upload Portfolio Files

**Option 1: Using rsync (from your local machine)**

```bash
# From your local machine (adjust paths as needed)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /path/to/n8n-cursor/apps/portfolio/ \
  user@your-vps-ip:~/portfolio/
```

**Option 2: Using scp (from your local machine)**

```bash
# From your local machine
scp -r apps/portfolio/* user@your-vps-ip:~/portfolio/
```

**Option 3: Using Git (if repo is on GitHub)**

```bash
# On VPS
cd ~/portfolio
git clone <your-repo-url> .
# Or if already cloned, pull updates
git pull origin main
cd apps/portfolio
```

**Option 4: Manual Upload**

If you prefer manual upload:
1. Zip the portfolio folder locally
2. Upload via SFTP/SCP
3. Extract on VPS: `unzip portfolio.zip -d ~/portfolio`

### Step C: Install Dependencies

```bash
cd ~/portfolio
npm install
```

**Expected output:** Dependencies installed successfully

### Step D: Build the Application

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

**Verify build:**
```bash
ls -la .next
# Should show .next directory with build files
```

### Step E: Start with PM2

```bash
# Start the portfolio app
pm2 start npm --name "portfolio" -- start

# Save PM2 process list (survives reboots)
pm2 save

# Verify it's running
pm2 status portfolio
pm2 logs portfolio --lines 20
```

**Expected PM2 status:**
```
┌─────────────┬────┬─────────┬──────┬──────────┐
│ Name        │ id │ mode    │ ↺    │ status   │
├─────────────┼────┼─────────┼──────┼──────────┤
│ portfolio   │ 0  │ cluster │ 0    │ online   │
└─────────────┴────┴─────────┴──────┴──────────┘
```

### Step F: Update Caddy Configuration

**On your VPS:**

```bash
# Backup current Caddyfile
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)

# Copy updated Caddyfile (adjust path to your monorepo location)
# If you uploaded the Caddyfile:
sudo cp ~/portfolio/../infra/caddy/Caddyfile /etc/caddy/Caddyfile

# Or edit manually to add portfolio route:
sudo nano /etc/caddy/Caddyfile
```

**Verify Caddyfile includes:**

```caddy
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

**Validate and reload Caddy:**

```bash
# Validate configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy (no downtime)
sudo systemctl reload caddy

# Check Caddy status
sudo systemctl status caddy
```

### Step G: Test Health Endpoint

```bash
# Test local health endpoint
curl http://localhost:4010/healthz

# Expected response:
# {"status":"ok"}

# Test via Caddy (if DNS is configured)
curl http://portfolio.n8ncloud.tech/healthz
```

### Step H: Validate DNS Configuration

**Check DNS A record:**

```bash
# Check if DNS resolves correctly
dig portfolio.n8ncloud.tech +short
# Should return your VPS IP address

# Or use nslookup
nslookup portfolio.n8ncloud.tech
```

**If DNS is not configured:**

1. Log into your DNS provider (where n8ncloud.tech is managed)
2. Add an A record:
   - **Name:** `portfolio`
   - **Type:** `A`
   - **Value:** Your VPS IP address
   - **TTL:** `3600` (or default)
3. Wait for DNS propagation (5-60 minutes)
4. Verify: `dig portfolio.n8ncloud.tech +short`

## Post-Deployment Validation

Run the validation script:

```bash
# From your local machine or VPS
bash scripts/check-portfolio.sh
```

Or manually verify:

```bash
# 1. Check PM2 process
pm2 status portfolio

# 2. Check local health
curl http://localhost:4010/healthz

# 3. Check HTTPS (after DNS propagates)
curl https://portfolio.n8ncloud.tech/healthz

# 4. Check in browser
# Visit: https://portfolio.n8ncloud.tech
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 4010
sudo lsof -i :4010

# Kill the process or change port in package.json
```

### PM2 Process Not Starting

```bash
# Check PM2 logs
pm2 logs portfolio --lines 50

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

### Caddy Not Routing

```bash
# Check Caddy logs
sudo journalctl -u caddy -f

# Validate Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy
```

### SSL Certificate Issues

```bash
# Check Caddy logs for SSL errors
sudo journalctl -u caddy | grep -i ssl

# Verify DNS is correct
dig portfolio.n8ncloud.tech +short

# Force certificate renewal (if needed)
sudo systemctl restart caddy
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Maintenance

### Updating the Portfolio

```bash
cd ~/portfolio
git pull  # if using git
npm install  # if dependencies changed
npm run build
pm2 restart portfolio
```

### Viewing Logs

```bash
# PM2 logs
pm2 logs portfolio

# Caddy logs
sudo journalctl -u caddy -f
```

### Stopping the Portfolio

```bash
pm2 stop portfolio
# Or delete completely
pm2 delete portfolio
pm2 save
```

## Security Checklist

- ✅ Portfolio runs on localhost:4010 (not exposed publicly)
- ✅ Caddy handles HTTPS termination
- ✅ Health check endpoint available
- ✅ PM2 keeps process alive
- ✅ No sensitive data in repository
- ✅ Caddy security headers enabled

## Success Criteria

✅ PM2 shows portfolio as "online"
✅ `curl http://localhost:4010/healthz` returns `{"status":"ok"}`
✅ `curl https://portfolio.n8ncloud.tech/healthz` returns `{"status":"ok"}`
✅ Browser shows portfolio at https://portfolio.n8ncloud.tech
✅ No errors in PM2 logs
✅ No errors in Caddy logs

## Final Verification

```bash
# Run all checks
echo "=== PM2 Status ==="
pm2 status portfolio

echo "=== Local Health ==="
curl -s http://localhost:4010/healthz

echo "=== HTTPS Health ==="
curl -s https://portfolio.n8ncloud.tech/healthz

echo "=== Caddy Status ==="
sudo systemctl status caddy --no-pager | head -5
```

If all checks pass, your portfolio is live! 🎉

Visit: **https://portfolio.n8ncloud.tech**


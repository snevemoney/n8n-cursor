# Portfolio Deployment Guide

This guide covers deploying the portfolio website to your VPS.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm installed
- PM2 installed globally (`npm install -g pm2`)
- Caddy configured and running
- DNS record for `portfolio.n8ncloud.tech` pointing to your VPS IP

## Local Development

```bash
cd apps/portfolio
npm install
npm run dev
```

The site will be available at `http://localhost:4010`

## Production Deployment

### Step 1: Build the Application

```bash
cd apps/portfolio
npm install
npm run build
```

### Step 2: Deploy Using the Script

```bash
./deploy.sh
```

This script will:
- Install dependencies if needed
- Build the Next.js app
- Stop any existing portfolio process
- Start the portfolio app with PM2 on port 4010
- Save the PM2 process list

### Step 3: Configure Caddy

The Caddyfile has already been updated with the portfolio route. On your VPS, copy the updated Caddyfile:

```bash
# On your VPS
sudo cp /path/to/infra/caddy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### Step 4: Verify Deployment

1. Check PM2 status:
   ```bash
   pm2 status portfolio
   ```

2. Check PM2 logs:
   ```bash
   pm2 logs portfolio
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:4010/healthz
   ```

4. Visit the site:
   ```
   https://portfolio.n8ncloud.tech
   ```

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build
cd apps/portfolio
npm install
npm run build

# Start with PM2
pm2 start npm --name "portfolio" -- start
pm2 save
```

## Updating the Portfolio

To update the portfolio after making changes:

```bash
cd apps/portfolio
git pull  # if using git
npm install  # if dependencies changed
npm run build
pm2 restart portfolio
```

## Troubleshooting

### Port Already in Use

If port 4010 is already in use:

```bash
# Check what's using the port
sudo lsof -i :4010

# Stop the conflicting process or change the port in package.json
```

### PM2 Process Not Starting

```bash
# Check PM2 logs
pm2 logs portfolio --lines 50

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

### Caddy Not Routing Correctly

```bash
# Check Caddy logs
sudo journalctl -u caddy -f

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Port Configuration

The portfolio runs on port **4010** as registered in `tooling/ports.yml`.

To change the port:
1. Update `apps/portfolio/package.json` scripts
2. Update `infra/caddy/Caddyfile` reverse_proxy port
3. Update `tooling/ports.yml`
4. Restart the app and reload Caddy

## Health Check

The portfolio includes a health check endpoint at `/healthz` that returns:
```json
{"status": "ok"}
```

This is used by Caddy for health monitoring.


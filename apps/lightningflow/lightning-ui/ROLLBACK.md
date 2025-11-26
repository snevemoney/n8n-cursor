# 🚨 LightningFlow UI Rollback & Recovery Guide

## Quick Recovery Commands

### If UI Shows "Basic Dashboard" Instead of Full LightningFlow UI

```bash
# 1. Check what's running on port 3002
lsof -i :3002

# 2. Kill any conflicting processes
pkill -f "next dev"
pkill -f "docker"

# 3. Restart LightningFlow UI
cd apps/lightningflow/lightning-ui
PORT=3002 npm run dev

# 4. Verify UI integrity
curl -s http://localhost:3002/__selfcheck | jq .
```

### If Sidebar/Navigation is Missing

```bash
# 1. Check layout components exist
ls -la src/components/layout/
ls -la src/app/layout.tsx

# 2. Verify ClientLayout is being used
grep -n "ClientLayout" src/app/layout.tsx

# 3. Check BusinessSidebar exists
ls -la src/components/layout/business-sidebar.tsx

# 4. Restart dev server
PORT=3002 npm run dev
```

### If CSS/Styling is Broken

```bash
# 1. Check Tailwind config
cat tailwind.config.js | grep -A 10 "content:"

# 2. Verify globals.css exists
ls -la src/app/globals.css

# 3. Check if globals.css is imported in layout
grep -n "globals.css" src/app/layout.tsx

# 4. Rebuild with clean cache
rm -rf .next node_modules
npm install
npm run build
```

## Production Rollback Procedures

### Docker Deployment Rollback

```bash
# 1. List available images
docker images | grep lightningflow

# 2. Rollback to previous image
docker stop lightningflow-ui
docker rm lightningflow-ui
docker run -d --name lightningflow-ui \
  -p 127.0.0.1:3002:3000 \
  --env-file /etc/lfai/ui.env \
  ghcr.io/YOUR_ORG/lightningflow:web-PREVIOUS_TAG

# 3. Update Caddy reverse proxy
sudo systemctl reload caddy
```

### VPS File-based Rollback

```bash
# 1. List available releases
ls -dt /var/www/releases/ui-*

# 2. Rollback to previous release
sudo ln -sfn /var/www/releases/ui-PREVIOUS_HASH /var/www/ui-current

# 3. Reload web server
sudo systemctl reload caddy
```

## Diagnostic Commands

### Check UI Integrity

```bash
# Self-check endpoint
curl -s http://localhost:3002/__selfcheck | jq .

# Check if full UI is loading
curl -s http://localhost:3002/dashboard | grep -i "lightningai flow"

# Check navigation elements
curl -s http://localhost:3002/dashboard | grep -i "payments hub"
```

### Check Feature Flags

```bash
# Check environment variables
env | grep NEXT_PUBLIC_FF_

# Check if flags are enabled
grep -r "NEXT_PUBLIC_FF_" .env*
```

### Check Port Conflicts

```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Check Docker containers
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

## Prevention Checklist

### Before Every Deploy

- [ ] Run UI integrity tests: `npm run test:ui`
- [ ] Check self-check endpoint: `curl http://localhost:3002/__selfcheck`
- [ ] Verify all navigation sections are visible
- [ ] Test responsive design on mobile viewport
- [ ] Ensure no port conflicts with Docker

### After Every Deploy

- [ ] Verify full UI loads (not basic dashboard)
- [ ] Check all navigation links work
- [ ] Test feature flags are enabled
- [ ] Monitor for any console errors
- [ ] Keep previous 2-3 builds for rollback

## Emergency Contacts

- **UI Issues**: Check this ROLLBACK.md first
- **Port Conflicts**: Kill conflicting processes, restart on different port
- **Missing Components**: Verify file structure, restart dev server
- **CSS Issues**: Check Tailwind config, rebuild with clean cache

## Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Basic Dashboard | Shows monitoring UI instead of LightningFlow | Kill Docker containers, restart on port 3002 |
| Missing Sidebar | No navigation visible | Check ClientLayout, verify BusinessSidebar exists |
| Broken Styling | Unstyled divs | Check Tailwind config, verify globals.css import |
| Port Conflicts | Can't start dev server | Use different port, kill conflicting processes |
| Feature Flags Off | Limited functionality | Set NEXT_PUBLIC_FF_* environment variables |

---

**Remember**: The complete LightningFlow UI should ALWAYS show:
- ✅ BusinessSidebar with 4 sections (Payments, Earnings, Boost, Settings)
- ✅ "LightningAI Flow" header
- ✅ Node status indicator
- ✅ Full navigation menu
- ❌ NOT a basic monitoring dashboard

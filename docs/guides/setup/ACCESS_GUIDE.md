# 🦂 Access Guide - Scorpion & All Apps

## ✅ Production URLs (Unchanged)

These URLs remain **exactly as they were** and continue to work:

- **n8n Cloud**: https://n8ncloud.tech
- **LightningFlow**: https://lightningflow.online

## 🏠 Local Development Access

When running Scorpion locally, you'll see **both** production and local options:

### Starting Apps Locally

```bash
cd /Users/evenslouis/n8n-cursor

# Start all apps
pnpm run dev

# Or start individually:
pnpm --filter scorpion run dev      # Port 3003
pnpm --filter lfai-ops run dev      # Port 3002
pnpm --filter lovable-frontend run dev  # Port 3000
```

### Access URLs

#### Scorpion Dashboard (Main Entry Point)
- **Local**: http://localhost:3003
- Shows both production and local links when running locally

#### Ops Dashboard
- **Local**: http://localhost:3002
- **Production**: (if deployed)

#### Lovable Frontend
- **Local**: http://localhost:3000
- **Production**: (if deployed)

#### Side Hustles
- **LightningFlow Production**: https://lightningflow.online (always accessible)
- **LightningFlow Local**: http://lightningflow.local (shown in Scorpion when running locally)

#### n8n Workflows
- **Production**: https://n8ncloud.tech (always accessible)
- **Local**: http://n8n.local (shown in Scorpion when running locally)

## 🔧 How It Works

### URL Detection Logic

1. **Production Apps** (n8ncloud.tech, lightningflow.online):
   - Always use production URLs
   - No changes to existing behavior

2. **Scorpion Dashboard** (when running locally):
   - Shows **both** production and local links
   - Production links always visible
   - Local links appear when `isLocalDevelopment() === true`

3. **Webhook Configuration**:
   - **Production**: Uses `https://n8ncloud.tech/webhook`
   - **Local**: Uses `http://n8n.local/webhook` (when on localhost/.local)

### Environment Detection

The system detects local vs production based on:
- **Client-side**: `window.location.hostname` (localhost, 127.0.0.1, or .local domains)
- **Server-side**: `process.env.NODE_ENV === 'development'`
- **Override**: `NEXT_PUBLIC_N8N_BASE_URL` environment variable

## 📝 Environment Variables

### For Local Development

Create `.env.local` files in each app:

**apps/scorpion/.env.local**:
```env
NEXT_PUBLIC_N8N_BASE_URL=http://n8n.local/webhook
```

**apps/lovable-frontend/.env.local**:
```env
NEXT_PUBLIC_N8N_BASE_URL=http://n8n.local/webhook
```

**apps/ops/.env.local**:
```env
LNBITS_URL=http://localhost:5000
LNBITS_ADMIN_KEY=your_key_here
```

### For Production

Production apps will automatically use:
- `https://n8ncloud.tech/webhook` for n8n
- `https://lightningflow.online` for LightningFlow

No environment variables needed for production - it's automatic!

## 🚀 Quick Start

1. **Start all apps**:
   ```bash
   cd /Users/evenslouis/n8n-cursor
   pnpm run dev
   ```

2. **Access Scorpion**:
   - Open http://localhost:3003
   - You'll see both production and local links

3. **Access Production**:
   - n8n: https://n8ncloud.tech
   - LightningFlow: https://lightningflow.online
   - These work independently of local development

## ✨ Features

- ✅ Production URLs unchanged and always accessible
- ✅ Local development gets local links automatically
- ✅ Scorpion shows both options when running locally
- ✅ Webhook config switches automatically based on environment
- ✅ No breaking changes to existing production setup

## 🔍 Troubleshooting

### Apps won't start
```bash
# Check if ports are available
pnpm run ports-check

# Reinstall dependencies
pnpm install
```

### Can't access local domains (.local)
- Make sure your `/etc/hosts` has entries:
  ```
  127.0.0.1 n8n.local
  127.0.0.1 lightningflow.local
  127.0.0.1 open-webui.local
  127.0.0.1 anythingllm.local
  ```

### Webhooks not working locally
- Check `NEXT_PUBLIC_N8N_BASE_URL` in `.env.local`
- Verify n8n is running at `http://n8n.local`


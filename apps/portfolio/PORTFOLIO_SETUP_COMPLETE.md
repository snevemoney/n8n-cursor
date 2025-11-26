# Portfolio Website - Setup Complete ✅

## Overview

A personal portfolio website for Evens - AI Automation Developer & Workflow Builder, deployed at **https://portfolio.n8ncloud.tech**

## Project Structure

```
apps/portfolio/
├── app/
│   ├── globals.css          # Dark theme styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main portfolio page
│   └── healthz/
│       └── route.ts         # Health check endpoint
├── deploy.sh                # Deployment script
├── DEPLOYMENT.md            # Deployment guide
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── .eslintrc.json           # ESLint config
├── .gitignore               # Git ignore rules
└── README.md                # Project README
```

## Features

✅ **Dark Theme** - Minimal, clean dark design matching Scorpion aesthetic
✅ **Responsive** - Works on mobile, tablet, and desktop
✅ **All Sections**:
   - Hero section with "hi, I'm Evens"
   - About section with personal story
   - Work Experience (IA Auto Finance, AI Automation Developer, Previous roles)
   - Projects (Scorpion)
   - Education (High School Diploma)
   - Skills (displayed as pill chips)
   - Contact (email)

✅ **Port Configuration** - Runs on port 4010
✅ **Health Check** - `/healthz` endpoint for monitoring
✅ **PM2 Ready** - Configured for PM2 process management
✅ **Caddy Integration** - Ready for reverse proxy setup

## Configuration Files Updated

1. **Caddyfile** (`infra/caddy/Caddyfile`)
   - Added `portfolio.n8ncloud.tech` → `localhost:4010`

2. **Ports Registry** (`tooling/ports.yml`)
   - Registered port `4010` for portfolio service

## Deployment Steps

### On Your VPS:

1. **Copy the portfolio app** to your VPS (if not already there):
   ```bash
   # From your local machine or via git
   ```

2. **Install dependencies**:
   ```bash
   cd ~/portfolio  # or wherever you placed it
   npm install
   ```

3. **Build the app**:
   ```bash
   npm run build
   ```

4. **Start with PM2**:
   ```bash
   pm2 start npm --name "portfolio" -- start
   pm2 save
   ```

5. **Update Caddyfile** on VPS:
   ```bash
   sudo cp /path/to/infra/caddy/Caddyfile /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

6. **Verify**:
   ```bash
   # Check PM2
   pm2 status portfolio
   
   # Test locally
   curl http://localhost:4010/healthz
   
   # Visit site
   curl https://portfolio.n8ncloud.tech
   ```

## Port Conflicts

Port **4010** is now registered. If you need to change it:

1. Update `apps/portfolio/package.json` → `start` script
2. Update `infra/caddy/Caddyfile` → reverse_proxy port
3. Update `tooling/ports.yml` → portfolio port
4. Restart app and reload Caddy

## Design Details

- **Background**: `#0a0d10` (dark)
- **Surface**: `#0f1318` (panels)
- **Text**: `#e4e8ee` (light)
- **Accent**: `#13c6a8` (emerald green)
- **Borders**: `rgba(255, 255, 255, 0.08)` (subtle)
- **Max Width**: `max-w-5xl` (centered container)
- **Avatar**: Circular placeholder with "EL" initials

## Content

All content matches your specifications:
- ✅ Hero with "hi, I'm Evens"
- ✅ Subtitle: "AI Automation Developer & Workflow Builder"
- ✅ About section with your story
- ✅ Work experience with dates
- ✅ Scorpion project details
- ✅ Education (Antoine-Brossard)
- ✅ Skills as pill chips
- ✅ Contact email

## Next Steps

1. **Deploy to VPS** using the steps above
2. **Test locally** first: `npm run dev`
3. **Verify DNS** - Ensure `portfolio.n8ncloud.tech` points to your VPS
4. **Monitor** - Check PM2 logs and Caddy logs
5. **Customize** - Add profile picture, animations, or additional projects as needed

## Files Created

- ✅ Complete Next.js app structure
- ✅ Portfolio page with all sections
- ✅ Health check endpoint
- ✅ Deployment script
- ✅ Deployment documentation
- ✅ Caddy configuration updated
- ✅ Port registry updated

## Ready for Deployment! 🚀

The portfolio is fully configured and ready to deploy. Follow the deployment steps above to make it live at https://portfolio.n8ncloud.tech


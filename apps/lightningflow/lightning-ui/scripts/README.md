# Lightning AI Platform - Development Scripts

This directory contains scripts for managing the Lightning AI Business Node Platform in development and production environments.

## 🚀 Development Scripts

### `start-dev.sh` - Bulletproof Development Server

A comprehensive development startup script that handles cleanup, dependency checking, and health verification.

**Features:**
- ✅ Kills existing Next.js processes
- ✅ Clears corrupted build cache
- ✅ Checks and installs missing dependencies
- ✅ Auto-finds available ports (3000-3010)
- ✅ Performs health checks
- ✅ Shows useful development commands

**Usage:**
```bash
./scripts/start-dev.sh
```

**What it does:**
1. Cleans up any existing Next.js processes
2. Removes `.next` cache directory
3. Verifies critical dependencies (qrcode, @radix-ui/react-slider)
4. Starts development server on available port
5. Waits for server to be ready
6. Tests homepage and dashboard endpoints
7. Displays server information and useful commands

### `dev-utils.sh` - Development Utilities

Quick commands for common development tasks.

**Usage:**
```bash
./scripts/dev-utils.sh <command>
```

**Commands:**
- `status` - Check server status and process info
- `logs` - View recent development logs
- `test` - Test all key endpoints
- `info` - Show development environment info
- `restart` - Quick restart with cache clear
- `fix-deps` - Install missing dependencies
- `help` - Show command help

**Examples:**
```bash
./scripts/dev-utils.sh status
./scripts/dev-utils.sh test
./scripts/dev-utils.sh restart
```

## 🏭 Production Scripts

### `start-prod.sh` - Production Deployment with PM2

Production-ready deployment script using PM2 for process management.

**Features:**
- ✅ PM2 cluster mode with multiple instances
- ✅ Auto-restart on crashes
- ✅ Memory limit monitoring
- ✅ Comprehensive logging
- ✅ Health checks
- ✅ Zero-downtime reloads

**Usage:**
```bash
# Start production server
./scripts/start-prod.sh start

# Other commands
./scripts/start-prod.sh stop
./scripts/start-prod.sh restart
./scripts/start-prod.sh status
./scripts/start-prod.sh logs
./scripts/start-prod.sh monitor
```

**Configuration:**
- **App Name:** lightning-platform
- **Port:** 3000
- **Instances:** 2 (cluster mode)
- **Memory Limit:** 1GB per instance
- **Auto-restart:** Enabled

### `health-monitor.sh` - Health Monitoring

Automatically created by `start-prod.sh` to monitor application health.

**Features:**
- Checks `/api/system-check` endpoint every 60 seconds
- Auto-restarts application on health check failure
- Logs all health check events

## 📁 File Structure

```
scripts/
├── README.md           # This documentation
├── start-dev.sh        # Development server startup
├── start-prod.sh       # Production deployment
├── dev-utils.sh        # Development utilities
└── health-monitor.sh   # Health monitoring (auto-generated)
```

## 🔧 Environment Setup

### Development Requirements
- Node.js 18+
- npm 9+
- curl (for health checks)
- lsof (for port checking)

### Production Requirements
- All development requirements
- PM2 (installed automatically)
- Production environment variables

## 📊 Monitoring & Logs

### Development Logs
- **Next.js trace:** `.next/trace`
- **Console output:** Terminal where script is running

### Production Logs
- **Combined logs:** `logs/combined.log`
- **Output logs:** `logs/out.log`
- **Error logs:** `logs/error.log`
- **PM2 logs:** `pm2 logs lightning-platform`

## 🚨 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3000

# Kill process on port
./scripts/dev-utils.sh restart
```

**Missing dependencies:**
```bash
# Auto-fix missing dependencies
./scripts/dev-utils.sh fix-deps
```

**Build cache issues:**
```bash
# Clear cache and restart
rm -rf .next
./scripts/start-dev.sh
```

**Production deployment issues:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs lightning-platform

# Restart application
./scripts/start-prod.sh restart
```

### Health Check Endpoints

Test these endpoints to verify application health:

- `GET /` - Homepage
- `GET /dashboard` - Main dashboard
- `GET /lightning-test` - Lightning test harness
- `GET /receive` - Payment receiving page
- `GET /transactions` - Transaction history
- `GET /api/system-check` - API health check

## 🔐 Security Notes

### Development
- Scripts automatically clean sensitive cache files
- No production secrets in development mode
- Local-only access (localhost)

### Production
- PM2 process isolation
- Log rotation and management
- Health monitoring with auto-recovery
- Memory limit enforcement

## 🚀 Quick Start

### Development
```bash
# Start development server
./scripts/start-dev.sh

# In another terminal, check status
./scripts/dev-utils.sh status

# Test all endpoints
./scripts/dev-utils.sh test
```

### Production
```bash
# Deploy to production
./scripts/start-prod.sh start

# Monitor in real-time
pm2 monit

# View logs
pm2 logs lightning-platform
```

## 📈 Performance Tips

### Development
- Use `./scripts/dev-utils.sh restart` for quick restarts
- Monitor memory usage with `./scripts/dev-utils.sh info`
- Clear cache regularly if experiencing issues

### Production
- Use `pm2 reload lightning-platform` for zero-downtime updates
- Monitor with `pm2 monit` for real-time metrics
- Set up log rotation for long-running instances

## 🔄 Updates & Maintenance

### Updating Scripts
Scripts are version-controlled with the project. Pull latest changes:
```bash
git pull origin main
chmod +x scripts/*.sh
```

### Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Fix any missing dependencies
./scripts/dev-utils.sh fix-deps
```

---

**Lightning AI Business Node Platform**  
*Professional Bitcoin Lightning Network Business Platform with AI Integration* 
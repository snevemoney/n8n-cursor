# 🔄 Production to Local Sync Guide

This guide explains how to safely sync data from production (n8ncloud.tech, lightningflow.online) to your local development environment **without modifying production**.

## ⚠️ Safety Guarantees

- ✅ **READ-ONLY**: All sync operations only read from production
- ✅ **BACKUPS**: Local data is automatically backed up before sync
- ✅ **REVERSIBLE**: You can restore from backup at any time
- ❌ **NEVER MODIFIES**: Production is never touched

## 🎯 What Gets Synced

### n8n Workflows
- All workflows from n8ncloud.tech
- Workflow configurations, nodes, connections
- Workflow settings and metadata

### n8n Credentials (Manual)
- Credentials are exported but need manual setup
- This is intentional for security (credentials contain API keys)

### Database Schema (Optional)
- If using Supabase, schema syncs automatically
- Local uses same database structure as production

## 🚀 Quick Start

### Method 1: Complete Setup (Recommended)

```bash
# One command does everything
./scripts/complete-local-setup.sh
```

This will:
1. Setup /etc/hosts entries
2. Start all Docker services
3. Verify everything is working

### Method 2: Step by Step

```bash
# 1. Setup local infrastructure
./scripts/setup-local-hosts.sh
./scripts/start-local-services.sh

# 2. Sync production data
./scripts/sync-n8n-via-api.sh
```

## 📋 Sync Methods

### Method A: API Sync (Recommended)

**Best for**: Workflows only, when you have API access

```bash
# Set your production API key
export PROD_N8N_API_KEY='your-api-key-here'

# Run sync
./scripts/sync-n8n-via-api.sh
```

**How to get API key**:
1. Log into https://n8ncloud.tech
2. Go to Settings → API
3. Create a new API key
4. Copy it and use in the script

**Pros**:
- ✅ Works remotely (no SSH needed)
- ✅ Only syncs workflows (safer)
- ✅ Can be automated

**Cons**:
- ⚠️ Credentials need manual setup
- ⚠️ Requires API key

### Method B: Direct File Sync (Advanced)

**Best for**: Complete data sync, when you have SSH access

```bash
# Configure production server details
export PROD_HOST="69.62.66.78"
export PROD_PORT="22222"
export PROD_USER="evens"

# Run sync
./scripts/sync-production-to-local.sh
```

**Prerequisites**:
- SSH key authentication set up
- Access to production n8n data directory

**Pros**:
- ✅ Complete data sync (workflows + credentials)
- ✅ Faster for large datasets

**Cons**:
- ⚠️ Requires SSH access
- ⚠️ More complex setup

## 🔧 Manual Sync Steps

If automated scripts don't work, you can sync manually:

### 1. Export from Production

**Via n8n UI**:
1. Log into https://n8ncloud.tech
2. Go to Workflows
3. Select workflows → Export
4. Save the JSON file

**Via API**:
```bash
curl -H "X-N8N-API-KEY: your-key" \
  https://n8ncloud.tech/api/v1/workflows \
  > production-workflows.json
```

### 2. Import to Local

**Via n8n UI**:
1. Log into http://n8n.local
2. Go to Workflows → Import
3. Upload the JSON file

**Via API**:
```bash
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d @production-workflows.json
```

## 🔐 Credentials Setup

Credentials are **not automatically synced** for security reasons. You need to set them up manually:

1. **In Local n8n** (http://n8n.local):
   - Go to Settings → Credentials
   - Create credentials matching production
   - Use test/development API keys (not production keys!)

2. **Update Workflows**:
   - After importing workflows, update credential references
   - Point to your local credentials

## 📊 Sync Status

Check sync status:

```bash
# View imported workflows
curl http://localhost:5678/api/v1/workflows | jq '.[].name'

# Check service health
./scripts/verify-local-setup.sh
```

## 💾 Backup & Restore

### Automatic Backups

All sync operations create automatic backups:
- Location: `./backups/pre-sync-YYYYMMDD_HHMMSS/`
- Contains: Full n8n data directory

### Restore from Backup

```bash
# Find your backup
ls -la backups/

# Restore
cp -r backups/pre-sync-YYYYMMDD_HHMMSS/n8n_data/* ./data/n8n_data/

# Restart n8n
docker compose -f infra/docker/docker-compose.dev.yml restart n8n
```

## 🔄 Regular Sync

To keep local in sync with production:

```bash
# Add to your crontab or run manually
0 2 * * * cd /path/to/n8n-cursor && ./scripts/sync-n8n-via-api.sh
```

## 🐛 Troubleshooting

### Sync Fails

**Problem**: Cannot connect to production
```bash
# Check production is accessible
curl -I https://n8ncloud.tech

# Check API key
echo $PROD_N8N_API_KEY
```

**Problem**: Local n8n not running
```bash
# Start local n8n
docker compose -f infra/docker/docker-compose.dev.yml up -d n8n

# Check logs
docker compose -f infra/docker/docker-compose.dev.yml logs n8n
```

### Workflows Not Appearing

1. Check import was successful:
   ```bash
   curl http://localhost:5678/api/v1/workflows | jq '. | length'
   ```

2. Check workflows are active:
   - Log into http://n8n.local
   - Go to Workflows
   - Activate workflows manually if needed

3. Check credentials:
   - Workflows may be inactive if credentials are missing
   - Set up credentials and reactivate workflows

### Credentials Issues

**Problem**: Workflows fail due to missing credentials
- Set up credentials manually in local n8n
- Use development/test API keys
- Never use production credentials in local!

## 📝 Best Practices

1. **Always Backup First**: Scripts do this automatically, but verify backups exist
2. **Use Development Credentials**: Never use production API keys locally
3. **Test After Sync**: Verify workflows work in local environment
4. **Regular Syncs**: Keep local in sync with production regularly
5. **Separate Environments**: Keep production and local completely separate

## 🎯 Next Steps

After syncing:

1. ✅ Verify workflows imported: http://n8n.local
2. ✅ Set up local credentials
3. ✅ Test workflows locally
4. ✅ Access other services:
   - Open WebUI: http://open-webui.local
   - AnythingLLM: http://anythingllm.local
   - LightningFlow: http://lightningflow.local

## 🔗 Related Scripts

- `scripts/complete-local-setup.sh` - Complete local setup
- `scripts/sync-n8n-via-api.sh` - API-based sync
- `scripts/sync-production-to-local.sh` - File-based sync
- `scripts/verify-local-setup.sh` - Verify setup


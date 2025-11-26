# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### Port Conflicts

**Problem**: Services won't start due to port conflicts

**Solution**:
```bash
# Check what's using the ports
make ports

# Kill conflicting processes
lsof -ti:3000 | xargs kill -9  # Replace 3000 with conflicting port
```

### Docker Issues

**Problem**: Docker containers fail to start

**Solution**:
```bash
# Check Docker status
docker info

# Clean up containers
docker compose -p lfa down
docker compose -p n8n down

# Remove volumes if needed
docker volume prune

# Restart Docker Desktop
```

### Structure Violations

**Problem**: CI fails with structure verification errors

**Solution**:
```bash
# Run structure check locally
node tooling/scripts/verify-structure.mjs

# Fix any cross-imports between apps
# Only import from packages/*, never between apps
```

### LightningFlow AI Won't Start

**Problem**: LightningFlow AI fails to start

**Solution**:
```bash
# Check environment
cat apps/lightningflow/.env.local

# Verify dependencies
cd apps/lightningflow && pnpm install

# Check logs
make logs
```

### n8n Connection Issues

**Problem**: Can't connect to n8n instance

**Solution**:
```bash
# Check n8n status
docker compose -p n8n ps

# View n8n logs
docker compose -p n8n logs n8n-ui

# Verify environment variables
cat apps/n8n-cursor/.env.local
```

### MCP Server Issues

**Problem**: MCP tools not working

**Solution**:
```bash
# Check MCP server
cd apps/n8n-cursor/mcp-server
npm start

# Verify configuration
cat ~/.cursor/mcp.json
```

## Performance Issues

### Slow Builds

**Solution**:
```bash
# Clear caches
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install

# Use pnpm store
pnpm store prune
```

### High Memory Usage

**Solution**:
```bash
# Check resource usage
docker stats

# Add resource limits to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2g
```

## Recovery Procedures

### Complete Reset

```bash
# Stop all services
make down

# Remove all containers and volumes
docker system prune -a --volumes

# Reinstall dependencies
make i

# Start fresh
make up-proxy
make up-lfa
```

### Workflow Recovery

```bash
# Export workflows from n8n
cd apps/n8n-cursor/scripts
./export-all-workflows.sh

# Import to new instance
./import-workflows.sh
```

### Database Recovery

```bash
# Backup current database
docker compose -p lfa exec postgres pg_dump -U postgres lightningflow > backup.sql

# Restore from backup
docker compose -p lfa exec -T postgres psql -U postgres lightningflow < backup.sql
```

## Getting Help

1. **Check logs first**: `make logs`
2. **Run structure check**: `node tooling/scripts/verify-structure.mjs`
3. **Verify ports**: `make ports`
4. **Check Docker status**: `docker ps -a`
5. **Review environment files**: Ensure all required variables are set

## Emergency Contacts

- **Repository Issues**: Check GitHub Issues
- **Infrastructure**: Check Docker and system logs
- **Development**: Review workspace.manifest.json for boundaries

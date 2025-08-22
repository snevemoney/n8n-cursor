# Universal Protocol (Simple)

## Quick Commands

Say these out loud or run:

- **"Check health"** → `make protocol PLAY=health`
- **"Restart safely"** → `make protocol PLAY=restart EXEC=--execute`
- **"Start the system"** → `make protocol PLAY=start EXEC=--execute`
- **"Fix my remote"** → `make protocol PLAY=remote_fix EXEC=--execute`
- **"Make a backup"** → `make protocol PLAY=backup EXEC=--execute`
- **"Clean Docker junk"** → `make protocol PLAY=cleanup EXEC=--execute`
- **"Index the Repo Brain"** → `make protocol PLAY=repo_brain_index EXEC=--execute`
- **"Check ports"** → `make protocol PLAY=ports_conflict`

## How It Works

Everything runs DRY unless you add `EXEC=--execute`.

### Example Usage

```bash
# See what would happen (DRY RUN)
make protocol PLAY=restart

# Actually do it
make protocol PLAY=restart EXEC=--execute

# Check system health
make protocol PLAY=health
```

## Available Playbooks

- `health` - System health check
- `restart` - Safe system restart
- `start` - Start the system
- `remote_fix` - Fix remote connection issues
- `backup` - Create backup
- `db_backup` - Database backup
- `db_restore` - Database restore
- `cleanup` - Clean Docker resources
- `structure_clean` - Fix repository structure
- `repo_brain_index` - Index repository for AI
- `stripe_webhook` - Stripe webhook troubleshooting
- `supabase_rls` - Supabase RLS setup
- `ports_conflict` - Port conflict resolution

## Protocol Principles

1. **Detect** - Run health checks first
2. **Assess** - Determine severity (P0-P3)
3. **Act** - Execute commands safely
4. **Verify** - Confirm success
5. **Document** - Update documentation
6. **Close** - List follow-ups

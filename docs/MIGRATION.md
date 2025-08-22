# Migration Guide: Old Scripts to New Structure

This document maps the old script paths to the new consolidated commands.

## 🚀 **Quick Migration**

**Old way:**
```bash
./start-n8n.sh
./stop-n8n.sh
./status-n8n.sh
./fix-ai-expressions.sh
./remove-duplicates.sh
```

**New way:**
```bash
make up          # or: scripts/ops/n8n.sh up
make down        # or: scripts/ops/n8n.sh down
make status      # or: scripts/ops/n8n.sh status
make wf-validate # or: scripts/workflows/manage.sh validate
make wf-dedupe   # or: scripts/workflows/manage.sh dedupe
```

## 📋 **Complete Migration Map**

### **n8n Service Management**

| Old Script | New Command | Notes |
|------------|-------------|-------|
| `./start-n8n.sh` | `make up` | Start n8n service |
| `./stop-n8n.sh` | `make down` | Stop n8n service |
| `./status-n8n.sh` | `make status` | Show service status |
| `./restart-n8n.sh` | `make restart` | Restart n8n service |
| `./enter-n8n.sh` | `scripts/ops/n8n.sh enter` | Enter container |

### **Workflow Management**

| Old Script | New Command | Notes |
|------------|-------------|-------|
| `./fix-ai-expressions.sh` | `make wf-validate` | Validate workflows |
| `./fix-workflow-expressions.sh` | `make wf-validate` | Validate workflows |
| `./fix-remaining-workflows.sh` | `make wf-validate` | Validate workflows |
| `./fix-workflows-better.sh` | `make wf-validate` | Validate workflows |
| `./remove-duplicates.sh` | `make wf-dedupe` | Remove duplicates |
| `./remove-duplicates-delete.sh` | `make wf-dedupe` | Remove duplicates |
| `./import-missing-workflows.sh` | `make wf-import` | Import workflows |
| `./clean-reimport-workflows.sh` | `make wf-import` | Clean reimport |
| `./bulk_import_workflows.sh` | `make wf-import` | Bulk import |

### **Backup and Restore**

| Old Script | New Command | Notes |
|------------|-------------|-------|
| `./safe-cleanup.sh` | `make clean` | Clean temporary files |
| `./backup-*.sh` | `make backup` | Create backup |
| `./restore-*.sh` | `make restore` | Restore from backup |

### **System Management**

| Old Script | New Command | Notes |
|------------|-------------|-------|
| `./n8n-manager.sh` | `make status` | Show status |
| `./n8n-enterprise-protection.sh` | `make systems` | Launch protection |
| `./safety-verification-system.sh` | `make health` | Health check |

## 🔧 **Compatibility Shims**

For backward compatibility, the following shims are available:

```bash
# These still work but show deprecation warnings
./start-n8n.sh      # → make up
./stop-n8n.sh       # → make down
./status-n8n.sh     # → make status
./fix-all.sh        # → make wf-validate
```

## 📁 **New Directory Structure**

```
.
├── Makefile                    # Main entry point
├── scripts/
│   ├── ops/n8n.sh            # n8n service management
│   ├── workflows/manage.sh   # Workflow operations
│   ├── safety/guard.sh       # Safety and protection
│   └── utils/lib.sh          # Common utilities
├── infra/
│   ├── nginx/                # nginx configuration
│   └── docker/               # Docker configuration
└── docs/                     # Documentation
```

## 🚀 **Getting Started**

1. **Check available commands:**
   ```bash
   make help
   ```

2. **Start n8n:**
   ```bash
   make up
   ```

3. **Check status:**
   ```bash
   make status
   ```

4. **Validate workflows:**
   ```bash
   make wf-validate
   ```

5. **Create backup:**
   ```bash
   make backup
   ```

## 🔍 **Advanced Usage**

### **Dry Run Mode**
```bash
DRY_RUN=true make wf-dedupe
DRY_RUN=true make backup
```

### **Debug Mode**
```bash
DEBUG=true make status
DEBUG=true make up
```

### **Non-Interactive Mode**
```bash
NONINTERACTIVE=true make restore BACKUP_PATH=/path/to/backup
```

## 🆘 **Need Help?**

- **Show help:** `make help`
- **Script help:** `scripts/ops/n8n.sh help`
- **Dry run:** Add `DRY_RUN=true` before any command
- **Debug:** Add `DEBUG=true` before any command

## 🔄 **Rollback**

If you need to rollback to the old structure:

1. **Checkout the old branch:**
   ```bash
   git checkout main
   ```

2. **Restore old scripts:**
   ```bash
   git checkout main -- start-n8n.sh stop-n8n.sh status-n8n.sh
   ```

## 📊 **Benefits of New Structure**

✅ **Single entry point** - `make` commands  
✅ **Consistent interface** - All scripts follow same pattern  
✅ **Better error handling** - Proper logging and validation  
✅ **Dry run support** - Test before making changes  
✅ **Professional organization** - DevOps will respect this  
✅ **Easy maintenance** - One place to update  
✅ **Backward compatibility** - Old scripts still work  

## 🎯 **Next Steps**

1. **Try the new commands** with `make help`
2. **Use dry run mode** to test changes
3. **Report any issues** in the repository
4. **Update your scripts** to use the new structure
5. **Remove old scripts** once you're comfortable

---

**Remember:** The new structure is designed to be **safer**, **more professional**, and **easier to maintain**. All operations support dry-run mode, so you can test everything before making actual changes.

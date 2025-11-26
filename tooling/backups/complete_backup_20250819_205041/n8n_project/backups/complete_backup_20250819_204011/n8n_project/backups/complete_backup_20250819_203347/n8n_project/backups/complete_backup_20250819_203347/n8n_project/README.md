# evens's n8n Project

This project contains evens's complete n8n automation environment with Docker isolation and conflict prevention.

## 🚀 Quick Start

```bash
# Check everything is working
./n8n-manager.sh status

# View available commands
./n8n-manager.sh help
```

## 📁 Project Structure

```
n8n-cursor/
├── n8n-manager.sh              # Main project manager
├── scripts/                    # Management scripts
│   ├── docker_isolation_system.sh
│   ├── docker_management_rules.sh
│   └── complete_restore.sh
├── docs/                       # Documentation
│   └── DOCKER_RULES.md
├── workflows/                  # n8n workflow files
│   ├── ai-saas-master-scaffold.json
│   ├── ai-content-empire.json
│   └── [7+ other workflows]
└── README.md                   # This file
```

## 🛡️ Docker Protection System

This project includes a comprehensive Docker isolation system that ensures:
- Docker NEVER conflicts with your n8n service
- Your n8n always has priority on port 5678
- Automatic protection and monitoring
- Emergency recovery procedures

## 📋 Common Commands

### Check Status
```bash
./n8n-manager.sh status
```

### Restart n8n Safely
```bash
./n8n-manager.sh restart
```

### Backup Data
```bash
./n8n-manager.sh backup
```

### View Workflows
```bash
./n8n-manager.sh workflows
```

### Emergency Protection
```bash
./n8n-manager.sh protect
```

## 🔧 System Services

- **n8n-original.service**: Your protected n8n service
- **docker-port-blocker.service**: Prevents Docker conflicts
- **Continuous monitoring**: Cron job enforces rules

## 📊 Data Locations

- **Live Data**: `/home/n8n/.n8n/`
- **Backups**: `/tmp/n8n_backup_*/`
- **Workflows**: `~/n8n-cursor/workflows/`

## 🌐 Access

- **Web Interface**: https://n8ncloud.tech
- **User**: evens louis (snevemoney12@gmail.com)
- **Workflows**: 7+ automated workflows

## 🚨 Emergency Procedures

If anything goes wrong:
1. Run `./n8n-manager.sh protect`
2. Check status with `./n8n-manager.sh status`
3. View logs with `./n8n-manager.sh logs`

For detailed Docker rules, see `docs/DOCKER_RULES.md`

## ✅ Success Indicators

- n8n accessible at https://n8ncloud.tech
- All workflows visible in interface
- No Docker processes using port 5678
- Services active: n8n-original, docker-port-blocker

# Docker Isolation & Conflict Prevention Rules

## 🛡️ Purpose
These rules ensure Docker NEVER conflicts with evens's n8n services or any other host services.

## 📋 Core Rules

### Rule 1: Port Protection
- **Port 5678**: Reserved EXCLUSIVELY for original n8n service
- **Ports 15000+**: Available for Docker services
- **Auto-blocking**: Any Docker attempt to use 5678 is automatically killed

### Rule 2: Service Priority
- **Original n8n**: Always has priority (systemd service: n8n-original)
- **Docker services**: Secondary priority, isolated ports only
- **Auto-restart**: Original n8n restarts automatically if it fails

### Rule 3: Network Isolation
- **Docker subnet**: 172.30.0.0/16 (isolated from host)
- **Host services**: Use standard networking
- **No interference**: Docker networking cannot affect host services

### Rule 4: Continuous Monitoring
- **Cron job**: Runs every minute to enforce isolation
- **Port blocker**: Systemd service prevents Docker port conflicts
- **Auto-enforcement**: Automatic detection and resolution of conflicts

## 🔧 Available Scripts

### docker_isolation_system.sh
```bash
./docker_isolation_system.sh setup     # Set up complete isolation
./docker_isolation_system.sh start     # Start isolated Docker n8n
./docker_isolation_system.sh emergency # Emergency isolation
./docker_isolation_system.sh check     # Check isolation status
```

### docker_management_rules.sh
```bash
./docker_management_rules.sh backup    # Backup n8n data
./docker_management_rules.sh restart   # Clean restart with rules
./docker_management_rules.sh emergency # Emergency cleanup
```

## 🚀 System Services

### n8n-original.service
- **Purpose**: Runs your original n8n with all data
- **Location**: /etc/systemd/system/n8n-original.service
- **Status**: `sudo systemctl status n8n-original`

### docker-port-blocker.service
- **Purpose**: Blocks Docker from using protected ports
- **Location**: /etc/systemd/system/docker-port-blocker.service
- **Status**: `sudo systemctl status docker-port-blocker`

## 🔍 Verification Commands

```bash
# Check if your n8n is running
curl -s -o /dev/null -w "n8n Status: %{http_code}\n" https://n8ncloud.tech

# Check service status
sudo systemctl status n8n-original

# Check for port conflicts
netstat -tulpn | grep :5678

# Check Docker isolation
docker ps | grep -E "(5678|15)"
```

## 🚨 Emergency Procedures

### If Docker Conflicts Occur:
```bash
# Emergency isolation
./scripts/docker_isolation_system.sh emergency

# Or manual cleanup
sudo pkill -f "docker-proxy.*5678"
sudo systemctl restart n8n-original
```

### If n8n Stops Working:
```bash
# Restart protected service
sudo systemctl restart n8n-original

# Check logs
sudo journalctl -u n8n-original -f
```

## ✅ Success Indicators
- n8n accessible at https://n8ncloud.tech (HTTP 200)
- No Docker processes using port 5678
- n8n-original.service active
- docker-port-blocker.service active

## 📁 File Locations
- **Scripts**: ~/n8n-cursor/scripts/
- **Docs**: ~/n8n-cursor/docs/
- **Data**: /home/n8n/.n8n/
- **Backups**: /tmp/n8n_backup_*/
- **Services**: /etc/systemd/system/

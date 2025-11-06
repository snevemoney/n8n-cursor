# 🛡️ SSH Multiplexing Guardian - Prevention & Recovery

## 🎯 Purpose
Prevent and quickly recover from SSH multiplexing issues that can break Remote-SSH connections in Cursor.

## ⚠️ Common Issues We Encountered
- Stale control connections blocking new connections
- Aggressive multiplexing settings interfering with Remote-SSH
- Control socket permission conflicts
- Extension connection failures due to multiplexing conflicts

## 🔧 Prevention Measures

### **1. Conservative Multiplexing Settings**
```bash
# Use these settings in ~/.ssh/config for Remote-SSH compatibility
Host n8ncloud
  # ... other settings ...
  
  # Conservative multiplexing (was 10m, now 5m)
  ControlMaster auto
  ControlPath ~/.ssh/control-%h-%p-%r
  ControlPersist 5m
  
  # Performance tuning
  ServerAliveInterval 30
  ServerAliveCountMax 6
  TCPKeepAlive yes
```

### **2. Regular Connection Cleanup**
```bash
# Add to your daily routine or before Remote-SSH connections
ssh -O exit n8ncloud 2>/dev/null || echo "No control connections to clear"
```

### **3. Control Socket Management**
```bash
# Check for existing control connections
ls -la ~/.ssh/cm-* 2>/dev/null

# Clear all control connections if needed
find ~/.ssh -name "cm-*" -delete 2>/dev/null
```

## 🚨 Quick Recovery Scripts

### **Emergency Multiplexing Reset**
```bash
#!/bin/bash
echo "🚨 Emergency SSH Multiplexing Reset"
echo "==================================="

# Clear all control connections
echo "🧹 Clearing SSH control connections..."
ssh -O exit n8ncloud 2>/dev/null || echo "No control connections to clear"

# Remove control socket files
echo "🗑️ Removing control socket files..."
find ~/.ssh -name "cm-*" -delete 2>/dev/null

# Test fresh connection
echo "🧪 Testing fresh SSH connection..."
ssh n8ncloud "echo 'Multiplexing reset successful'"

echo "✅ Multiplexing reset complete!"
```

### **SSH Health Check**
```bash
#!/bin/bash
echo "🏥 SSH Health Check"
echo "==================="

# Check control connections
echo "🔍 Control connections:"
ls -la ~/.ssh/cm-* 2>/dev/null || echo "None found"

# Check SSH process
echo "🔍 SSH processes:"
ps aux | grep ssh | grep -v grep

# Test connection
echo "🧪 Connection test:"
ssh n8ncloud "echo 'Connection healthy'" 2>/dev/null && echo "✅ SSH healthy" || echo "❌ SSH issues detected"
```

## 📋 Maintenance Schedule

### **Daily (Before Remote-SSH)**
- Clear control connections: `ssh -O exit n8ncloud`

### **Weekly**
- Run SSH health check
- Clear old control sockets: `find ~/.ssh -name "cm-*" -mtime +7 -delete`

### **Monthly**
- Review multiplexing settings
- Update SSH config if needed

## 🔍 Troubleshooting Checklist

- [ ] Control connections cleared?
- [ ] Control socket files removed?
- [ ] SSH process not stuck?
- [ ] Multiplexing settings conservative?
- [ ] Connection timeout reasonable?
- [ ] Server alive settings appropriate?

## 💡 Pro Tips

1. **Always use `ControlPersist 5m`** instead of 10m for Remote-SSH
2. **Clear connections before Remote-SSH attempts**
3. **Use `~/.ssh/config.remote-ssh-optimized`** for Cursor
4. **Monitor control socket directory** for stuck connections
5. **Test connections after any SSH config changes**

## 🚀 Quick Commands Reference

```bash
# Clear control connection
ssh -O exit n8ncloud

# Check control connection status
ssh -O check n8ncloud

# Remove all control sockets
find ~/.ssh -name "cm-*" -delete

# Test connection
ssh n8ncloud "echo 'test'"

# View active SSH processes
ps aux | grep ssh | grep -v grep
```

---
**Last Updated**: $(date)
**Created From**: SSH multiplexing issues with Cursor Remote-SSH
**Prevention Focus**: Control connection conflicts and aggressive multiplexing

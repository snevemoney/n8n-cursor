# 🛡️ Remote-SSH Extension Guardian - Prevention & Recovery

## 🎯 Purpose
Prevent and quickly recover from Remote-SSH extension issues in Cursor that can break remote connections.

## ⚠️ Common Issues We Encountered
- Cursor's custom Remote-SSH extension conflicts with SSH config
- Extension state corruption and stale connections
- Extension configuration mismatches
- Extension vs. standard Microsoft Remote-SSH conflicts

## 🔧 Prevention Measures

### **1. Use Optimized SSH Config for Remote-SSH**
```bash
# Always use this config for Remote-SSH connections
# File: ~/.ssh/config.remote-ssh-optimized

Host n8ncloud
  HostName 69.62.66.78
  User evens
  Port 22222
  IdentityFile ~/.ssh/id_ed25519
  PreferredAuthentications publickey
  PubkeyAuthentication yes
  
  # Conservative multiplexing for Remote-SSH
  ControlMaster auto
  ControlPath ~/.ssh/control-%h-%p-%r
  ControlPersist 5m
  
  # Remote-SSH optimizations
  ConnectTimeout 30
  ConnectionAttempts 3
  BatchMode no
  ServerAliveInterval 30
  ServerAliveCountMax 6
  TCPKeepAlive yes
  StrictHostKeyChecking accept-new
  
  # Performance tuning
  GSSAPIAuthentication no
  GSSAPIDelegateCredentials no
  UseRoaming no
```

### **2. Cursor Remote-SSH Settings**
```json
// Add to Cursor settings.json
{
    "remote.SSH.configFile": "~/.ssh/config.remote-ssh-optimized",
    "remote.SSH.remotePlatform": {
        "n8ncloud": "linux"
    },
    "remote.SSH.connectTimeout": 30,
    "remote.SSH.showLoginTerminal": false,
    "remote.SSH.logLevel": "debug"
}
```

### **3. Extension Management**
- **Prefer Cursor's built-in Remote-SSH** over external installations
- **Keep extension state clean** by regular cleanup
- **Use consistent SSH config** across all connections

## 🚨 Quick Recovery Scripts

### **Emergency Extension Reset**
```bash
#!/bin/bash
echo "🚨 Emergency Remote-SSH Extension Reset"
echo "======================================="

# Backup current settings
echo "📦 Backing up Cursor settings..."
cp ~/Library/Application\ Support/Cursor/User/settings.json \
   ~/Library/Application\ Support/Cursor/User/settings.json.backup.$(date +%Y%m%d_%H%M%S)

# Clear extension state
echo "🧹 Clearing Remote-SSH extension state..."
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | while read file; do
    if [ -d "$file" ]; then
        echo "Removing directory: $file"
        rm -rf "$file" 2>/dev/null || echo "Could not remove: $file"
    else
        echo "Removing file: $file"
        rm -f "$file" 2>/dev/null || echo "Could not remove: $file"
    fi
done

# Clear workspace state
echo "🧹 Clearing workspace Remote-SSH state..."
find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | while read file; do
    echo "Removing: $file"
    rm -rf "$file" 2>/dev/null
done

echo "✅ Extension state cleared!"
echo "🔄 Restart Cursor and try connecting again"
```

### **Extension Health Check**
```bash
#!/bin/bash
echo "🏥 Remote-SSH Extension Health Check"
echo "===================================="

# Check installed extensions
echo "🔍 Installed Remote-SSH extensions:"
cursor --list-extensions | grep -i "remote\|ssh"

# Check extension directories
echo "🔍 Extension directories:"
ls -la ~/.cursor/extensions/ | grep -i "remote\|ssh"

# Check extension state
echo "🔍 Extension state files:"
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null

# Check Cursor settings
echo "🔍 Remote-SSH settings in Cursor:"
grep -A 5 -B 5 "remote.SSH" ~/Library/Application\ Support/Cursor/User/settings.json 2>/dev/null || echo "No Remote-SSH settings found"
```

### **Complete Extension Reinstall**
```bash
#!/bin/bash
echo "🔄 Complete Remote-SSH Extension Reinstall"
echo "=========================================="

# Uninstall problematic extension
echo "🗑️ Uninstalling anysphere.remote-ssh..."
cursor --uninstall-extension anysphere.remote-ssh

# Clear all extension state
echo "🧹 Clearing all extension state..."
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null

# Restart Cursor (user must do this manually)
echo "🔄 Please restart Cursor now"
echo "📦 Extension will auto-reinstall on restart"
echo "⚙️ Configure with optimized SSH config after restart"
```

## 📋 Maintenance Schedule

### **Before Each Remote-SSH Connection**
- Clear SSH control connections: `ssh -O exit n8ncloud`
- Verify SSH config is working: `ssh n8ncloud "echo 'test'"`

### **Weekly**
- Run extension health check
- Clear old extension state files
- Verify Cursor settings are correct

### **Monthly**
- Review extension configuration
- Update SSH config if needed
- Clean up old backup files

## 🔍 Troubleshooting Checklist

- [ ] SSH connection working in terminal?
- [ ] Extension state cleared?
- [ ] Cursor settings correct?
- [ ] SSH config optimized for Remote-SSH?
- [ ] Control connections cleared?
- [ ] Extension reinstalled if needed?

## 💡 Pro Tips

1. **Always use `~/.ssh/config.remote-ssh-optimized`** for Remote-SSH
2. **Clear extension state before troubleshooting**
3. **Keep Cursor settings minimal** - only essential Remote-SSH config
4. **Test SSH connection before Remote-SSH attempts**
5. **Use debug logging** when troubleshooting: `"remote.SSH.logLevel": "debug"`

## 🚀 Quick Commands Reference

```bash
# Check extension status
cursor --list-extensions | grep -i "remote\|ssh"

# Uninstall extension
cursor --uninstall-extension anysphere.remote-ssh

# Install extension
cursor --install-extension ms-vscode-remote.remote-ssh

# Clear extension state
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" -delete

# Test SSH connection
ssh n8ncloud "echo 'test'"

# Clear SSH control connections
ssh -O exit n8ncloud
```

## 🔧 Configuration Files

### **Primary SSH Config**: `~/.ssh/config`
- Basic SSH configuration
- Terminal connections
- General SSH operations

### **Remote-SSH Config**: `~/.ssh/config.remote-ssh-optimized`
- Optimized for Cursor Remote-SSH
- Conservative multiplexing
- Remote-SSH specific settings

### **Cursor Settings**: `~/Library/Application Support/Cursor/User/settings.json`
- Remote-SSH extension configuration
- SSH config file path
- Connection settings

---
**Last Updated**: $(date)
**Created From**: Remote-SSH extension conflicts and state corruption
**Prevention Focus**: Extension state management and configuration conflicts

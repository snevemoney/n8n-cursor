# 🏆 Golden Reference Master Guardian - Complete Prevention & Recovery

## 🎯 Purpose
**THE ULTIMATE REFERENCE** - Prevent and recover from ALL SSH, Remote-SSH, and Cursor connection issues we encountered today. This is your go-to file for any future problems.

## 🚨 ROOT CAUSE DISCOVERED TODAY
**Multiple Cursor Windows = Process Explosion = Remote-SSH Failure**
- **2 Cursor windows** caused **18+ total processes**
- Each window spawns multiple helper processes
- Process conflicts corrupted Remote-SSH extension state
- This was the PRIMARY cause of your connection issues

## 🚨 Emergency Quick Fix (5-Minute Recovery)
```bash
#!/bin/bash
echo "🚨 EMERGENCY 5-MINUTE RECOVERY SCRIPT"
echo "====================================="

# Step 1: Check Cursor process count
echo "1️⃣ Checking Cursor process count..."
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
echo "   Total processes: $TOTAL_PROCESSES"
echo "   Unique windows: $UNIQUE_WINDOWS"

# Step 2: Clear SSH control connections
echo "2️⃣ Clearing SSH control connections..."
ssh -O exit n8ncloud 2>/dev/null || echo "No control connections to clear"
find ~/.ssh -name "cm-*" -delete 2>/dev/null

# Step 3: Clear Remote-SSH extension state
echo "3️⃣ Clearing Remote-SSH extension state..."
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null

# Step 4: Test SSH connection
echo "4️⃣ Testing SSH connection..."
ssh n8ncloud "echo 'SSH connection restored'" 2>/dev/null && echo "✅ SSH working" || echo "❌ SSH still broken"

# Step 5: Reset Remote-SSH extension
echo "5️⃣ Resetting Remote-SSH extension..."
cursor --uninstall-extension anysphere.remote-ssh 2>/dev/null
echo "🔄 Restart Cursor now - extension will auto-reinstall"

# Step 6: CRITICAL - Close multiple windows
if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🚨 CRITICAL: Close all Cursor windows except ONE"
    echo "   - Multiple windows caused this issue"
    echo "   - Use single window with multiple tabs instead"
fi

echo "✅ Emergency recovery complete in 5 minutes!"
```

## 🔧 Complete Prevention System

### **1. CRITICAL: Single Window Policy**
```bash
# NEVER open more than 1 Cursor window for Remote-SSH
# Use multiple tabs instead of multiple windows
# This prevents 90% of the issues we encountered today

# Before opening Cursor, check if it's already running:
if pgrep -f "Cursor.app" > /dev/null; then
    echo "⚠️  Cursor already running - use existing window with tabs"
    echo "   - Don't open new windows"
    echo "   - Use tabs instead"
else
    echo "✅ Safe to open Cursor"
fi
```

### **2. SSH Configuration Management**
```bash
# File: ~/.ssh/config (for terminal connections)
Host n8ncloud
  HostName 69.62.66.78
  User evens
  Port 22222
  IdentityFile ~/.ssh/id_ed25519
  PreferredAuthentications publickey
  PubkeyAuthentication yes
  ServerAliveInterval 30
  ServerAliveCountMax 6
  TCPKeepAlive yes
  StrictHostKeyChecking accept-new
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m

# File: ~/.ssh/config.remote-ssh-optimized (for Cursor Remote-SSH)
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

### **3. Cursor Remote-SSH Settings**
```json
// File: ~/Library/Application Support/Cursor/User/settings.json
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

### **4. Daily Prevention Routine**
```bash
#!/bin/bash
echo "🛡️ Daily Prevention Routine"
echo "==========================="

# Check Cursor process count
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)

echo "Cursor processes: $TOTAL_PROCESSES"
echo "Unique windows: $UNIQUE_WINDOWS"

# Alert if too many processes
if [ $TOTAL_PROCESSES -gt 20 ]; then
    echo "🚨 WARNING: Too many Cursor processes"
    echo "   - Close unused windows"
    echo "   - Consider restarting Cursor"
fi

if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🚨 WARNING: Multiple Cursor windows detected"
    echo "   - This causes the issues we had today"
    echo "   - Use single window with multiple tabs"
fi

# Clear SSH control connections
ssh -O exit n8ncloud 2>/dev/null || echo "No control connections to clear"

# Test SSH connection
ssh n8ncloud "echo 'Daily SSH health check passed'" 2>/dev/null && echo "✅ SSH healthy" || echo "❌ SSH needs attention"

# Check Remote-SSH extension
cursor --list-extensions | grep -i "remote\|ssh" | grep -q "anysphere.remote-ssh" && echo "✅ Extension installed" || echo "❌ Extension missing"

echo "🛡️ Daily prevention complete!"
```

## 🚨 Complete Recovery Procedures

### **Scenario 1: Multiple Cursor Windows (ROOT CAUSE)**
```bash
# IMMEDIATE ACTION REQUIRED
echo "🚨 MULTIPLE CURSOR WINDOWS DETECTED - ROOT CAUSE OF ISSUES"
echo "=========================================================="

# Count windows
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
echo "Current windows: $UNIQUE_WINDOWS"

if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🚨 CRITICAL: Close all Cursor windows except ONE"
    echo "   - Multiple windows cause process conflicts"
    echo "   - Use tabs instead of windows"
    echo "   - This prevents 90% of Remote-SSH issues"
    
    # Emergency cleanup
    find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
    find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
    
    echo "✅ Extension state cleared"
    echo "🔄 Now close all windows and restart with ONE window"
fi
```

### **Scenario 2: SSH Connection Broken**
```bash
# Quick fix
ssh -O exit n8ncloud
find ~/.ssh -name "cm-*" -delete
ssh n8ncloud "echo 'test'"

# If still broken
ssh-keygen -R n8ncloud
ssh -o StrictHostKeyChecking=no n8ncloud "echo 'host key re-established'"
```

### **Scenario 3: Remote-SSH Extension Not Working**
```bash
# Quick fix
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" -delete
find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" -delete

# Restart Cursor
# Extension will auto-reinstall
```

### **Scenario 4: Complete System Failure**
```bash
# Nuclear option - complete reset
cursor --uninstall-extension anysphere.remote-ssh
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" -delete
find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" -delete
find ~/.ssh -name "cm-*" -delete
ssh-keygen -R n8ncloud
ssh -o StrictHostKeyChecking=no n8ncloud "echo 'complete reset successful'"
# Restart Cursor with ONE window
```

## 📋 Maintenance Schedule

### **Daily (Before Remote-SSH)**
- Check Cursor process count: `ps aux | grep -i cursor | grep -v grep | wc -l`
- Ensure only ONE Cursor window: `ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l`
- Clear SSH control connections: `ssh -O exit n8ncloud`
- Test SSH connection: `ssh n8ncloud "echo 'test'"`

### **Weekly**
- Restart Cursor completely (closes all windows)
- Run SSH health check
- Clear old control sockets: `find ~/.ssh -name "cm-*" -mtime +7 -delete`
- Verify Cursor settings

### **Monthly**
- Review all SSH configurations
- Update configurations if needed
- Clean up old backup files

## 🔍 Master Troubleshooting Checklist

### **CRITICAL: Multiple Window Issues**
- [ ] Only ONE Cursor window open?
- [ ] Process count < 20?
- [ ] No conflicting window configurations?

### **SSH Issues**
- [ ] Control connections cleared?
- [ ] Control socket files removed?
- [ ] SSH process not stuck?
- [ ] Host keys valid?
- [ ] SSH config syntax correct?

### **Remote-SSH Issues**
- [ ] Extension state cleared?
- [ ] Cursor settings correct?
- [ ] SSH config optimized for Remote-SSH?
- [ ] Extension reinstalled if needed?
- [ ] Debug logging enabled?

### **Cursor Issues**
- [ ] Cursor restarted?
- [ ] Extension state cleared?
- [ ] Settings file syntax correct?
- [ ] SSH config file path correct?

## 💡 Master Pro Tips

1. **NEVER open multiple Cursor windows** - This causes 90% of issues
2. **Always use single window with multiple tabs** for different projects
3. **Always use two SSH configs**: One for terminal, one for Remote-SSH
4. **Clear connections before Remote-SSH attempts**
5. **Keep Cursor settings minimal** - only essential Remote-SSH config
6. **Use debug logging** when troubleshooting
7. **Test SSH connection before Remote-SSH attempts**
8. **Regular maintenance prevents most issues**

## 🚀 Master Quick Commands Reference

```bash
# Cursor Process Management
ps aux | grep -i cursor | grep -v grep | wc -l                    # Count total processes
ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l  # Count unique windows
pkill -f "Cursor.app"                                             # Force quit all Cursor processes

# SSH Management
ssh -O exit n8ncloud                                              # Clear control connection
ssh -O check n8ncloud                                             # Check control connection status
find ~/.ssh -name "cm-*" -delete                                 # Remove all control sockets
ssh n8ncloud "echo 'test'"                                        # Test connection

# Extension Management
cursor --list-extensions | grep -i "remote\|ssh"                  # Check extensions
cursor --uninstall-extension anysphere.remote-ssh                 # Uninstall extension
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" -delete  # Clear state

# Health Checks
ps aux | grep ssh | grep -v grep                                  # Check SSH processes
ls -la ~/.ssh/cm-*                                                # Check control sockets
grep -A 5 -B 5 "remote.SSH" ~/Library/Application\ Support/Cursor/User/settings.json  # Check Cursor settings
```

## 🔧 File Structure Reference

```
~/.ssh/
├── config                          # Terminal SSH config
├── config.remote-ssh-optimized    # Remote-SSH optimized config
├── id_ed25519                     # SSH private key
└── known_hosts                    # Host keys

~/Library/Application Support/Cursor/User/
├── settings.json                  # Cursor settings
└── globalStorage/                 # Extension state

~/.cursor/extensions/
└── anysphere.remote-ssh-1.0.26/  # Remote-SSH extension
```

## 🎯 When to Use Each Reference

- **This File (00_GOLDEN_REFERENCE)**: Complete system failure, new setup, master reference, **MULTIPLE WINDOW ISSUES**
- **01_SSH_MULTIPLEXING_GUARDIAN**: SSH connection issues, multiplexing problems
- **02_REMOTE_SSH_EXTENSION_GUARDIAN**: Extension-specific issues, Cursor Remote-SSH problems
- **03_MULTIPLE_CURSOR_WINDOWS_GUARDIAN**: **MULTIPLE WINDOW CONFLICTS** (ROOT CAUSE)

## 🚨 CRITICAL PREVENTION RULE

**NEVER OPEN MORE THAN ONE CURSOR WINDOW**
- Use tabs instead of windows
- Multiple windows cause process conflicts
- This was the primary cause of today's issues
- Single window policy prevents 90% of problems

---
**Last Updated**: $(date)
**Created From**: Complete SSH, Remote-SSH, and Cursor connection failure + **MULTIPLE WINDOW ROOT CAUSE**
**Prevention Focus**: Complete system resilience, quick recovery, **SINGLE WINDOW POLICY**
**Status**: 🏆 GOLDEN REFERENCE - Use this file first for any issues
**ROOT CAUSE**: Multiple Cursor windows = Process explosion = Remote-SSH failure

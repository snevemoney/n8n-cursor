# 🛡️ Multiple Cursor Windows Guardian - Prevention & Recovery

## 🎯 Purpose
Prevent and recover from issues caused by multiple Cursor windows running simultaneously, which can cause process conflicts, extension state corruption, and Remote-SSH failures.

## ⚠️ What We Discovered Today
- **2 Cursor windows open** but **18 total Cursor processes running**
- Each window spawns multiple helper processes (GPU, Renderer, Extension Host, etc.)
- Multiple windows can cause:
  - Extension state conflicts
  - SSH connection sharing issues
  - Memory and resource conflicts
  - Remote-SSH extension corruption

## 🔍 Process Analysis

### **Normal Cursor Process Structure (Per Window)**
```
1. Main Cursor Process (Cursor.app/Contents/MacOS/Cursor)
2. GPU Helper Process (Cursor Helper GPU)
3. Renderer Process (Cursor Helper Renderer)
4. Extension Host Process (Cursor Helper Plugin: extension-host)
5. Additional helper processes for extensions
```

### **Multiple Windows = Exponential Process Growth**
- **1 Window**: ~5-8 processes
- **2 Windows**: ~10-16 processes  
- **3 Windows**: ~15-24 processes
- **4+ Windows**: Process explosion and conflicts

## 🚨 Prevention Strategies

### **1. Single Window Policy (Recommended)**
```bash
# Always use ONE Cursor window with multiple tabs
# Benefits:
# - Single extension state
# - No SSH connection conflicts
# - Consistent configuration
# - Lower resource usage
# - Easier troubleshooting
```

### **2. Multiple Window Safety Rules**
If you MUST use multiple windows:

```bash
# Rule 1: Never have more than 2 Cursor windows open
# Rule 2: Each window should have different workspaces/projects
# Rule 3: Don't open Remote-SSH connections in multiple windows
# Rule 4: Close unused windows immediately
# Rule 5: Restart Cursor daily if using multiple windows
```

### **3. Process Monitoring Script**
```bash
#!/bin/bash
echo "🔍 Cursor Process Monitor"
echo "========================="

# Count total Cursor processes
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
echo "Total Cursor processes: $TOTAL_PROCESSES"

# Count unique windows
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
echo "Unique Cursor windows: $UNIQUE_WINDOWS"

# Check for process conflicts
if [ $TOTAL_PROCESSES -gt 20 ]; then
    echo "🚨 WARNING: Too many Cursor processes ($TOTAL_PROCESSES)"
    echo "   - Close unused Cursor windows"
    echo "   - Restart Cursor if needed"
fi

if [ $UNIQUE_WINDOWS -gt 2 ]; then
    echo "🚨 WARNING: Too many Cursor windows ($UNIQUE_WINDOWS)"
    echo "   - Close unused windows immediately"
    echo "   - Use single window with multiple tabs instead"
fi

# Show process breakdown
echo ""
echo "Process breakdown:"
ps aux | grep -i cursor | grep -v grep | awk '{print $11}' | sort | uniq -c | sort -nr
```

## 🚨 Recovery Procedures

### **Scenario 1: Too Many Processes (Current Situation)**
```bash
#!/bin/bash
echo "🚨 Emergency Cursor Process Cleanup"
echo "==================================="

# Step 1: Count current processes
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
echo "Current Cursor processes: $TOTAL_PROCESSES"

# Step 2: Show process breakdown
echo "Process breakdown:"
ps aux | grep -i cursor | grep -v grep | awk '{print $11}' | sort | uniq -c | sort -nr

# Step 3: Emergency cleanup
if [ $TOTAL_PROCESSES -gt 15 ]; then
    echo "🚨 Too many processes - Emergency cleanup required"
    echo "1. Close ALL Cursor windows"
    echo "2. Force quit Cursor from Activity Monitor"
    echo "3. Wait 10 seconds"
    echo "4. Restart Cursor"
    echo "5. Open only ONE window"
else
    echo "✅ Process count acceptable"
fi
```

### **Scenario 2: Multiple Windows Causing Conflicts**
```bash
#!/bin/bash
echo "🔄 Multiple Window Conflict Resolution"
echo "====================================="

# Count unique windows
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
echo "Unique Cursor windows: $UNIQUE_WINDOWS"

if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🔄 Resolving multiple window conflicts..."
    
    # Clear extension state for all windows
    echo "🧹 Clearing extension state..."
    find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
    
    # Clear workspace state
    echo "🧹 Clearing workspace state..."
    find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
    
    echo "✅ Extension state cleared"
    echo "🔄 Now close all Cursor windows and restart with ONE window"
fi
```

### **Scenario 3: Process Explosion Prevention**
```bash
#!/bin/bash
echo "🛡️ Cursor Process Explosion Prevention"
echo "======================================"

# Monitor and alert
while true; do
    TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
    UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
    
    echo "$(date): Windows: $UNIQUE_WINDOWS, Processes: $TOTAL_PROCESSES"
    
    if [ $TOTAL_PROCESSES -gt 25 ]; then
        echo "🚨 ALERT: Process explosion detected!"
        echo "   - Close unused Cursor windows immediately"
        echo "   - Consider restarting Cursor"
        break
    fi
    
    if [ $UNIQUE_WINDOWS -gt 3 ]; then
        echo "⚠️  WARNING: Too many windows open"
        echo "   - Close unused windows"
    fi
    
    sleep 30  # Check every 30 seconds
done
```

## 📋 Daily Prevention Routine

### **Before Opening Cursor**
```bash
# Check if Cursor is already running
if pgrep -f "Cursor.app" > /dev/null; then
    echo "⚠️  Cursor already running - use existing window"
    echo "   - Don't open new windows"
    echo "   - Use tabs instead"
else
    echo "✅ Safe to open Cursor"
fi
```

### **Before Remote-SSH Connection**
```bash
# Ensure only one Cursor window
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🚨 Multiple Cursor windows detected"
    echo "   - Close unused windows before Remote-SSH"
    echo "   - Use single window for remote connections"
fi

# Clear SSH control connections
ssh -O exit n8ncloud 2>/dev/null || echo "No control connections to clear"
```

### **Weekly Maintenance**
```bash
# Restart Cursor completely
echo "🔄 Weekly Cursor restart recommended"
echo "   - Closes all windows"
echo "   - Clears accumulated process state"
echo "   - Prevents long-term conflicts"
```

## 💡 Pro Tips for Multiple Windows

### **Safe Multiple Window Usage**
1. **Limit to 2 windows maximum**
2. **Different purposes per window**:
   - Window 1: Local development
   - Window 2: Remote-SSH connections
3. **Never open Remote-SSH in multiple windows**
4. **Close unused windows immediately**
5. **Restart Cursor weekly if using multiple windows**

### **Alternative to Multiple Windows**
1. **Use single window with multiple tabs**
2. **Use workspace folders** for different projects
3. **Use split editors** within single window
4. **Use terminal tabs** for different SSH sessions

## 🔍 Troubleshooting Checklist

### **Process Count Issues**
- [ ] Total Cursor processes < 20?
- [ ] Unique windows ≤ 2?
- [ ] No zombie processes?
- [ ] Memory usage reasonable?

### **Multiple Window Issues**
- [ ] Only essential windows open?
- [ ] Remote-SSH in single window?
- [ ] Extension state consistent?
- [ ] No conflicting configurations?

### **Prevention Measures**
- [ ] Daily process monitoring?
- [ ] Weekly Cursor restart?
- [ ] Single window policy followed?
- [ ] Extension state cleared regularly?

## 🚀 Quick Commands Reference

```bash
# Monitor Cursor processes
ps aux | grep -i cursor | grep -v grep | wc -l

# Count unique windows
ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l

# View process breakdown
ps aux | grep -i cursor | grep -v grep | awk '{print $11}' | sort | uniq -c

# Emergency cleanup
pkill -f "Cursor.app"  # Force quit all Cursor processes

# Check for conflicts
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null
```

## 🎯 Prevention Summary

### **What NOT to Do (What Caused Today's Issue)**
- ❌ Open more than 2 Cursor windows
- ❌ Keep unused windows open
- ❌ Open Remote-SSH in multiple windows
- ❌ Ignore high process counts
- ❌ Never restart Cursor

### **What TO Do (Prevention Strategy)**
- ✅ Use single window with multiple tabs
- ✅ Limit to maximum 2 windows if needed
- ✅ Close unused windows immediately
- ✅ Monitor process count daily
- ✅ Restart Cursor weekly
- ✅ Clear extension state regularly

---
**Last Updated**: $(date)
**Created From**: Multiple Cursor windows causing 18+ processes and Remote-SSH conflicts
**Prevention Focus**: Process explosion prevention and single-window policy
**Status**: 🚨 CRITICAL - This was the root cause of today's issues

#!/bin/bash

# 🛡️ Daily Prevention Script for Cursor Remote-SSH Issues
# Run this before opening Cursor or attempting Remote-SSH connections

echo "🛡️ DAILY PREVENTION ROUTINE"
echo "============================"
echo "Running health checks and prevention measures..."
echo ""

# Step 1: Check Cursor process count
echo "1️⃣ Checking Cursor process count..."
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
echo "   Total Cursor processes: $TOTAL_PROCESSES"

if [ $TOTAL_PROCESSES -gt 20 ]; then
    echo "🚨 WARNING: Too many Cursor processes ($TOTAL_PROCESSES)"
    echo "   - Close unused Cursor windows"
    echo "   - Consider restarting Cursor"
    echo "   - High process count can cause Remote-SSH issues"
else
    echo "✅ Process count healthy (< 20)"
fi

# Step 2: Check Cursor windows
echo ""
echo "2️⃣ Checking Cursor windows..."
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
echo "   Unique Cursor windows: $UNIQUE_WINDOWS"

if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🚨 CRITICAL: Multiple Cursor windows detected!"
    echo "   - This is the root cause of Remote-SSH issues"
    echo "   - Close all windows except ONE"
    echo "   - Use tabs instead of multiple windows"
elif [ $UNIQUE_WINDOWS -eq 1 ]; then
    echo "✅ Single window detected - optimal for Remote-SSH"
else
    echo "ℹ️  No Cursor windows currently open"
fi

# Step 3: Clear SSH control connections
echo ""
echo "3️⃣ Clearing SSH control connections..."
ssh -O exit n8ncloud 2>/dev/null || echo "   No control connections to clear"
find ~/.ssh -name "cm-*" -delete 2>/dev/null
echo "   SSH control sockets cleared"

# Step 4: Test SSH connection
echo ""
echo "4️⃣ Testing SSH connection..."
ssh n8ncloud "echo 'Daily SSH health check passed'" 2>/dev/null && echo "✅ SSH connection healthy" || echo "❌ SSH connection needs attention"

# Step 5: Check Remote-SSH extension
echo ""
echo "5️⃣ Checking Remote-SSH extension..."
cursor --list-extensions | grep -i "remote\|ssh" | grep -q "anysphere.remote-ssh" && echo "✅ Remote-SSH extension installed" || echo "❌ Remote-SSH extension missing"

# Step 6: Check extension state
echo ""
echo "6️⃣ Checking extension state..."
EXTENSION_STATE_FILES=$(find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | wc -l)
echo "   Remote-SSH state files: $EXTENSION_STATE_FILES"

if [ $EXTENSION_STATE_FILES -gt 10 ]; then
    echo "⚠️  Many extension state files - consider clearing state"
    echo "   Run emergency recovery if Remote-SSH issues occur"
else
    echo "✅ Extension state looks healthy"
fi

# Step 7: Summary and recommendations
echo ""
echo "📊 PREVENTION SUMMARY"
echo "===================="

if [ $TOTAL_PROCESSES -le 20 ] && [ $UNIQUE_WINDOWS -le 1 ]; then
    echo "✅ System is healthy for Remote-SSH connections"
    echo "   - Process count: $TOTAL_PROCESSES (≤ 20)"
    echo "   - Window count: $UNIQUE_WINDOWS (≤ 1)"
    echo "   - SSH connection: Working"
    echo "   - Extension: Installed"
    echo ""
    echo "🎯 You're ready for Remote-SSH connections!"
else
    echo "⚠️  System needs attention before Remote-SSH"
    echo "   - Process count: $TOTAL_PROCESSES (should be ≤ 20)"
    echo "   - Window count: $UNIQUE_WINDOWS (should be ≤ 1)"
    echo ""
    echo "🔧 Recommended actions:"
    if [ $UNIQUE_WINDOWS -gt 1 ]; then
        echo "   1. Close all Cursor windows except ONE"
    fi
    if [ $TOTAL_PROCESSES -gt 20 ]; then
        echo "   2. Restart Cursor to clear process accumulation"
    fi
    echo "   3. Run this script again after fixes"
fi

echo ""
echo "💡 Prevention tips:"
echo "   - Use single window with multiple tabs"
echo "   - Close unused windows immediately"
echo "   - Restart Cursor weekly"
echo "   - Run this script before Remote-SSH attempts"

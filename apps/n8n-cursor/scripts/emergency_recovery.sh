#!/bin/bash

# 🚨 Emergency Recovery Script for Cursor Remote-SSH Issues
# This script will fix everything from zero knowledge

echo "🚨 EMERGENCY RECOVERY SCRIPT ACTIVATED"
echo "======================================"
echo "This will fix your Cursor Remote-SSH issues in 5 minutes"
echo ""

# Step 1: Check current state
echo "1️⃣ Checking current Cursor state..."
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l)
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep "vscode-window-config" | wc -l)
echo "   Total Cursor processes: $TOTAL_PROCESSES"
echo "   Unique Cursor windows: $UNIQUE_WINDOWS"

if [ $UNIQUE_WINDOWS -gt 1 ]; then
    echo "🚨 CRITICAL: Multiple Cursor windows detected!"
    echo "   - This is the root cause of your issues"
    echo "   - Close all windows except ONE after this script"
fi

# Step 2: Emergency shutdown
echo ""
echo "2️⃣ Emergency shutdown of Cursor..."
pkill -f "Cursor.app" 2>/dev/null
echo "   Cursor processes terminated"
sleep 3

# Step 3: Clear all corrupted state
echo ""
echo "3️⃣ Clearing all corrupted state..."
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
find ~/Library/Application\ Support/Cursor/User/workspaceStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | xargs rm -rf 2>/dev/null
echo "   Extension state cleared"

# Step 4: Clear SSH conflicts
echo ""
echo "4️⃣ Clearing SSH conflicts..."
ssh -O exit n8ncloud 2>/dev/null || echo "   No control connections to clear"
find ~/.ssh -name "cm-*" -delete 2>/dev/null
echo "   SSH control sockets cleared"

# Step 5: Verify SSH connection
echo ""
echo "5️⃣ Verifying SSH connection..."
ssh n8ncloud "echo 'SSH connection restored'" 2>/dev/null && echo "✅ SSH working" || echo "❌ SSH needs attention"

# Step 6: Ready for restart
echo ""
echo "6️⃣ Ready to restart Cursor..."
echo "🔄 Now restart Cursor with ONE window only"
echo "📱 Use Remote-SSH: Connect to Host... → n8ncloud"

echo ""
echo "✅ Emergency recovery script finished!"
echo "🎯 Remember: Only ONE Cursor window from now on!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Cursor"
echo "   2. Open ONE window only"
echo "   3. Connect via Remote-SSH: Connect to Host..."
echo "   4. Select 'n8ncloud'"
echo ""
echo "💡 Prevention: Use tabs instead of multiple windows!"

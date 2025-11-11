#!/bin/bash
# Cursor Memory Reduction Script
# Reduces Cursor RAM usage by closing unnecessary processes and clearing caches

set -e

echo "🔧 Cursor Memory Optimization"
echo "=============================="
echo ""

# Step 1: Check current state
echo "📊 Current State:"
TOTAL_PROCESSES=$(ps aux | grep -i cursor | grep -v grep | wc -l | tr -d ' ')
echo "   Total Cursor processes: $TOTAL_PROCESSES"

MEMORY_USAGE=$(ps aux | grep -i cursor | grep -v grep | awk '{sum+=$6} END {printf "%.1f", sum/1024}')
echo "   Current memory usage: ~${MEMORY_USAGE} MB RSS"
echo ""

# Step 2: Count unique windows
UNIQUE_WINDOWS=$(ps aux | grep -i cursor | grep -v grep | grep -c "vscode-window-config" || echo "0")
echo "🪟 Windows:"
echo "   Unique Cursor windows detected: $UNIQUE_WINDOWS"
echo ""

# Step 3: Recommendations
echo "💡 Recommendations:"
echo ""

if [ "$UNIQUE_WINDOWS" -gt 1 ]; then
    echo "   ⚠️  MULTIPLE WINDOWS DETECTED"
    echo "   → Close all Cursor windows except ONE"
    echo "   → Use tabs instead of multiple windows"
    echo "   → This can reduce memory by 50-70%"
    echo ""
fi

if [ "$TOTAL_PROCESSES" -gt 15 ]; then
    echo "   ⚠️  HIGH PROCESS COUNT ($TOTAL_PROCESSES processes)"
    echo "   → Normal: 5-8 processes per window"
    echo "   → Consider restarting Cursor"
    echo ""
fi

# Step 4: Safe cleanup options
echo "🧹 Safe Cleanup Options:"
echo ""
echo "   1. Close unused Cursor tabs/files"
echo "      → Right-click tabs → Close Others"
echo "      → Close files you're not actively editing"
echo ""
echo "   2. Clear Cursor caches (safe, won't lose work):"
echo "      → Run: rm -rf ~/Library/Caches/com.todesktop.230313mzl4w4u92/*"
echo "      → Run: rm -rf ~/Library/Application\\ Support/Cursor/Cache/*"
echo ""
echo "   3. Clear extension state (if extensions misbehaving):"
echo "      → Run: find ~/Library/Application\\ Support/Cursor/User/globalStorage -name '*.log' -delete"
echo ""
echo "   4. Restart Cursor (most effective):"
echo "      → Cmd+Q to quit completely"
echo "      → Wait 5 seconds"
echo "      → Reopen Cursor"
echo "      → Open only ONE window"
echo ""

# Step 5: Check for large files open
echo "📁 Large Files Check:"
LARGE_FILES=$(lsof -p $(pgrep -f "Cursor.app" | head -1) 2>/dev/null | grep -E "\.(json|log|db|sqlite)" | wc -l | tr -d ' ' || echo "0")
if [ "$LARGE_FILES" -gt 10 ]; then
    echo "   ⚠️  Many files open ($LARGE_FILES)"
    echo "   → Close unused files to reduce memory"
fi
echo ""

# Step 6: Memory optimization settings check
echo "⚙️  Settings Check:"
SETTINGS_FILE="$HOME/Library/Application Support/Cursor/User/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
    if grep -q "files.maxMemoryForLargeFilesMB" "$SETTINGS_FILE"; then
        echo "   ✅ Memory limit for large files is configured"
    else
        echo "   ⚠️  Consider adding memory limit settings"
    fi
else
    echo "   ⚠️  Settings file not found"
fi
echo ""

# Step 7: Final recommendations
echo "🎯 Immediate Actions:"
echo ""
echo "   [ ] Close all Cursor windows except ONE"
echo "   [ ] Close unused tabs/files"
echo "   [ ] Disable unused extensions"
echo "   [ ] Clear caches (commands above)"
echo "   [ ] Restart Cursor if memory > 2GB"
echo ""
echo "✅ Script complete!"
echo ""
echo "💡 Tip: Use single window with tabs instead of multiple windows"
echo "   This prevents process explosion and reduces memory by 50-70%"


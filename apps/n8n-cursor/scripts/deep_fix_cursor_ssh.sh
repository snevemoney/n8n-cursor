#!/bin/bash

echo "🚨 DEEP FIX Cursor Remote-SSH Extension"
echo "========================================"

echo "✅ Step 1: Verify SSH connection is working..."
ssh n8ncloud "echo 'SSH connection verified' && echo 'n8n service status:' && systemctl is-active n8n"

echo ""
echo "🔧 Step 2: Check current SSH configs..."
echo "Main SSH config:"
cat ~/.ssh/config
echo ""
echo "Cursor SSH config:"
cat ~/.ssh/config.cursor

echo ""
echo "🚨 Step 3: Force Remote-SSH Extension Reset"
echo "============================================"
echo ""
echo "The issue is that Cursor's Remote-SSH extension has conflicting configuration."
echo "We need to force reset the extension state and configuration."
echo ""

# Create a backup of current settings
cp ~/Library/Application\ Support/Cursor/User/settings.json ~/Library/Application\ Support/Cursor/User/settings.json.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ Settings backed up"

echo ""
echo "🔧 Step 4: Clear Remote-SSH Extension State"
echo "============================================"
echo ""

# Remove any Remote-SSH extension state files
find ~/Library/Application\ Support/Cursor/User/globalStorage -name "*remote*" -o -name "*ssh*" 2>/dev/null | while read file; do
    if [ -d "$file" ]; then
        echo "Removing directory: $file"
        rm -rf "$file" 2>/dev/null || echo "Could not remove: $file"
    else
        echo "Removing file: $file"
        rm -f "$file" 2>/dev/null || echo "Could not remove: $file"
    fi
done

echo ""
echo "🚨 CRITICAL: Complete Extension Reset Required"
echo "=============================================="
echo ""
echo "1. CLOSE ALL CURSOR WINDOWS COMPLETELY"
echo "2. Force quit Cursor from Activity Monitor"
echo "3. Delete the Remote-SSH extension:"
echo "   rm -rf ~/.cursor/extensions/anysphere.remote-ssh-1.0.26"
echo "4. Restart Cursor"
echo "5. Install the standard Microsoft Remote-SSH extension:"
echo "   - Press Cmd+Shift+X"
echo "   - Search for 'Remote - SSH' by Microsoft"
echo "   - Install it"
echo "6. Try connecting again with 'Remote-SSH: Connect to Host...'"
echo ""
echo "Alternative: Use the original working method"
echo "1. In Cursor, press Cmd+Shift+P"
echo "2. Type 'Remote-SSH: Connect to Host...'"
echo "3. Select 'n8ncloud'"
echo "4. If it asks for SSH config file, specify: ~/.ssh/config"
echo ""
echo "The issue is that Cursor's custom Remote-SSH extension is conflicting with your SSH config."

#!/bin/bash
# Surfshark Complete Reset Script
# This will reset Surfshark to default settings - you'll need to login again

echo "🔄 Resetting Surfshark to Default Settings..."
echo "=============================================="
echo ""

# Step 1: Quit Surfshark if running
echo "🛑 Step 1: Quitting Surfshark..."
killall "Surfshark" 2>/dev/null || true
killall "SurfsharkHelper" 2>/dev/null || true
sleep 2
echo "✅ Surfshark quit"

# Step 2: Remove all keychain entries
echo ""
echo "🗑️  Step 2: Removing keychain entries..."
security delete-generic-password -a "Surfshark" ~/Library/Keychains/login.keychain-db 2>/dev/null && echo "  ✅ Removed from login keychain" || echo "  ℹ️  No login keychain entry found"
security delete-generic-password -a "Surfshark" /Library/Keychains/System.keychain 2>/dev/null && echo "  ✅ Removed from system keychain" || echo "  ℹ️  No system keychain entry found"

# Remove all Surfshark-related keychain items
security find-generic-password -a "Surfshark" 2>/dev/null | grep "keychain:" | awk -F'"' '{print $2}' | while read keychain; do
    security delete-generic-password -a "Surfshark" "$keychain" 2>/dev/null && echo "  ✅ Removed from $keychain" || true
done

# Step 3: Remove preferences
echo ""
echo "🧹 Step 3: Removing preferences and settings..."
rm -rf ~/Library/Preferences/com.surfshark.Surfshark.plist 2>/dev/null && echo "  ✅ Removed preferences" || echo "  ℹ️  No preferences found"
rm -rf ~/Library/Preferences/com.surfshark.* 2>/dev/null && echo "  ✅ Removed all Surfshark preference files" || true

# Step 4: Remove application support data
echo ""
echo "📁 Step 4: Removing application data..."
rm -rf ~/Library/Application\ Support/Surfshark 2>/dev/null && echo "  ✅ Removed application support data" || echo "  ℹ️  No application support data found"
rm -rf ~/Library/Application\ Support/com.surfshark.* 2>/dev/null && echo "  ✅ Removed all Surfshark application data" || true

# Step 5: Remove cached data
echo ""
echo "💾 Step 5: Removing cached data..."
rm -rf ~/Library/Caches/com.surfshark.* 2>/dev/null && echo "  ✅ Removed cached data" || echo "  ℹ️  No cached data found"

# Step 6: Remove saved application state
echo ""
echo "💼 Step 6: Removing saved application state..."
rm -rf ~/Library/Saved\ Application\ State/com.surfshark.* 2>/dev/null && echo "  ✅ Removed saved state" || echo "  ℹ️  No saved state found"

# Step 7: Reset TCC permissions (Transparency, Consent, and Control)
echo ""
echo "🔐 Step 7: Resetting system permissions..."
tccutil reset All com.surfshark.Surfshark 2>/dev/null && echo "  ✅ Reset system permissions" || echo "  ℹ️  Could not reset permissions (may require admin)"

# Step 8: Remove any network extension preferences
echo ""
echo "🌐 Step 8: Removing network extension data..."
rm -rf ~/Library/Group\ Containers/*surfshark* 2>/dev/null && echo "  ✅ Removed network extension data" || echo "  ℹ️  No network extension data found"

echo ""
echo "✅ Reset Complete!"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo "1. Open Surfshark from Applications"
echo "2. You'll see the welcome/login screen"
echo "3. Log in with your credentials"
echo "4. When prompted for keychain access, click 'Allow'"
echo "5. Enter your admin password ONCE"
echo "6. Check 'Always Allow' if the option appears"
echo ""
echo "Surfshark is now reset to default settings! 🎉"







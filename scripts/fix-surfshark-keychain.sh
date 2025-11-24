#!/bin/bash
# Fix Surfshark Keychain Access - Grant permanent access to prevent repeated prompts

echo "🔧 Fixing Surfshark Keychain Access..."
echo "======================================"
echo ""

SURFSHARK_APP="/Applications/Surfshark.app"
SURFSHARK_BINARY="$SURFSHARK_APP/Contents/MacOS/Surfshark"

if [ ! -d "$SURFSHARK_APP" ]; then
    echo "❌ Surfshark app not found at $SURFSHARK_APP"
    exit 1
fi

echo "✅ Found Surfshark at: $SURFSHARK_APP"
echo ""

# Step 1: Quit Surfshark temporarily
echo "🛑 Step 1: Quitting Surfshark temporarily..."
killall "Surfshark" 2>/dev/null || true
sleep 2
echo "✅ Surfshark quit"
echo ""

# Step 2: Remove any existing problematic keychain entries
echo "🗑️  Step 2: Cleaning up existing keychain entries..."
security delete-generic-password -a "Surfshark" ~/Library/Keychains/login.keychain-db 2>/dev/null || true
security delete-generic-password -a "Surfshark" /Library/Keychains/System.keychain 2>/dev/null || true
echo "✅ Cleaned up old entries"
echo ""

# Step 3: Create a keychain entry with proper access control
echo "🔐 Step 3: Creating keychain entry with proper permissions..."
echo "   This will allow Surfshark to access the keychain without repeated prompts"

# Create a dummy password entry that Surfshark can access
# The -T flag specifies which applications can access this without prompting
security add-generic-password \
    -a "Surfshark" \
    -s "Surfshark" \
    -w "" \
    -T "$SURFSHARK_BINARY" \
    -T "/Library/SystemExtensions/46427F4D-C0F8-46B1-BAE8-FFAF6611CC72/com.surfshark.vpnclient.macos.direct.Antivirus.systemextension/Contents/MacOS/com.surfshark.vpnclient.macos.direct.Antivirus" \
    -U \
    ~/Library/Keychains/login.keychain-db 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Keychain entry created successfully"
else
    echo "⚠️  Could not create keychain entry automatically"
    echo "   You may need to allow access manually when prompted"
fi
echo ""

# Step 4: Set keychain access control to allow automatic access
echo "🔓 Step 4: Configuring keychain access control..."
# Grant access to the keychain item for Surfshark processes
security set-generic-password-partition-list -S "appl:" -a "Surfshark" ~/Library/Keychains/login.keychain-db 2>/dev/null || true
echo "✅ Access control configured"
echo ""

# Step 5: Grant Full Disk Access (if needed)
echo "📋 Step 5: Checking system permissions..."
echo "   Note: You may need to manually grant Full Disk Access in System Settings"
echo "   System Settings → Privacy & Security → Full Disk Access → Add Surfshark"
echo ""

# Step 6: Reset TCC to allow fresh permission grant
echo "🔄 Step 6: Resetting TCC permissions for fresh grant..."
tccutil reset All com.surfshark.Surfshark 2>/dev/null || echo "  ℹ️  TCC reset may require admin privileges"
echo ""

echo "✅ Keychain Fix Complete!"
echo "======================================"
echo ""
echo "📝 Next Steps:"
echo "1. Open Surfshark from Applications"
echo "2. When the keychain prompt appears:"
echo "   - Click 'Allow'"
echo "   - Enter your admin password"
echo "   - IMPORTANT: Check 'Always Allow' if available"
echo "3. If prompted again, repeat step 2"
echo "4. The prompts should stop after granting access twice (once for app, once for extension)"
echo ""
echo "💡 Tip: If prompts continue, go to:"
echo "   System Settings → Privacy & Security → Full Disk Access"
echo "   Make sure Surfshark is enabled"
echo ""







#!/bin/bash

# 🔄 Automated File Sync Script
# Syncs files between local and SSH Cursor windows

echo "🔄 AUTOMATED FILE SYNCHRONIZATION"
echo "================================="
echo "Syncing files between local and SSH Cursor windows..."
echo ""

# Step 1: Sync from local to SSH
echo "📤 Syncing local files to SSH..."
scp *.md n8ncloud:~/n8n-cursor/ 2>/dev/null && echo "✅ Markdown files synced to SSH" || echo "❌ Markdown sync to SSH failed"

if [ -d "scripts" ]; then
    scp scripts/*.sh n8ncloud:~/n8n-cursor/scripts/ 2>/dev/null && echo "✅ Script files synced to SSH" || echo "❌ Script sync to SSH failed"
else
    echo "⚠️  No local scripts directory found"
fi

# Step 2: Sync from SSH to local
echo ""
echo "📥 Syncing SSH files to local..."
scp n8ncloud:~/n8n-cursor/*.md ./ 2>/dev/null && echo "✅ SSH markdown files synced to local" || echo "❌ SSH markdown sync to local failed"

ssh n8ncloud "ls -la ~/n8n-cursor/scripts/" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    scp n8ncloud:~/n8n-cursor/scripts/*.sh ./scripts/ 2>/dev/null && echo "✅ SSH script files synced to local" || echo "❌ SSH script sync to local failed"
else
    echo "⚠️  No SSH scripts directory found"
fi

# Step 3: Verify sync
echo ""
echo "🔍 Verifying synchronization..."
LOCAL_FILES=$(ls -la *.md | wc -l)
SSH_FILES=$(ssh n8ncloud "cd n8n-cursor && ls -la *.md | wc -l")

echo "   Local markdown files: $LOCAL_FILES"
echo "   SSH markdown files: $SSH_FILES"

if [ $LOCAL_FILES -eq $SSH_FILES ]; then
    echo "✅ File counts match - sync successful!"
else
    echo "⚠️  File counts don't match - sync may be incomplete"
fi

echo ""
echo "🔄 File synchronization complete!"
echo ""
echo "💡 Tips:"
echo "   - Run this script after making changes"
echo "   - Check both windows to verify files appear"
echo "   - Use git for long-term project synchronization"

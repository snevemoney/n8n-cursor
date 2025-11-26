#!/bin/bash

# Bidirectional File Sync Script
# Syncs files in BOTH directions between local and SSH Cursor windows

echo "BIDIRECTIONAL FILE SYNCHRONIZATION"
echo "=================================="
echo "Syncing files in both directions..."
echo ""

# Step 1: Check current file counts
echo "Current file status..."
LOCAL_MD_COUNT=$(ls -la *.md 2>/dev/null | wc -l)
LOCAL_SH_COUNT=$(ls -la scripts/*.sh 2>/dev/null | wc -l 2>/dev/null || echo "0")
SSH_MD_COUNT=$(ssh n8ncloud "cd n8n-cursor && ls -la *.md 2>/dev/null | wc -l")
SSH_SH_COUNT=$(ssh n8ncloud "cd n8n-cursor && ls -la scripts/*.sh 2>/dev/null | wc -l 2>/dev/null || echo "0")

echo "   Local: $LOCAL_MD_COUNT .md files, $LOCAL_SH_COUNT .sh files"
echo "   SSH:   $SSH_MD_COUNT .md files, $SSH_SH_COUNT .sh files"
echo ""

# Step 2: Sync from Local to SSH
echo "Syncing local files to SSH..."
scp *.md n8ncloud:~/n8n-cursor/ 2>/dev/null && echo "Markdown files synced to SSH" || echo "Markdown sync to SSH failed"

if [ -d "scripts" ]; then
    scp scripts/*.sh n8ncloud:~/n8n-cursor/scripts/ 2>/dev/null && echo "Script files synced to SSH" || echo "Script sync to SSH failed"
else
    echo "No local scripts directory found"
fi

# Step 3: Sync from SSH to Local
echo ""
echo "Syncing SSH files to local..."
scp n8ncloud:~/n8n-cursor/*.md ./ 2>/dev/null && echo "SSH markdown files synced to local" || echo "SSH markdown sync to local failed"

ssh n8ncloud "ls -la ~/n8n-cursor/scripts/" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    scp n8ncloud:~/n8n-cursor/scripts/*.sh ./scripts/ 2>/dev/null && echo "SSH script files synced to local" || echo "SSH script sync to local failed"
else
    echo "No SSH scripts directory found"
fi

# Step 4: Verify bidirectional sync
echo ""
echo "Verifying bidirectional synchronization..."
FINAL_LOCAL_MD=$(ls -la *.md 2>/dev/null | wc -l)
FINAL_SSH_MD=$(ssh n8ncloud "cd n8n-cursor && ls -la *.md 2>/dev/null | wc -l")

echo "   Final local markdown files: $FINAL_LOCAL_MD"
echo "   Final SSH markdown files: $FINAL_SSH_MD"

if [ $FINAL_LOCAL_MD -eq $FINAL_SSH_MD ]; then
    echo "Bidirectional sync successful - file counts match!"
else
    echo "Bidirectional sync may be incomplete - file counts don't match"
fi

echo ""
echo "Bidirectional synchronization complete!"

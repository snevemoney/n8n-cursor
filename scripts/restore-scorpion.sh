#!/usr/bin/env bash
set -euo pipefail

# Scorpion Data Restoration Script
# Restores Scorpion persistent data from a backup
# Now supports SSD auto-detection

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_ROOT="$WORKSPACE_ROOT/backups/scorpion"

# Detect actual data directory (SSD-aware)
SCORPION_DATA_DIR=""

# Check for manual override
if [ -n "${SCORPION_SSD_PATH:-}" ] && [ -d "${SCORPION_SSD_PATH}/scorpion-data" ]; then
    SCORPION_DATA_DIR="${SCORPION_SSD_PATH}/scorpion-data"
    echo "📀 Using manual SSD path: $SCORPION_DATA_DIR"
# Check for SSD at /Volumes/SSD
elif [ -d "/Volumes/SSD/scorpion-data" ]; then
    SCORPION_DATA_DIR="/Volumes/SSD/scorpion-data"
    echo "📀 Using detected SSD: $SCORPION_DATA_DIR"
# Check for other external drives
else
    # Check all volumes for scorpion-data
    for volume in /Volumes/*; do
        if [ -d "${volume}/scorpion-data" ] && [ "${volume}" != "/Volumes/Macintosh HD" ]; then
            SCORPION_DATA_DIR="${volume}/scorpion-data"
            echo "📀 Using external drive: $SCORPION_DATA_DIR"
            break
        fi
    done
fi

# Fallback to default location
if [ -z "$SCORPION_DATA_DIR" ]; then
    SCORPION_DATA_DIR="$WORKSPACE_ROOT/apps/scorpion/data/scorpion"
    echo "💾 Using default location: $SCORPION_DATA_DIR"
fi

echo "🦂 SCORPION DATA RESTORATION"
echo "============================="
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_ROOT" ]; then
    echo "❌ Backup directory not found: $BACKUP_ROOT"
    exit 1
fi

# List available backups
echo "📦 Available backups:"
echo ""
BACKUPS=()
INDEX=1
for backup in "$BACKUP_ROOT"/scorpion-backup-*.tar.gz; do
    if [ -f "$backup" ]; then
        BACKUP_NAME=$(basename "$backup")
        BACKUP_DATE=$(echo "$BACKUP_NAME" | sed 's/scorpion-backup-//; s/.tar.gz//')
        BACKUP_SIZE=$(du -h "$backup" | cut -f1)
        BACKUP_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
        
        echo "  [$INDEX] $BACKUP_NAME"
        echo "      Date: $BACKUP_DATE"
        echo "      Size: $BACKUP_SIZE"
        echo "      Modified: $BACKUP_TIME"
        echo ""
        
        BACKUPS+=("$backup")
        INDEX=$((INDEX + 1))
    fi
done

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "❌ No backups found in $BACKUP_ROOT"
    exit 1
fi

# Prompt for backup selection
echo "Select backup to restore (1-${#BACKUPS[@]}) or 'q' to quit:"
read -r SELECTION

if [ "$SELECTION" = "q" ] || [ "$SELECTION" = "Q" ]; then
    echo "Restoration cancelled."
    exit 0
fi

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#BACKUPS[@]} ]; then
    echo "❌ Invalid selection"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$((SELECTION - 1))]}"
SELECTED_BACKUP_NAME=$(basename "$SELECTED_BACKUP")

echo ""
echo "Selected backup: $SELECTED_BACKUP_NAME"
echo ""

# Confirm restoration
echo "⚠️  WARNING: This will overwrite existing Scorpion data!"
echo "   Current data location: $SCORPION_DATA_DIR"
echo ""
echo "Type 'yes' to confirm restoration:"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restoration cancelled."
    exit 0
fi

# Create backup of current data before restoration
echo ""
echo "💾 Creating backup of current data..."
CURRENT_BACKUP="$BACKUP_ROOT/pre-restore-$(date -u +%Y%m%d-%H%M%S).tar.gz"
if [ -d "$SCORPION_DATA_DIR" ] && [ "$(ls -A $SCORPION_DATA_DIR 2>/dev/null)" ]; then
    # Use detected data directory (SSD-aware)
    tar -czf "$CURRENT_BACKUP" -C "$(dirname "$SCORPION_DATA_DIR")" "$(basename "$SCORPION_DATA_DIR")" 2>/dev/null || true
    echo "   ✅ Current data backed up to: $(basename "$CURRENT_BACKUP")"
else
    echo "   ℹ️  No existing data to backup"
fi

# Extract backup
echo ""
echo "📦 Extracting backup..."
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

tar -xzf "$SELECTED_BACKUP" -C "$TEMP_DIR"
EXTRACTED_DIR="$TEMP_DIR/scorpion-backup-$(echo "$SELECTED_BACKUP_NAME" | sed 's/scorpion-backup-//; s/.tar.gz//')"

if [ ! -d "$EXTRACTED_DIR" ]; then
    echo "❌ Failed to extract backup"
    exit 1
fi

# Verify backup contents
echo ""
echo "🔍 Verifying backup contents..."
MANIFEST="$EXTRACTED_DIR/manifest.json"
if [ -f "$MANIFEST" ]; then
    echo "   ✅ Backup manifest found"
    cat "$MANIFEST" | grep -q "scorpion-data" && echo "   ✅ Backup type verified"
else
    echo "   ⚠️  No manifest found, proceeding anyway"
fi

# Restore data
echo ""
echo "🔄 Restoring data..."
mkdir -p "$SCORPION_DATA_DIR"

# Copy each file from backup
RESTORED_FILES=0
for file in "$EXTRACTED_DIR"/*.json; do
    if [ -f "$file" ]; then
        FILENAME=$(basename "$file")
        cp "$file" "$SCORPION_DATA_DIR/"
        echo "   ✅ Restored: $FILENAME"
        RESTORED_FILES=$((RESTORED_FILES + 1))
    fi
done

if [ $RESTORED_FILES -eq 0 ]; then
    echo "   ⚠️  No data files found in backup"
else
    echo ""
    echo "✅ Restoration complete!"
    echo "   Restored $RESTORED_FILES file(s) to $SCORPION_DATA_DIR"
    echo ""
    echo "💡 Tip: Restart Scorpion to load restored data"
fi


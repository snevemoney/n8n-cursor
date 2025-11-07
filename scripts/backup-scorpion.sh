#!/usr/bin/env bash
set -euo pipefail

# Scorpion Data Backup Script
# Backs up all Scorpion persistent data (RAG, Ontology, Training Data, Mistakes)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCORPION_DATA_DIR="$WORKSPACE_ROOT/apps/scorpion/data/scorpion"
BACKUP_ROOT="$WORKSPACE_ROOT/backups/scorpion"
TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/scorpion-backup-$TIMESTAMP"

echo "🦂 SCORPION DATA BACKUP"
echo "======================"
echo "Timestamp: $TIMESTAMP"
echo "Source: $SCORPION_DATA_DIR"
echo "Destination: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if data directory exists
if [ ! -d "$SCORPION_DATA_DIR" ]; then
    echo "⚠️  Scorpion data directory not found: $SCORPION_DATA_DIR"
    echo "   Creating empty backup..."
    touch "$BACKUP_DIR/.no-data"
    echo "✅ Empty backup created"
    exit 0
fi

# Backup RAG store
if [ -f "$SCORPION_DATA_DIR/rag-store.json" ]; then
    echo "📚 Backing up RAG store..."
    cp "$SCORPION_DATA_DIR/rag-store.json" "$BACKUP_DIR/rag-store.json"
    echo "   ✅ RAG store backed up"
else
    echo "   ⚠️  RAG store not found"
fi

# Backup Ontology store
if [ -f "$SCORPION_DATA_DIR/ontology-store.json" ]; then
    echo "🔗 Backing up Ontology store..."
    cp "$SCORPION_DATA_DIR/ontology-store.json" "$BACKUP_DIR/ontology-store.json"
    echo "   ✅ Ontology store backed up"
else
    echo "   ⚠️  Ontology store not found"
fi

# Backup Training Data
if [ -f "$SCORPION_DATA_DIR/training-data.json" ]; then
    echo "🎓 Backing up Training Data..."
    cp "$SCORPION_DATA_DIR/training-data.json" "$BACKUP_DIR/training-data.json"
    echo "   ✅ Training data backed up"
else
    echo "   ⚠️  Training data not found"
fi

# Backup Mistakes log
if [ -f "$SCORPION_DATA_DIR/mistakes.json" ]; then
    echo "📝 Backing up Mistakes log..."
    cp "$SCORPION_DATA_DIR/mistakes.json" "$BACKUP_DIR/mistakes.json"
    echo "   ✅ Mistakes log backed up"
else
    echo "   ⚠️  Mistakes log not found"
fi

# Create backup manifest
cat > "$BACKUP_DIR/manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "backupType": "scorpion-data",
  "version": "1.0.0",
  "files": [
    $(if [ -f "$BACKUP_DIR/rag-store.json" ]; then echo '    "rag-store.json",'; fi)
    $(if [ -f "$BACKUP_DIR/ontology-store.json" ]; then echo '    "ontology-store.json",'; fi)
    $(if [ -f "$BACKUP_DIR/training-data.json" ]; then echo '    "training-data.json",'; fi)
    $(if [ -f "$BACKUP_DIR/mistakes.json" ]; then echo '    "mistakes.json"'; fi)
  ],
  "source": "$SCORPION_DATA_DIR"
}
EOF

# Compress backup
echo ""
echo "📦 Compressing backup..."
cd "$BACKUP_ROOT"
tar czf "scorpion-backup-$TIMESTAMP.tar.gz" "scorpion-backup-$TIMESTAMP"
rm -rf "scorpion-backup-$TIMESTAMP"
echo "   ✅ Backup compressed: scorpion-backup-$TIMESTAMP.tar.gz"

# Cleanup old backups (keep last 7 days)
echo ""
echo "🧹 Cleaning up old backups..."
find "$BACKUP_ROOT" -name "scorpion-backup-*.tar.gz" -type f -mtime +7 -delete
echo "   ✅ Old backups cleaned (kept last 7 days)"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_ROOT/scorpion-backup-$TIMESTAMP.tar.gz" | cut -f1)
echo ""
echo "✅ Backup complete!"
echo "   Size: $BACKUP_SIZE"
echo "   Location: $BACKUP_ROOT/scorpion-backup-$TIMESTAMP.tar.gz"
echo ""
echo "To restore:"
echo "  tar xzf $BACKUP_ROOT/scorpion-backup-$TIMESTAMP.tar.gz -C $SCORPION_DATA_DIR --strip-components=1"


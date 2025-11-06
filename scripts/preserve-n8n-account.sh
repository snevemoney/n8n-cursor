#!/bin/bash
set -e

echo "🔒 PRESERVING EXISTING N8N ACCOUNT DATA"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
BACKUP_DIR="backups/n8n-account-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_status "Creating backup directory: $BACKUP_DIR"

# Step 1: Backup local n8n data
print_status "Step 1: Backing up local n8n data..."
if docker volume ls | grep -q "n8n-cursor_n8n-cursor_n8n_data"; then
    print_status "Found local n8n data volume, creating backup..."
    
    # Create backup of the volume
    docker run --rm -v n8n-cursor_n8n-cursor_n8n_data:/data -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar czf /backup/local-n8n-data.tar.gz -C /data .
    
    if [ $? -eq 0 ]; then
        print_success "Local n8n data backed up to $BACKUP_DIR/local-n8n-data.tar.gz"
    else
        print_error "Failed to backup local n8n data"
    fi
else
    print_warning "No local n8n data volume found"
fi

# Step 2: Backup PostgreSQL data
print_status "Step 2: Backing up PostgreSQL data..."
if docker ps | grep -q "lightningflow-postgres"; then
    print_status "Found PostgreSQL container, creating backup..."
    
    # Create backup of PostgreSQL
    docker exec lightningflow-postgres pg_dump -U postgres n8n > "$BACKUP_DIR/postgres-n8n-backup.sql" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL n8n data backed up to $BACKUP_DIR/postgres-n8n-backup.sql"
    else
        print_warning "PostgreSQL backup failed (may not have n8n database)"
    fi
else
    print_warning "PostgreSQL container not running"
fi

# Step 3: Check for existing user data
print_status "Step 3: Checking for existing user data..."
if [ -f "$BACKUP_DIR/local-n8n-data.tar.gz" ]; then
    print_status "Extracting and checking local n8n database..."
    
    # Extract and check the database
    docker run --rm -v "$(pwd)/$BACKUP_DIR:/backup" alpine sh -c "
        cd /backup && tar xzf local-n8n-data.tar.gz
        if [ -f database.sqlite ]; then
            apk add --no-cache sqlite
            echo 'Checking for users in database:'
            sqlite3 database.sqlite 'SELECT email, firstName, lastName, createdAt FROM User;' 2>/dev/null || echo 'No users found'
            echo 'Database tables:'
            sqlite3 database.sqlite '.tables' 2>/dev/null || echo 'Cannot read schema'
        else
            echo 'No database.sqlite found in backup'
        fi
    "
fi

# Step 4: Create VPS backup script
print_status "Step 4: Creating VPS backup script..."
cat > "$BACKUP_DIR/vps-backup-commands.sh" << 'VPS_BACKUP_SCRIPT'
#!/bin/bash
set -e

echo "🔒 VPS N8N ACCOUNT BACKUP SCRIPT"
echo "================================="

# Create backup directory
BACKUP_DIR="/opt/lightningflow/backups/n8n-account-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup directory: $BACKUP_DIR"

# Step 1: Backup n8n data directory
echo "Step 1: Backing up n8n data directory..."
if [ -d "/opt/lightningflow/data/n8n_data" ]; then
    tar czf "$BACKUP_DIR/n8n-data-backup.tar.gz" -C /opt/lightningflow/data n8n_data
    echo "✅ n8n data backed up to $BACKUP_DIR/n8n-data-backup.tar.gz"
else
    echo "⚠️  No n8n data directory found"
fi

# Step 2: Backup Docker volumes
echo "Step 2: Backing up Docker volumes..."
if docker volume ls | grep -q "n8n"; then
    for volume in $(docker volume ls --format "{{.Name}}" | grep n8n); do
        echo "Backing up volume: $volume"
        docker run --rm -v "$volume:/data" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/$volume-backup.tar.gz" -C /data .
    done
    echo "✅ Docker volumes backed up"
else
    echo "⚠️  No n8n Docker volumes found"
fi

# Step 3: Check for user data
echo "Step 3: Checking for user data..."
if [ -f "$BACKUP_DIR/n8n-data-backup.tar.gz" ]; then
    echo "Extracting and checking n8n database..."
    cd "$BACKUP_DIR"
    tar xzf n8n-data-backup.tar.gz
    
    if [ -f "n8n_data/database.sqlite" ]; then
        echo "Installing sqlite and checking database..."
        docker run --rm -v "$(pwd)/n8n_data:/data" alpine sh -c "
            apk add --no-cache sqlite
            echo 'Users in database:'
            sqlite3 /data/database.sqlite 'SELECT email, firstName, lastName, createdAt FROM User;' 2>/dev/null || echo 'No users found'
            echo 'Database tables:'
            sqlite3 /data/database.sqlite '.tables' 2>/dev/null || echo 'Cannot read schema'
        "
    else
        echo "No database.sqlite found in backup"
    fi
fi

echo ""
echo "🔒 VPS BACKUP COMPLETED!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📋 Files created:"
ls -la "$BACKUP_DIR"

VPS_BACKUP_SCRIPT

chmod +x "$BACKUP_DIR/vps-backup-commands.sh"
print_success "VPS backup script created: $BACKUP_DIR/vps-backup-commands.sh"

# Step 5: Create recovery instructions
print_status "Step 5: Creating recovery instructions..."
cat > "$BACKUP_DIR/RECOVERY_INSTRUCTIONS.md" << 'RECOVERY_INSTRUCTIONS'
# N8N Account Recovery Instructions

## 🔒 Backup Created
**Date:** $(date)  
**Backup Location:** $BACKUP_DIR  
**User Email:** snevemoney12@gmail.com

## 📋 What Was Backed Up
1. **Local n8n data volume** - Contains SQLite database, workflows, credentials
2. **PostgreSQL data** - If n8n was using PostgreSQL
3. **VPS backup script** - To backup VPS data before changes

## 🚨 IMPORTANT: Before Making Changes

### Step 1: Backup VPS Data
```bash
# Copy this to your VPS terminal:
chmod +x vps-backup-commands.sh
./vps-backup-commands.sh
```

### Step 2: Verify Your Account Exists
After running the VPS backup, check if your account exists:
- Look for "snevemoney12@gmail.com" in the database output
- Note any workflows or credentials associated with your account

### Step 3: Preserve Account Data
If your account exists, we need to:
1. **Export your workflows** before any changes
2. **Export your credentials** 
3. **Note your user ID and settings**

## 🔧 Safe Recovery Process

### Option 1: Preserve Existing Account
If your account exists in the VPS database:
1. **DO NOT** run the permission fix script yet
2. **First** backup all your data
3. **Then** we'll modify the fix script to preserve your account

### Option 2: Restore from Backup
If your account gets lost:
1. Stop the new n8n container
2. Restore from the backup files
3. Restart n8n with your original data

## 📞 Next Steps
1. **Run the VPS backup script first**
2. **Check if your account exists**
3. **Let me know what you find**
4. **I'll modify the fix script to preserve your account**

## 🛡️ Safety Measures
- All data is backed up before any changes
- Original containers are preserved
- Recovery process is documented
- No data will be lost

RECOVERY_INSTRUCTIONS

print_success "Recovery instructions created: $BACKUP_DIR/RECOVERY_INSTRUCTIONS.md"

# Step 6: Show backup summary
print_status "Step 6: Backup summary..."
echo ""
echo "=== BACKUP SUMMARY ==="
echo "Backup directory: $BACKUP_DIR"
echo "Files created:"
ls -la "$BACKUP_DIR"

echo ""
echo "=== NEXT STEPS ==="
echo "1. Copy the VPS backup script to your VPS:"
echo "   scp $BACKUP_DIR/vps-backup-commands.sh root@69.62.66.78:/tmp/"
echo ""
echo "2. Run the backup script on your VPS:"
echo "   chmod +x /tmp/vps-backup-commands.sh"
echo "   ./tmp/vps-backup-commands.sh"
echo ""
echo "3. Check if your account exists in the VPS database"
echo ""
echo "4. Let me know what you find, and I'll modify the fix script"
echo "   to preserve your existing account"

print_success "🔒 ACCOUNT PRESERVATION COMPLETED!"
print_warning "⚠️  DO NOT run the VPS fix script until we verify your account exists!"
print_status "📋 Follow the recovery instructions above"

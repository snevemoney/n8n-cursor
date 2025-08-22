#!/bin/bash

echo "🔄 Complete n8n Environment Restoration"
echo "========================================"
echo ""

# Stop current n8n
echo "1. Stopping current n8n..."
docker-compose down

# Backup current state
echo "2. Backing up current state..."
sudo cp -r /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/ /tmp/n8n_backup_$(date +%Y%m%d_%H%M%S)

# Recreate the volume to start fresh
echo "3. Creating fresh n8n environment..."
docker volume rm n8n-cursor_n8n_data
docker-compose up -d

echo "4. Waiting for n8n to initialize..."
sleep 30

echo "5. ✅ n8n is ready for setup!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to https://n8ncloud.tech"
echo "   2. Set up your owner account:"
echo "      - Email: snevemoney12@gmail.com"  
echo "      - First Name: evens"
echo "      - Last Name: louis"
echo "      - Password: [your choice]"
echo "   3. After login, I'll help you restore all workflows"
echo ""
echo "📁 Your workflows are ready to import from:"
echo "   ~/n8n-cursor/workflows/"
echo ""
echo "🎯 This will give you a completely fresh n8n with all your workflows!"

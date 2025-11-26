#!/bin/bash
# Quick script to add /etc/hosts entries
# Run this and enter your password when prompted

echo "Adding local domain entries to /etc/hosts..."
echo "You'll be prompted for your password."

sudo sh -c 'cat >> /etc/hosts << EOF

# LightningFlow Local Development - Added $(date)
127.0.0.1 open-webui.local
127.0.0.1 anythingllm.local
127.0.0.1 n8n.local
127.0.0.1 lightningflow.local
127.0.0.1 app.lightningflow.local
127.0.0.1 ops.lightningflow.local
127.0.0.1 api.lightningflow.local
EOF'

echo ""
echo "✅ Hosts entries added!"
echo ""
echo "Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

echo ""
echo "🎉 Done! You can now access:"
echo "  - http://open-webui.local"
echo "  - http://anythingllm.local"
echo "  - http://n8n.local"


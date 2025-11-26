#!/bin/bash
# Setup local /etc/hosts entries for development

echo "🔧 Setting up local /etc/hosts entries..."
echo "This requires sudo privileges."

# Check if entries already exist
if grep -q "n8n.local" /etc/hosts && grep -q "lightningflow.local" /etc/hosts && grep -q "open-webui.local" /etc/hosts && grep -q "anythingllm.local" /etc/hosts; then
    echo "✅ Local domains already configured in /etc/hosts"
else
    echo "📝 Adding local domains to /etc/hosts..."
    sudo sh -c 'cat >> /etc/hosts << EOF

# LightningFlow Local Development
127.0.0.1 n8n.local
127.0.0.1 lightningflow.local
127.0.0.1 app.lightningflow.local
127.0.0.1 ops.lightningflow.local
127.0.0.1 api.lightningflow.local
127.0.0.1 open-webui.local
127.0.0.1 anythingllm.local
EOF'
    echo "✅ Local domains added to /etc/hosts"
fi

echo ""
echo "📋 Configured domains:"
echo "  - http://n8n.local"
echo "  - http://lightningflow.local"
echo "  - http://app.lightningflow.local"
echo "  - http://ops.lightningflow.local"
echo "  - http://api.lightningflow.local"
echo "  - http://open-webui.local"
echo "  - http://anythingllm.local"
echo ""
echo "Next: Run 'docker compose -f infra/docker/docker-compose.dev.yml up -d' to start services"


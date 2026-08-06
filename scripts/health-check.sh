#!/bin/bash
set -e

echo "🏥 LightningFlow AI - Health Check"
echo "================================="

# Check if we're running locally or on VPS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Checking local development services..."
    
    # Local health check
    for h in lightningflow.local app.lightningflow.local ops.lightningflow.local api.lightningflow.local n8n.local; do
        echo -n "Checking $h... "
        if curl -sS http://$h/healthz >/dev/null 2>&1; then
            echo "✅ OK"
        else
            echo "❌ FAIL"
        fi
    done
    
    # Check Docker containers
    echo ""
    echo "🐳 Docker containers:"
    docker compose -f infra/docker/docker-compose.dev.yml ps
    
else
    echo "🖥️  Checking production services..."
    
    # Production health check
    for d in lightningflow.online app.lightningflow.online ops.lightningflow.online evenslouis.ca/n8n; do
        echo -n "Checking https://$d/healthz... "
        if curl -sS https://$d/healthz >/dev/null 2>&1; then
            echo "✅ OK"
        else
            echo "❌ FAIL"
        fi
    done
    
    # Check Docker containers
    echo ""
    echo "🐳 Docker containers:"
    docker compose -f infra/docker/docker-compose.prod.yml ps
    
    # Check Caddy status
    echo ""
    echo "🌐 Caddy status:"
    sudo systemctl status caddy --no-pager -l
fi

echo ""
echo "✅ Health check complete!"

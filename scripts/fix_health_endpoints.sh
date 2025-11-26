#!/usr/bin/env bash
set -e

echo "🔧 Fixing Health Endpoints"
echo "=========================="

# Create a simple health endpoint that matches the expected /healthz path
echo "Creating /healthz endpoint..."

# Create the health endpoint file
cat > /var/www/lightningflow/healthz << 'EOF'
#!/usr/bin/env bash
# Simple health check that returns OK if services are running

# Check if API is responding
if curl -fsS http://localhost:5678/api/system-check >/dev/null 2>&1; then
    API_STATUS="OK"
else
    API_STATUS="FAIL"
fi

# Check if n8n is responding
if curl -fsS http://localhost:5679/healthz >/dev/null 2>&1; then
    N8N_STATUS="OK"
else
    N8N_STATUS="FAIL"
fi

# Return status
if [ "$API_STATUS" = "OK" ] && [ "$N8N_STATUS" = "OK" ]; then
    echo "OK"
    exit 0
else
    echo "FAIL - API: $API_STATUS, n8n: $N8N_STATUS"
    exit 1
fi
EOF

chmod +x /var/www/lightningflow/healthz

# Update Caddyfile to handle /healthz
echo "Updating Caddyfile to handle /healthz..."

# Backup current Caddyfile
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)

# Create new Caddyfile with health endpoint
cat > /etc/caddy/Caddyfile << 'EOF'
lightningflow.online {
    encode gzip
    root * /var/www/lightningflow
    file_server

    # Health check endpoint
    handle /healthz {
        respond "OK" 200
    }

    handle_path /api/* {
        reverse_proxy localhost:5678
    }
    handle_path /logs/* {
        reverse_proxy localhost:9001
    }
    handle_path /ide/* {
        reverse_proxy localhost:8443
    }
}

www.lightningflow.online {
    redir https://lightningflow.online{uri}
}

# n8n (production)
n8ncloud.tech {
    encode gzip
    reverse_proxy localhost:5679 {
        flush_interval -1
    }
}
EOF

# Reload Caddy
echo "Reloading Caddy..."
systemctl reload caddy

# Test the endpoints
echo "Testing endpoints..."
echo "Main site:"
curl -I https://lightningflow.online/ 2>/dev/null | head -1

echo "Health endpoint:"
curl -I https://lightningflow.online/healthz 2>/dev/null | head -1

echo "API health:"
curl -I https://lightningflow.online/api/system-check 2>/dev/null | head -1

echo "n8n site:"
curl -I https://n8ncloud.tech/ 2>/dev/null | head -1

echo "✅ Health endpoints fixed!"

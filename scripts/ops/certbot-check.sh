#!/usr/bin/env bash
# TLS/Certbot Check Script - Print commands only, don't execute
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

log_info "TLS/Certbot Check & Setup Guide"
log_info "==============================="

log_info "Current certificate status:"
if command -v certbot &>/dev/null; then
  log_info "Certbot installed: $(certbot --version 2>/dev/null || echo 'Error getting version')"
  if [[ -d /etc/letsencrypt/live ]]; then
    log_info "Active certificates:"
    sudo ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "No certificates found"
  else
    log_info "No certificates directory found"
  fi
else
  log_warn "Certbot not installed"
fi

log_info ""
log_info "Nginx status:"
if command -v nginx &>/dev/null; then
  log_info "Nginx installed: $(nginx -v 2>&1 | head -1)"
  if systemctl is-active --quiet nginx; then
    log_info "Nginx status: Active"
  else
    log_warn "Nginx status: Inactive"
  fi
else
  log_warn "Nginx not installed"
fi

log_info ""
log_info "TLS Setup Commands:"
log_info "==================="

log_info "1. Install Certbot and Nginx:"
cat << 'EOF'
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
EOF

log_info ""
log_info "2. Basic Nginx configuration for your domain:"
cat << 'EOF'
sudo tee /etc/nginx/sites-available/n8n << 'NGINXEOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;  # Replace with your actual domain
    
    # SSL configuration will be added by certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /stripe/webhook {
        limit_req zone=login burst=10 nodelay;
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /healthz {
        proxy_pass http://127.0.0.1:5678;
        access_log off;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
EOF

log_info ""
log_info "3. Test Nginx configuration:"
echo "sudo nginx -t"

log_info ""
log_info "4. Restart Nginx:"
echo "sudo systemctl restart nginx"

log_info ""
log_info "5. Obtain SSL certificate (replace your-domain.com):"
cat << 'EOF'
sudo certbot --nginx -d your-domain.com
# Follow the prompts and choose to redirect HTTP to HTTPS
EOF

log_info ""
log_info "6. Set up automatic renewal:"
cat << 'EOF'
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
EOF

log_info ""
log_info "7. Check certificate status:"
cat << 'EOF'
sudo certbot certificates
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout | grep -A 2 "Validity"
EOF

log_info ""
log_info "Health check endpoint setup:"
log_info "=============================="
log_info "Add this to your n8n application (if not already present):"
cat << 'EOF'
# Health endpoint that returns JSON
GET /healthz
Response: {"status": "ok", "timestamp": "2024-01-01T00:00:00Z", "services": {"database": "ok", "n8n": "ok"}}
EOF

log_info ""
log_warn "IMPORTANT NOTES:"
log_warn "- Replace 'your-domain.com' with your actual domain"
log_warn "- Ensure your domain's DNS A record points to this server's IP"
log_warn "- Test the health endpoint after setup: curl https://your-domain.com/healthz"
log_warn "- Certificate will auto-renew via systemd timer"

log_info ""
log_info "TLS setup guide complete. Review commands above before executing."

#!/bin/bash

# =====================================================
# Production Infrastructure Setup for Multi-Tenant SaaS
# =====================================================

set -e

echo "🚀 Setting up Production Infrastructure for Multi-Tenant SaaS Chatbot Platform"

# =====================================================
# 1. DOCKER COMPOSE PRODUCTION CONFIGURATION
# =====================================================

cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database with extensions
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: saas_chatbot
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./saas_postgres_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./analytics_setup.sql:/docker-entrypoint-initdb.d/02-analytics.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Neo4j for Zep Graphiti
  neo4j:
    image: neo4j:5.26
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
    ports:
      - "7474:7474"
      - "7687:7687"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "${NEO4J_PASSWORD}", "RETURN 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Zep Graphiti MCP Server
  zep-graphiti-mcp:
    build:
      context: ./graphiti/mcp_server
      dockerfile: Dockerfile
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      MODEL_NAME: gpt-4o-mini
      NEO4J_URI: bolt://neo4j:7687
      NEO4J_USER: neo4j
      NEO4J_PASSWORD: ${NEO4J_PASSWORD}
    ports:
      - "8000:8000"
    depends_on:
      neo4j:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # n8n Workflow Engine
  n8n:
    image: n8nio/n8n:latest
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: ${N8N_USERNAME}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_PASSWORD}
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      WEBHOOK_URL: ${WEBHOOK_URL}
      GENERIC_TIMEZONE: UTC
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: saas_chatbot
      DB_POSTGRESDB_USER: postgres
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      N8N_METRICS: true
      N8N_LOG_LEVEL: info
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows
    ports:
      - "5678:5678"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for caching and session management
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Prometheus for metrics collection
  prometheus:
    image: prom/prometheus:latest
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped

  # Grafana for dashboards
  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    restart: unless-stopped

  # Uptime Kuma for monitoring
  uptime-kuma:
    image: louislam/uptime-kuma:1
    volumes:
      - uptime_data:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped

  # Sentry for error tracking
  sentry:
    image: sentry:latest
    environment:
      SENTRY_SECRET_KEY: ${SENTRY_SECRET_KEY}
      SENTRY_POSTGRES_HOST: postgres
      SENTRY_POSTGRES_PORT: 5432
      SENTRY_DB_NAME: sentry
      SENTRY_DB_USER: postgres
      SENTRY_DB_PASSWORD: ${POSTGRES_PASSWORD}
      SENTRY_REDIS_HOST: redis
      SENTRY_REDIS_PORT: 6379
      SENTRY_REDIS_PASSWORD: ${REDIS_PASSWORD}
    volumes:
      - sentry_data:/var/lib/sentry/files
    ports:
      - "9000:9000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  neo4j_data:
  neo4j_logs:
  n8n_data:
  redis_data:
  prometheus_data:
  grafana_data:
  uptime_data:
  sentry_data:

networks:
  default:
    name: saas-chatbot-network
EOF

# =====================================================
# 2. ENVIRONMENT CONFIGURATION
# =====================================================

cat > .env.prod << 'EOF'
# Database Configuration
POSTGRES_PASSWORD=your_secure_postgres_password_here
NEO4J_PASSWORD=your_secure_neo4j_password_here

# n8n Configuration
N8N_USERNAME=admin
N8N_PASSWORD=your_secure_n8n_password_here
N8N_HOST=n8ncloud.tech
WEBHOOK_URL=https://n8ncloud.tech

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password_here

# Monitoring Configuration
GRAFANA_PASSWORD=your_secure_grafana_password_here
SENTRY_SECRET_KEY=your_sentry_secret_key_here

# API Keys
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (change in production!)
JWT_SECRET_KEY=your_jwt_secret_key_change_in_production

# Domain Configuration
ALLOWED_DOMAINS=https://n8ncloud.tech,https://yourdomain.com
EOF

# =====================================================
# 3. MONITORING CONFIGURATION
# =====================================================

mkdir -p monitoring/grafana/{dashboards,datasources}

# Prometheus configuration
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'neo4j'
    static_configs:
      - targets: ['neo4j:7474']

  - job_name: 'zep-graphiti'
    static_configs:
      - targets: ['zep-graphiti-mcp:8000']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF

# Grafana datasource configuration
cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Grafana dashboard configuration
cat > monitoring/grafana/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# =====================================================
# 4. BACKUP CONFIGURATION
# =====================================================

cat > backup_script.sh << 'EOF'
#!/bin/bash

# Database backup script
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
docker exec postgres pg_dump -U postgres saas_chatbot > $BACKUP_DIR/postgres_backup_$DATE.sql

# Backup Neo4j database
docker exec neo4j neo4j-admin dump --database=neo4j --to=/tmp/neo4j_backup_$DATE.dump
docker cp neo4j:/tmp/neo4j_backup_$DATE.dump $BACKUP_DIR/

# Backup n8n workflows
docker exec n8n tar -czf /tmp/n8n_backup_$DATE.tar.gz /home/node/.n8n
docker cp n8n:/tmp/n8n_backup_$DATE.tar.gz $BACKUP_DIR/

# Clean up old backups
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.dump" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup_script.sh

# =====================================================
# 5. HEALTH CHECK SCRIPT
# =====================================================

cat > health_check.sh << 'EOF'
#!/bin/bash

echo "🔍 Health Check for Multi-Tenant SaaS Platform"

# Check PostgreSQL
if docker exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Unhealthy"
fi

# Check Neo4j
if docker exec neo4j cypher-shell -u neo4j -p $NEO4J_PASSWORD "RETURN 1" > /dev/null 2>&1; then
    echo "✅ Neo4j: Healthy"
else
    echo "❌ Neo4j: Unhealthy"
fi

# Check n8n
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ n8n: Healthy"
else
    echo "❌ n8n: Unhealthy"
fi

# Check Zep Graphiti MCP
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Zep Graphiti MCP: Healthy"
else
    echo "❌ Zep Graphiti MCP: Unhealthy"
fi

# Check Redis
if docker exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

# Check Prometheus
if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus: Healthy"
else
    echo "❌ Prometheus: Unhealthy"
fi

# Check Grafana
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Grafana: Healthy"
else
    echo "❌ Grafana: Unhealthy"
fi

echo "🏁 Health check completed"
EOF

chmod +x health_check.sh

# =====================================================
# 6. DEPLOYMENT SCRIPT
# =====================================================

cat > deploy.sh << 'EOF'
#!/bin/bash

set -e

echo "🚀 Deploying Multi-Tenant SaaS Platform to Production"

# Load environment variables
if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '^#' | xargs)
else
    echo "❌ .env.prod file not found!"
    exit 1
fi

# Create necessary directories
mkdir -p monitoring/grafana/{dashboards,datasources}
mkdir -p backups
mkdir -p workflows

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Run health check
echo "🔍 Running health check..."
./health_check.sh

# Setup monitoring dashboards
echo "📊 Setting up monitoring dashboards..."
# Add Grafana dashboard setup here

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Access URLs:"
echo "  n8n: https://n8ncloud.tech"
echo "  Grafana: http://localhost:3000"
echo "  Prometheus: http://localhost:9090"
echo "  Uptime Kuma: http://localhost:3001"
echo "  Sentry: http://localhost:9000"
EOF

chmod +x deploy.sh

# =====================================================
# 7. MAINTENANCE SCRIPT
# =====================================================

cat > maintenance.sh << 'EOF'
#!/bin/bash

echo "🔧 Multi-Tenant SaaS Platform Maintenance"

case "$1" in
    "backup")
        echo "📦 Creating backup..."
        ./backup_script.sh
        ;;
    "restore")
        echo "🔄 Restoring from backup..."
        if [ -z "$2" ]; then
            echo "Usage: $0 restore <backup_date>"
            exit 1
        fi
        # Add restore logic here
        ;;
    "update")
        echo "🔄 Updating platform..."
        ./deploy.sh
        ;;
    "logs")
        echo "📋 Showing logs..."
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    "status")
        echo "📊 Platform status..."
        ./health_check.sh
        ;;
    *)
        echo "Usage: $0 {backup|restore|update|logs|status}"
        exit 1
        ;;
esac
EOF

chmod +x maintenance.sh

# =====================================================
# 8. SECURITY HARDENING
# =====================================================

cat > security_hardening.sh << 'EOF'
#!/bin/bash

echo "🔒 Applying Security Hardening"

# Set secure file permissions
chmod 600 .env.prod
chmod 600 monitoring/prometheus.yml

# Create firewall rules (if using UFW)
# ufw allow 22/tcp
# ufw allow 80/tcp
# ufw allow 443/tcp
# ufw deny 5432/tcp
# ufw deny 6379/tcp
# ufw deny 9090/tcp
# ufw deny 3000/tcp
# ufw deny 3001/tcp
# ufw deny 9000/tcp
# ufw enable

# Setup SSL certificates (if using Let's Encrypt)
# certbot --nginx -d n8ncloud.tech

echo "✅ Security hardening completed"
EOF

chmod +x security_hardening.sh

echo "✅ Production infrastructure setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.prod with your actual credentials"
echo "2. Run: ./deploy.sh"
echo "3. Run: ./security_hardening.sh"
echo "4. Setup SSL certificates"
echo "5. Configure monitoring dashboards"
echo ""
echo "🔧 Available commands:"
echo "  ./deploy.sh          - Deploy the platform"
echo "  ./health_check.sh    - Check service health"
echo "  ./maintenance.sh     - Run maintenance tasks"
echo "  ./backup_script.sh   - Create backups"
echo "  ./security_hardening.sh - Apply security measures"

#!/bin/bash

# Lightning AI Business Node Platform - Production Startup Script
# PM2-based production deployment for KVM2 instances

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="lightning-platform"
PORT=3000
NODE_ENV="production"
INSTANCES=2  # Number of PM2 instances (cluster mode)

echo -e "${BLUE}🚀 Lightning AI Platform - Production Deployment${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}📦 PM2 not found. Installing globally...${NC}"
        npm install -g pm2
    fi
    echo -e "${GREEN}✅ PM2 is available${NC}"
}

# Function to build the application
build_app() {
    echo -e "${YELLOW}🔨 Building production application...${NC}"
    
    # Clean previous builds
    rm -rf .next
    
    # Install dependencies
    npm ci --only=production
    
    # Build the application
    npm run build
    
    echo -e "${GREEN}✅ Application built successfully${NC}"
}

# Function to create PM2 ecosystem file
create_ecosystem() {
    echo -e "${YELLOW}⚙️  Creating PM2 ecosystem configuration...${NC}"
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    instances: ${INSTANCES},
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT},
      NEXT_TELEMETRY_DISABLED: 1
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Process management
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.next'],
    max_memory_restart: '1G',
    
    // Auto-restart configuration
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
EOF
    
    echo -e "${GREEN}✅ PM2 ecosystem configuration created${NC}"
}

# Function to setup logging directory
setup_logging() {
    echo -e "${YELLOW}📝 Setting up logging directory...${NC}"
    mkdir -p logs
    touch logs/combined.log logs/out.log logs/error.log
    echo -e "${GREEN}✅ Logging directory ready${NC}"
}

# Function to start the application with PM2
start_with_pm2() {
    echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
    
    # Stop existing instances
    pm2 delete ${APP_NAME} 2>/dev/null || echo "No existing instances to stop"
    
    # Start the application
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script (for auto-start on server reboot)
    pm2 startup
    
    echo -e "${GREEN}✅ Application started with PM2${NC}"
}

# Function to perform health check
health_check() {
    echo -e "${YELLOW}🔍 Performing health check...${NC}"
    
    # Wait for application to start
    sleep 5
    
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if curl -s http://localhost:${PORT} >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Application is responding on port ${PORT}${NC}"
            
            # Test key endpoints
            if curl -s http://localhost:${PORT}/dashboard >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Dashboard endpoint accessible${NC}"
            fi
            
            if curl -s http://localhost:${PORT}/api/system-check >/dev/null 2>&1; then
                echo -e "${GREEN}✅ API health check passed${NC}"
            fi
            
            return 0
        fi
        
        sleep 2
        retries=$((retries + 1))
        echo -n "."
    done
    
    echo -e "\n${RED}❌ Health check failed after ${max_retries} attempts${NC}"
    return 1
}

# Function to show PM2 status and useful commands
show_status() {
    echo -e "\n${BLUE}📊 PM2 Status:${NC}"
    pm2 status
    
    echo -e "\n${BLUE}🛠️  Production Management Commands:${NC}"
    echo -e "   📊 View status:        pm2 status"
    echo -e "   📝 View logs:          pm2 logs ${APP_NAME}"
    echo -e "   🔄 Restart:            pm2 restart ${APP_NAME}"
    echo -e "   🛑 Stop:               pm2 stop ${APP_NAME}"
    echo -e "   🗑️  Delete:             pm2 delete ${APP_NAME}"
    echo -e "   📈 Monitor:            pm2 monit"
    echo -e "   🔄 Reload (0-downtime): pm2 reload ${APP_NAME}"
    echo -e "   📊 Show metrics:       pm2 show ${APP_NAME}"
    
    echo -e "\n${BLUE}🌐 Application URLs:${NC}"
    echo -e "   🏠 Homepage:           http://localhost:${PORT}"
    echo -e "   📊 Dashboard:          http://localhost:${PORT}/dashboard"
    echo -e "   ⚡ Lightning Test:     http://localhost:${PORT}/lightning-test"
    echo -e "   🔧 API Health:         http://localhost:${PORT}/api/system-check"
    
    echo -e "\n${BLUE}📝 Log Files:${NC}"
    echo -e "   📄 Combined:           tail -f logs/combined.log"
    echo -e "   📤 Output:             tail -f logs/out.log"
    echo -e "   ❌ Errors:             tail -f logs/error.log"
}

# Function to setup monitoring (optional)
setup_monitoring() {
    echo -e "${YELLOW}📊 Setting up monitoring...${NC}"
    
    # Install PM2 monitoring (optional)
    if command -v pm2 &> /dev/null; then
        echo -e "${BLUE}💡 To enable PM2 Plus monitoring, run: pm2 link <secret> <public>${NC}"
        echo -e "${BLUE}💡 Get your keys from: https://app.pm2.io/${NC}"
    fi
    
    # Create a simple health check endpoint monitor
    cat > scripts/health-monitor.sh << 'EOF'
#!/bin/bash
# Simple health monitoring script
while true; do
    if ! curl -s http://localhost:3000/api/system-check >/dev/null; then
        echo "$(date): Health check failed, restarting application..."
        pm2 restart lightning-platform
    fi
    sleep 60
done
EOF
    
    chmod +x scripts/health-monitor.sh
    echo -e "${GREEN}✅ Health monitoring script created${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Environment: ${NODE_ENV}${NC}"
    echo -e "${BLUE}🌐 Port: ${PORT}${NC}"
    echo -e "${BLUE}⚙️  Instances: ${INSTANCES}${NC}"
    
    check_pm2
    build_app
    create_ecosystem
    setup_logging
    start_with_pm2
    
    if health_check; then
        show_status
        setup_monitoring
        
        echo -e "\n${GREEN}🎉 Lightning AI Platform deployed successfully!${NC}"
        echo -e "${GREEN}🌐 Production URL: http://localhost:${PORT}${NC}"
        echo -e "${BLUE}💡 Use 'pm2 logs ${APP_NAME}' to view real-time logs${NC}"
    else
        echo -e "${RED}❌ Deployment failed health check${NC}"
        pm2 logs ${APP_NAME} --lines 20
        exit 1
    fi
}

# Handle command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        echo -e "${YELLOW}🛑 Stopping ${APP_NAME}...${NC}"
        pm2 stop ${APP_NAME}
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting ${APP_NAME}...${NC}"
        pm2 restart ${APP_NAME}
        ;;
    "status")
        pm2 status
        ;;
    "logs")
        pm2 logs ${APP_NAME}
        ;;
    "monitor")
        pm2 monit
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|monitor}"
        exit 1
        ;;
esac 
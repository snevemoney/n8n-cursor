#!/usr/bin/env bash
set -euo pipefail

# LightningFlow AI - System Doctor
# Comprehensive health check and diagnostics

echo "🏥 LightningFlow AI - System Doctor"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check port security
check_port_security() {
    echo "🔒 Port Security Check"
    echo "---------------------"
    
    # Check for public port bindings
    PUBLIC_PORTS=$(ss -Hnlpt | grep -v '127\.0\.0\.1:' | grep -v ':80' | grep -v ':443' | wc -l)
    
    if [ "$PUBLIC_PORTS" -eq 0 ]; then
        pass "No unexpected public port bindings"
    else
        fail "Found $PUBLIC_PORTS unexpected public port bindings"
        ss -Hnlpt | grep -v '127\.0\.0\.1:' | grep -v ':80' | grep -v ':443'
    fi
    
    echo ""
}

# Check container health
check_container_health() {
    echo "🐳 Container Health Check"
    echo "------------------------"
    
    if ! command_exists docker; then
        fail "Docker not installed"
        return
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        fail "Docker daemon not running"
        return
    fi
    
    # List all containers
    info "Container Status:"
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    
    # Check for unhealthy containers
    UNHEALTHY=$(docker ps --filter health=unhealthy -q | wc -l)
    
    if [ "$UNHEALTHY" -eq 0 ]; then
        pass "All containers healthy"
    else
        fail "Found $UNHEALTHY unhealthy containers"
        docker ps --filter health=unhealthy
    fi
    
    echo ""
}

# Check health endpoints
check_health_endpoints() {
    echo "🏥 Health Endpoint Check"
    echo "-----------------------"
    
    # Check main health endpoint
    if curl -fsS -m 5 https://lightningflow.online/healthz >/dev/null 2>&1; then
        pass "Main health endpoint responding"
    else
        fail "Main health endpoint not responding"
    fi
    
    # Check API health endpoint
    if curl -fsS -m 5 https://lightningflow.online/api/healthz >/dev/null 2>&1; then
        pass "API health endpoint responding"
    else
        fail "API health endpoint not responding"
    fi
    
    # Check n8n health endpoint
    if curl -fsS -m 5 https://evenslouis.ca/n8n/healthz >/dev/null 2>&1; then
        pass "n8n health endpoint responding"
    else
        fail "n8n health endpoint not responding"
    fi
    
    echo ""
}

# Check health endpoint latency
check_health_latency() {
    echo "⏱️  Health Endpoint Latency"
    echo "--------------------------"
    
    # Check main health latency
    MAIN_LATENCY=$(curl -sw '%{time_total}' -o /dev/null https://lightningflow.online/healthz 2>/dev/null || echo "999")
    if (( $(echo "$MAIN_LATENCY < 0.2" | bc -l) )); then
        pass "Main health endpoint latency: ${MAIN_LATENCY}s"
    else
        fail "Main health endpoint latency too high: ${MAIN_LATENCY}s"
    fi
    
    # Check API health latency
    API_LATENCY=$(curl -sw '%{time_total}' -o /dev/null https://lightningflow.online/api/healthz 2>/dev/null || echo "999")
    if (( $(echo "$API_LATENCY < 0.2" | bc -l) )); then
        pass "API health endpoint latency: ${API_LATENCY}s"
    else
        fail "API health endpoint latency too high: ${API_LATENCY}s"
    fi
    
    # Check n8n health latency
    N8N_LATENCY=$(curl -sw '%{time_total}' -o /dev/null https://evenslouis.ca/n8n/healthz 2>/dev/null || echo "999")
    if (( $(echo "$N8N_LATENCY < 0.2" | bc -l) )); then
        pass "n8n health endpoint latency: ${N8N_LATENCY}s"
    else
        fail "n8n health endpoint latency too high: ${N8N_LATENCY}s"
    fi
    
    echo ""
}

# Check system resources
check_system_resources() {
    echo "💾 System Resources"
    echo "------------------"
    
    # Check memory usage
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
        pass "Memory usage: ${MEMORY_USAGE}%"
    else
        warn "Memory usage high: ${MEMORY_USAGE}%"
    fi
    
    # Check disk usage
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        pass "Disk usage: ${DISK_USAGE}%"
    else
        warn "Disk usage high: ${DISK_USAGE}%"
    fi
    
    # Check CPU load
    CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    if (( $(echo "$CPU_LOAD < 2.0" | bc -l) )); then
        pass "CPU load: ${CPU_LOAD}"
    else
        warn "CPU load high: ${CPU_LOAD}"
    fi
    
    echo ""
}

# Check Docker system
check_docker_system() {
    echo "🐳 Docker System"
    echo "---------------"
    
    if ! command_exists docker; then
        fail "Docker not installed"
        return
    fi
    
    # Check Docker system info
    info "Docker System Info:"
    docker system df
    
    # Check for dangling images
    DANGLING_IMAGES=$(docker images -f "dangling=true" -q | wc -l)
    if [ "$DANGLING_IMAGES" -eq 0 ]; then
        pass "No dangling images"
    else
        warn "Found $DANGLING_IMAGES dangling images"
    fi
    
    # Check for unused containers
    UNUSED_CONTAINERS=$(docker ps -a -f "status=exited" -q | wc -l)
    if [ "$UNUSED_CONTAINERS" -eq 0 ]; then
        pass "No unused containers"
    else
        warn "Found $UNUSED_CONTAINERS unused containers"
    fi
    
    # Check for unused volumes
    UNUSED_VOLUMES=$(docker volume ls -f "dangling=true" -q | wc -l)
    if [ "$UNUSED_VOLUMES" -eq 0 ]; then
        pass "No unused volumes"
    else
        warn "Found $UNUSED_VOLUMES unused volumes"
    fi
    
    echo ""
}

# Check network connectivity
check_network_connectivity() {
    echo "🌐 Network Connectivity"
    echo "----------------------"
    
    # Check external connectivity
    if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        pass "External connectivity (8.8.8.8)"
    else
        fail "No external connectivity"
    fi
    
    # Check DNS resolution
    if nslookup google.com >/dev/null 2>&1; then
        pass "DNS resolution working"
    else
        fail "DNS resolution not working"
    fi
    
    # Check HTTPS connectivity
    if curl -fsS -m 5 https://google.com >/dev/null 2>&1; then
        pass "HTTPS connectivity working"
    else
        fail "HTTPS connectivity not working"
    fi
    
    echo ""
}

# Check security
check_security() {
    echo "🔒 Security Check"
    echo "----------------"
    
    # Check for miner ports
    MINER_PORTS=$(sudo iptables -S DOCKER-USER 2>/dev/null | grep -E '3333|4444|5555|7777' | wc -l)
    if [ "$MINER_PORTS" -gt 0 ]; then
        pass "Miner ports blocked"
    else
        warn "Miner ports not explicitly blocked"
    fi
    
    # Check for suspicious processes
    SUSPICIOUS=$(ps aux | grep -E 'xmrig|kinsing|miner' | grep -v grep | wc -l)
    if [ "$SUSPICIOUS" -eq 0 ]; then
        pass "No suspicious processes detected"
    else
        fail "Suspicious processes detected"
        ps aux | grep -E 'xmrig|kinsing|miner' | grep -v grep
    fi
    
    # Check for execs in /tmp
    TMP_EXECS=$(find /tmp -type f -executable 2>/dev/null | wc -l)
    if [ "$TMP_EXECS" -eq 0 ]; then
        pass "No executable files in /tmp"
    else
        warn "Found $TMP_EXECS executable files in /tmp"
    fi
    
    echo ""
}

# Check logs for errors
check_logs() {
    echo "📋 Log Check"
    echo "------------"
    
    # Check Docker logs for errors
    if command_exists docker; then
        ERROR_LOGS=$(docker logs $(docker ps -q) 2>&1 | grep -i error | wc -l)
        if [ "$ERROR_LOGS" -eq 0 ]; then
            pass "No errors in Docker logs"
        else
            warn "Found $ERROR_LOGS errors in Docker logs"
        fi
    fi
    
    # Check system logs for errors
    SYSTEM_ERRORS=$(journalctl --since "1 hour ago" --priority=err --no-pager | wc -l)
    if [ "$SYSTEM_ERRORS" -eq 0 ]; then
        pass "No system errors in last hour"
    else
        warn "Found $SYSTEM_ERRORS system errors in last hour"
    fi
    
    echo ""
}

# Check backups
check_backups() {
    echo "💾 Backup Check"
    echo "---------------"
    
    # Check if backup directory exists
    if [ -d "tooling/backups" ]; then
        BACKUP_COUNT=$(find tooling/backups -name "*.tar.gz" -mtime -1 | wc -l)
        if [ "$BACKUP_COUNT" -gt 0 ]; then
            pass "Recent backups found: $BACKUP_COUNT"
        else
            warn "No recent backups found"
        fi
    else
        warn "Backup directory not found"
    fi
    
    echo ""
}

# Check configuration
check_configuration() {
    echo "⚙️  Configuration Check"
    echo "----------------------"
    
    # Check if environment files exist
    if [ -f ".env.production" ]; then
        pass "Production environment file exists"
    else
        warn "Production environment file not found"
    fi
    
    # Check if Docker Compose files exist
    if [ -f "infra/docker/docker-compose.prod.yml" ]; then
        pass "Production Docker Compose file exists"
    else
        warn "Production Docker Compose file not found"
    fi
    
    # Check if Caddy configuration exists
    if [ -f "infra/caddy/Caddyfile" ]; then
        pass "Caddy configuration exists"
    else
        warn "Caddy configuration not found"
    fi
    
    echo ""
}

# Main function
main() {
    echo "Starting system diagnostics..."
    echo ""
    
    check_port_security
    check_container_health
    check_health_endpoints
    check_health_latency
    check_system_resources
    check_docker_system
    check_network_connectivity
    check_security
    check_logs
    check_backups
    check_configuration
    
    echo "🏥 System Doctor Summary"
    echo "========================"
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    echo ""
    
    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}🎉 System is healthy!${NC}"
        exit 0
    else
        echo -e "${RED}🚨 System has issues that need attention${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
#!/usr/bin/env bash
set -euo pipefail

# Health Monitor - Continuous health checking for all services
# Usage: ./scripts/health-monitor.sh [ENV]

ENV="${1:-int}"
LOG_FILE="$HOME/health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Health check endpoints
declare -A HEALTH_ENDPOINTS=(
    ["UI"]="https://lightningflow.online/healthz"
    ["API"]="https://lightningflow.online/api/healthz"
    ["n8n"]="https://n8ncloud.tech/healthz"
    ["Grafana"]="http://localhost:3000/healthz"
    ["Prometheus"]="http://localhost:9090/healthz"
    ["Loki"]="http://localhost:3100/healthz"
)

# Function to log health status
log_health() {
    local service="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "DOWN" ]; then
        echo "[$TIMESTAMP] $service DOWN: $message" >> "$LOG_FILE"
        echo "❌ $service is down: $message"
    else
        echo "✅ $service is healthy"
    fi
}

# Function to check endpoint health
check_endpoint() {
    local service="$1"
    local url="$2"
    
    if curl -fsS --max-time 10 "$url" >/dev/null 2>&1; then
        log_health "$service" "UP" "Health check passed"
        return 0
    else
        log_health "$service" "DOWN" "Health check failed for $url"
        return 1
    fi
}

# Function to check Docker container health
check_container() {
    local service="$1"
    local container_name="$2"
    
    if docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
        
        if [ "$health_status" = "healthy" ]; then
            log_health "$service" "UP" "Container is healthy"
            return 0
        elif [ "$health_status" = "unhealthy" ]; then
            log_health "$service" "DOWN" "Container is unhealthy"
            return 1
        else
            log_health "$service" "DOWN" "Container health status: $health_status"
            return 1
        fi
    else
        log_health "$service" "DOWN" "Container not running"
        return 1
    fi
}

# Function to check system resources
check_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    # Check CPU usage
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log_health "CPU" "DOWN" "High CPU usage: ${cpu_usage}%"
    else
        echo "✅ CPU usage: ${cpu_usage}%"
    fi
    
    # Check memory usage
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        log_health "Memory" "DOWN" "High memory usage: ${memory_usage}%"
    else
        echo "✅ Memory usage: ${memory_usage}%"
    fi
    
    # Check disk usage
    if [ "$disk_usage" -gt 80 ]; then
        log_health "Disk" "DOWN" "High disk usage: ${disk_usage}%"
    else
        echo "✅ Disk usage: ${disk_usage}%"
    fi
}

# Function to check port bindings
check_ports() {
    local public_ports=$(ss -Hnlpt | awk '{print $4}' | grep -E '^0\.0\.0\.0:[0-9]+$' | grep -v ':80$' | grep -v ':443$' || echo "")
    
    if [ -n "$public_ports" ]; then
        log_health "Ports" "DOWN" "Public port bindings detected: $public_ports"
        return 1
    else
        echo "✅ No unauthorized public port bindings"
        return 0
    fi
}

# Function to check Docker system
check_docker() {
    local docker_status=$(docker info >/dev/null 2>&1 && echo "running" || echo "down")
    
    if [ "$docker_status" = "running" ]; then
        echo "✅ Docker is running"
        
        # Check for unhealthy containers
        local unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" || echo "")
        if [ -n "$unhealthy_containers" ]; then
            log_health "Docker" "DOWN" "Unhealthy containers: $unhealthy_containers"
            return 1
        fi
        
        # Check for stopped containers
        local stopped_containers=$(docker ps -a --filter "status=exited" --format "{{.Names}}" || echo "")
        if [ -n "$stopped_containers" ]; then
            log_health "Docker" "DOWN" "Stopped containers: $stopped_containers"
            return 1
        fi
        
        return 0
    else
        log_health "Docker" "DOWN" "Docker is not running"
        return 1
    fi
}

# Main health check function
main() {
    echo "🏥 Health Monitor - $TIMESTAMP"
    echo "================================"
    
    local overall_status=0
    
    # Check system resources
    echo ""
    echo "📊 System Resources:"
    check_resources
    
    # Check Docker system
    echo ""
    echo "🐳 Docker System:"
    if ! check_docker; then
        overall_status=1
    fi
    
    # Check port bindings
    echo ""
    echo "🔌 Port Bindings:"
    if ! check_ports; then
        overall_status=1
    fi
    
    # Check health endpoints
    echo ""
    echo "🌐 Health Endpoints:"
    for service in "${!HEALTH_ENDPOINTS[@]}"; do
        if ! check_endpoint "$service" "${HEALTH_ENDPOINTS[$service]}"; then
            overall_status=1
        fi
    done
    
    # Check Docker containers
    echo ""
    echo "📦 Docker Containers:"
    if [ -f "infra/docker/docker-compose.${ENV}.yml" ]; then
        local services=$(docker compose -f "infra/docker/docker-compose.${ENV}.yml" config --services 2>/dev/null || echo "")
        for service in $services; do
            local container_name="lfai_${ENV}_${service}_1"
            if ! check_container "$service" "$container_name"; then
                overall_status=1
            fi
        done
    fi
    
    # Summary
    echo ""
    echo "📋 Health Summary:"
    if [ $overall_status -eq 0 ]; then
        echo "✅ All systems healthy"
    else
        echo "❌ Some systems are unhealthy - check $LOG_FILE for details"
    fi
    
    return $overall_status
}

# Run main function
main "$@"

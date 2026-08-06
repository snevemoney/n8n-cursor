#!/usr/bin/env bash
set -euo pipefail

# LightningFlow AI - Blue-Green Deployment Script
# Safe deployment with instant rollback capability

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-prod}"
ACTION="${2:-deploy}"
SERVICE="${3:-all}"

# Service configurations
declare -A SERVICES
SERVICES[api]="lightningflow-api"
SERVICES[web]="lightningflow-web"
SERVICES[n8n]="lightningflow-n8n"
SERVICES[worker]="lightningflow-worker"

# Environment configurations
declare -A ENV_CONFIGS
ENV_CONFIGS[int]="infra/docker/docker-compose.int.yml"
ENV_CONFIGS[staging]="infra/docker/docker-compose.staging.yml"
ENV_CONFIGS[prod]="infra/docker/docker-compose.prod.yml"

# Helper functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if environment is valid
validate_environment() {
    if [[ ! "${ENV_CONFIGS[$ENVIRONMENT]+_}" ]]; then
        error "Invalid environment: $ENVIRONMENT"
        echo "Valid environments: ${!ENV_CONFIGS[*]}"
        exit 1
    fi
}

# Check if service is valid
validate_service() {
    if [ "$SERVICE" != "all" ] && [[ ! "${SERVICES[$SERVICE]+_}" ]]; then
        error "Invalid service: $SERVICE"
        echo "Valid services: all ${!SERVICES[*]}"
        exit 1
    fi
}

# Get current active environment
get_current_environment() {
    local env_file="${ENV_CONFIGS[$ENVIRONMENT]}"
    if [ -f "$env_file" ]; then
        # Check which environment is currently active
        if docker ps --format '{{.Names}}' | grep -q "blue"; then
            echo "blue"
        elif docker ps --format '{{.Names}}' | grep -q "green"; then
            echo "green"
        else
            echo "unknown"
        fi
    else
        echo "none"
    fi
}

# Get next environment
get_next_environment() {
    local current=$(get_current_environment)
    if [ "$current" = "blue" ]; then
        echo "green"
    elif [ "$current" = "green" ]; then
        echo "blue"
    else
        echo "blue"  # Default to blue if no current environment
    fi
}

# Check health of environment
check_health() {
    local env=$1
    local max_attempts=30
    local attempt=1
    
    log "Checking health of $env environment..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -fsS -m 5 "https://evenslouis.ca/lightningflow/healthz" >/dev/null 2>&1; then
            success "$env environment is healthy"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    error "$env environment health check failed after $max_attempts attempts"
    return 1
}

# Deploy to environment
deploy_to_environment() {
    local env=$1
    local env_file="${ENV_CONFIGS[$ENVIRONMENT]}"
    
    log "Deploying to $env environment..."
    
    # Create environment-specific compose file
    local compose_file="infra/docker/docker-compose.${env}.yml"
    cp "$env_file" "$compose_file"
    
    # Update service names to include environment
    sed -i "s/name: lfai_/name: lfai_${env}_/g" "$compose_file"
    sed -i "s/container_name: /container_name: ${env}-/g" "$compose_file"
    
    # Deploy
    docker compose -f "$compose_file" up -d
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 10
    
    # Check health
    if check_health "$env"; then
        success "Deployment to $env environment successful"
        return 0
    else
        error "Deployment to $env environment failed"
        return 1
    fi
}

# Switch traffic to environment
switch_traffic() {
    local env=$1
    
    log "Switching traffic to $env environment..."
    
    # Update Caddy configuration
    local caddy_file="infra/caddy/Caddyfile"
    if [ -f "$caddy_file" ]; then
        # Update upstream to point to new environment
        sed -i "s/127.0.0.1:[0-9]*/127.0.0.1:${env}_port/g" "$caddy_file"
        
        # Reload Caddy
        docker exec caddy caddy reload --config /etc/caddy/Caddyfile
    fi
    
    # Wait for traffic to switch
    sleep 5
    
    # Verify traffic is switched
    if check_health "$env"; then
        success "Traffic switched to $env environment"
        return 0
    else
        error "Traffic switch to $env environment failed"
        return 1
    fi
}

# Rollback to previous environment
rollback() {
    local current=$(get_current_environment)
    local previous
    
    if [ "$current" = "blue" ]; then
        previous="green"
    elif [ "$current" = "green" ]; then
        previous="blue"
    else
        error "No current environment found for rollback"
        return 1
    fi
    
    log "Rolling back to $previous environment..."
    
    # Switch traffic back
    if switch_traffic "$previous"; then
        success "Rollback to $previous environment successful"
        return 0
    else
        error "Rollback to $previous environment failed"
        return 1
    fi
}

# Deploy new version
deploy() {
    local next_env=$(get_next_environment)
    local current_env=$(get_current_environment)
    
    log "Starting blue-green deployment..."
    log "Current environment: $current_env"
    log "Deploying to: $next_env"
    
    # Deploy to next environment
    if deploy_to_environment "$next_env"; then
        # Switch traffic
        if switch_traffic "$next_env"; then
            success "Blue-green deployment successful"
            log "New environment: $next_env"
            log "Previous environment: $current_env (kept as backup)"
            return 0
        else
            error "Traffic switch failed, rolling back..."
            rollback
            return 1
        fi
    else
        error "Deployment failed"
        return 1
    fi
}

# Show deployment status
status() {
    local current=$(get_current_environment)
    local next=$(get_next_environment)
    
    echo "Blue-Green Deployment Status"
    echo "============================"
    echo "Environment: $ENVIRONMENT"
    echo "Current active: $current"
    echo "Next deployment: $next"
    echo ""
    
    # Show running containers
    echo "Running Containers:"
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    echo ""
    
    # Show health status
    echo "Health Status:"
    if check_health "$current"; then
        success "Current environment is healthy"
    else
        error "Current environment is unhealthy"
    fi
}

# Cleanup old environments
cleanup() {
    local current=$(get_current_environment)
    local to_cleanup
    
    if [ "$current" = "blue" ]; then
        to_cleanup="green"
    elif [ "$current" = "green" ]; then
        to_cleanup="blue"
    else
        warning "No cleanup needed"
        return 0
    fi
    
    log "Cleaning up $to_cleanup environment..."
    
    # Stop and remove old environment
    local compose_file="infra/docker/docker-compose.${to_cleanup}.yml"
    if [ -f "$compose_file" ]; then
        docker compose -f "$compose_file" down -v
        rm -f "$compose_file"
        success "Cleaned up $to_cleanup environment"
    else
        warning "No $to_cleanup environment to clean up"
    fi
}

# Main function
main() {
    log "LightningFlow AI Blue-Green Deployment"
    log "Environment: $ENVIRONMENT"
    log "Action: $ACTION"
    log "Service: $SERVICE"
    echo ""
    
    # Validate inputs
    validate_environment
    validate_service
    
    # Execute action
    case "$ACTION" in
        "deploy")
            deploy
            ;;
        "rollback")
            rollback
            ;;
        "status")
            status
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            error "Invalid action: $ACTION"
            echo "Valid actions: deploy, rollback, status, cleanup"
            exit 1
            ;;
    esac
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <environment> <action> [service]"
    echo ""
    echo "Environments: int, staging, prod"
    echo "Actions: deploy, rollback, status, cleanup"
    echo "Services: all, api, web, n8n, worker"
    echo ""
    echo "Examples:"
    echo "  $0 prod deploy          # Deploy to production"
    echo "  $0 staging rollback     # Rollback staging environment"
    echo "  $0 int status           # Show integration environment status"
    echo "  $0 prod cleanup         # Cleanup old production environment"
    exit 1
fi

# Run main function
main "$@"
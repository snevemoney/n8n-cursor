#!/bin/bash
set -Eeuo pipefail

# Common utilities for n8n-cursor scripts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

# Utility functions
require_cmd() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command not found: $1"
        exit 1
    fi
}

require_file() {
    if [[ ! -f "$1" ]]; then
        log_error "Required file not found: $1"
        exit 1
    fi
}

require_dir() {
    if [[ ! -d "$1" ]]; then
        log_error "Required directory not found: $1"
        exit 1
    fi
}

# Safe execution with dry run support
run() {
    if [[ "${DRY_RUN:-1}" == "1" ]]; then
        log_info "[DRY-RUN] $*"
    else
        log_info "Executing: $*"
        eval "$@"
    fi
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Create directory if it doesn't exist
ensure_dir() {
    if [[ ! -d "$1" ]]; then
        log_info "Creating directory: $1"
        mkdir -p "$1"
    fi
}

# Backup file with timestamp
backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "Backing up $file to $backup"
        cp "$file" "$backup"
        echo "$backup"
    fi
}

# Check if port is available
port_available() {
    local port="$1"
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        return 1
    else
        return 0
    fi
}

# Wait for service to be ready
wait_for_service() {
    local host="$1"
    local port="$2"
    local timeout="${3:-30}"
    
    log_info "Waiting for $host:$port to be ready (timeout: ${timeout}s)..."
    
    local count=0
    while [[ $count -lt $timeout ]]; do
        if timeout 1 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
            log_success "Service $host:$port is ready"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    log_error "Service $host:$port not ready after ${timeout}s"
    return 1
}

# Generate random string
random_string() {
    local length="${1:-8}"
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w "$length" | head -n 1
}

# Check if variable is set
check_var() {
    local var_name="$1"
    if [[ -z "${!var_name:-}" ]]; then
        log_error "Required environment variable not set: $var_name"
        exit 1
    fi
}

# Export variables from .env file
load_env() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        log_info "Loading environment from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        log_warn "Environment file not found: $env_file"
    fi
}

# Cleanup function for traps
cleanup() {
    log_info "Cleaning up..."
    # Add cleanup logic here
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

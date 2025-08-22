#!/bin/bash

# n8n Repository Management - Core Utility Library
# Provides common functions for all scripts

set -Eeuo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $*" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

log_err() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $*" >&2
    fi
}

# Error handling
die() {
    log_err "$*"
    exit 1
}

# Confirmation prompt
confirm() {
    local message="${1:-Are you sure?}"
    local default="${2:-n}"
    
    if [[ "${NONINTERACTIVE:-false}" == "true" ]]; then
        return 0
    fi
    
    local response
    if [[ "$default" == "y" ]]; then
        read -p "$message [Y/n] " response
        response="${response:-y}"
    else
        read -p "$message [y/N] " response
        response="${response:-n}"
    fi
    
    [[ "$response" =~ ^[Yy]$ ]]
}

# Command requirement check
require_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        die "Required command '$cmd' not found"
    fi
}

# Parse subcommand
parse_subcommand() {
    local subcommand="${1:-}"
    local valid_subcommands=("${@:2}")
    
    if [[ -z "$subcommand" ]]; then
        log_err "No subcommand specified"
        return 1
    fi
    
    for valid in "${valid_subcommands[@]}"; do
        if [[ "$subcommand" == "$valid" ]]; then
            return 0
        fi
    done
    
    log_err "Invalid subcommand: $subcommand"
    log_err "Valid subcommands: ${valid_subcommands[*]}"
    return 1
}

# Dry run support
is_dry_run() {
    [[ "${DRY_RUN:-false}" == "true" ]]
}

# Safe file operations
safe_cp() {
    if is_dry_run; then
        log_info "[DRY RUN] Would copy: $*"
        return 0
    fi
    cp "$@"
}

safe_mv() {
    if is_dry_run; then
        log_info "[DRY RUN] Would move: $*"
        return 0
    fi
    mv "$@"
}

safe_rm() {
    if is_dry_run; then
        log_info "[DRY RUN] Would remove: $*"
        return 0
    fi
    rm "$@"
}

# Spinner for long operations
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    
    while kill -0 "$pid" 2>/dev/null; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Help text generator
show_help() {
    local script_name="$1"
    local description="$2"
    local usage="$3"
    local examples="$4"
    
    cat << EOF
$script_name - $description

Usage: $script_name $usage

Examples:
$examples

Options:
  -h, --help     Show this help message
  --dry-run      Show what would be done without making changes
  --debug        Enable debug output

Environment Variables:
  DRY_RUN        Set to 'true' to enable dry run mode
  DEBUG          Set to 'true' to enable debug output
  NONINTERACTIVE Set to 'true' to skip confirmation prompts
EOF
}

# Version check
check_version() {
    local required_version="$1"
    local current_version="$2"
    
    if [[ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]]; then
        die "Version $current_version is older than required $required_version"
    fi
}

# Trap for cleanup
setup_traps() {
    trap 'cleanup' EXIT
    trap 'log_err "Interrupted by user"; exit 1' INT TERM
}

cleanup() {
    log_debug "Cleaning up..."
    # Add cleanup logic here
}

# Initialize library
setup_traps

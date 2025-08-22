#!/bin/bash
set -Eeuo pipefail

# n8n-cursor DevOps Helper Menu
# Run this script to get quick access to common operations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }

# Check if we're in the right directory
if [[ ! -f "$PROJECT_ROOT/Makefile" ]]; then
  log_error "This script must be run from the n8n-cursor project root"
  exit 1
fi

# Main menu function
show_menu() {
  clear
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║                    n8n-cursor DevOps Helper                 ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Quick Operations:${NC}"
  echo "  1) Check system health"
  echo "  2) Start n8n services"
  echo "  3) Stop n8n services"
  echo "  4) View service status"
  echo "  5) View logs"
  echo ""
  echo -e "${YELLOW}Development:${NC}"
  echo "  6) Create new script"
  echo "  7) Create new workflow"
  echo "  8) Validate workflows"
  echo "  9) Check for duplicates"
  echo ""
  echo -e "${YELLOW}Maintenance:${NC}"
  echo "  10) Backup system"
  echo "  11) Restart services"
  echo "  12) Fix remote connection"
  echo "  13) Run all checks (CI)"
  echo ""
  echo -e "${YELLOW}Information:${NC}"
  echo "  14) Show available make targets"
  echo "  15) Show environment variables needed"
  echo "  16) Open Master Stack Cheat Sheet"
  echo ""
  echo -e "${YELLOW}CI/CD Troubleshooting:${NC}"
  echo "  17) Fix CI linting issues"
  echo "  18) Fix structure guard issues"
  echo "  19) Fix workflow validation issues"
  echo ""
  echo -e "${YELLOW}Exit:${NC}"
  echo "  0) Exit"
  echo ""
}

# Health check function
check_health() {
  log_info "Running comprehensive health check..."
  echo ""

  log_info "1. Structure Guard Check"
  make guard
  echo ""

  log_info "2. System Health Check"
  make doctor
  echo ""

  log_info "3. Workflow Validation"
  make wf-validate
  echo ""

  log_success "Health check completed!"
}

# Start services function
start_services() {
  log_info "Starting n8n services..."
  echo ""
  echo "Choose mode:"
  echo "1) Dry run (safe, shows what would happen)"
  echo "2) Real start (actually starts services)"
  echo ""
  read -p "Enter choice (1 or 2): " choice

  case $choice in
  1)
    log_info "Running in dry-run mode..."
    make up
    ;;
  2)
    log_warn "Starting services for real..."
    DRY_RUN=0 make up
    ;;
  *)
    log_error "Invalid choice"
    return 1
    ;;
  esac
}

# Stop services function
stop_services() {
  log_warn "Stopping n8n services..."
  echo ""
  echo "Choose mode:"
  echo "1) Dry run (safe, shows what would happen)"
  echo "2) Real stop (actually stops services)"
  echo ""
  read -p "Enter choice (1 or 2): " choice

  case $choice in
  1)
    log_info "Running in dry-run mode..."
    make down
    ;;
  2)
    log_warn "Stopping services for real..."
    DRY_RUN=0 make down
    ;;
  *)
    log_error "Invalid choice"
    return 1
    ;;
  esac
}

# Create new script function
create_script() {
  log_info "Creating new script..."
  echo ""
  read -p "Enter script name: " script_name
  read -p "Enter script description: " script_desc

  if [[ -n "$script_name" && -n "$script_desc" ]]; then
    make new-script NAME="$script_name" DESC="$script_desc"
  else
    log_error "Script name and description are required"
  fi
}

# Create new workflow function
create_workflow() {
  log_info "Creating new workflow..."
  echo ""
  read -p "Enter workflow name: " workflow_name

  if [[ -n "$workflow_name" ]]; then
    make new-workflow NAME="$workflow_name"
  else
    log_error "Workflow name is required"
  fi
}

# Show make targets function
show_make_targets() {
  log_info "Available make targets:"
  echo ""
  make help
}

# Show environment variables function
show_env_vars() {
  log_info "Required environment variables:"
  echo ""
  echo "Copy .env.example to .env and set these values:"
  echo ""
  echo "export MASTER_UNLOCK=your_master_key_here"
  echo "export OPENAI_API_KEY=your_openai_key_here"
  echo "export SUPABASE_URL=your_supabase_url_here"
  echo "export SUPABASE_ANON_KEY=your_supabase_key_here"
  echo ""
  echo "Or run: cp .env.example .env"
  echo "Then edit .env with your actual values"
}

# Open cheat sheet function
open_cheat_sheet() {
  if [[ -f "$PROJECT_ROOT/MASTER_STACK_CHEAT_SHEET.md" ]]; then
    if command -v code &>/dev/null; then
      code "$PROJECT_ROOT/MASTER_STACK_CHEAT_SHEET.md"
    elif command -v nano &>/dev/null; then
      nano "$PROJECT_ROOT/MASTER_STACK_CHEAT_SHEET.md"
    else
      cat "$PROJECT_ROOT/MASTER_STACK_CHEAT_SHEET.md"
    fi
  else
    log_error "Master Stack Cheat Sheet not found"
  fi
}

# Main loop
while true; do
  show_menu
  read -p "Enter your choice (0-16): " choice

  case $choice in
  0)
    log_info "Exiting..."
    exit 0
    ;;
  1)
    check_health
    ;;
  2)
    start_services
    ;;
  3)
    stop_services
    ;;
  4)
    log_info "Checking service status..."
    make status
    ;;
  5)
    log_info "Showing logs..."
    make logs
    ;;
  6)
    create_script
    ;;
  7)
    create_workflow
    ;;
  8)
    log_info "Validating workflows..."
    make wf-validate
    ;;
  9)
    log_info "Checking for duplicates..."
    make wf-dedupe
    ;;
  10)
    log_info "Creating backup..."
    DRY_RUN=0 make backup
    ;;
  11)
    log_info "Restarting services..."
    DRY_RUN=0 make restart
    ;;
  12)
    log_info "Fixing remote connection..."
    make repair-remote
    ;;
  13)
    log_info "Running all checks..."
    make ci
    ;;
  14)
    show_make_targets
    ;;
  15)
    show_env_vars
    ;;
  16)
    open_cheat_sheet
    ;;
  17)
    log_info "Fixing CI linting issues..."
    echo ""
    echo "Running linter to see errors..."
    make lint
    echo ""
    echo "Auto-fixing formatting issues..."
    make fmt
    echo ""
    echo "Re-running all checks..."
    make ci
    echo ""
    log_success "CI issues fixed! Now commit and push:"
    echo "git add . && git commit -m 'fix: resolve linting issues' && git push"
    ;;
  18)
    log_info "Fixing structure guard issues..."
    echo ""
    echo "Checking what's wrong..."
    make guard
    echo ""
    log_info "Follow the error messages above to fix issues"
    ;;
  19)
    log_info "Fixing workflow validation issues..."
    echo ""
    echo "Validating workflows..."
    make wf-validate
    echo ""
    log_info "Fix any JSON syntax errors shown above"
    ;;
  *)
    log_error "Invalid choice. Please enter a number between 0 and 19."
    ;;
  esac

  echo ""
  read -p "Press Enter to continue..."
done

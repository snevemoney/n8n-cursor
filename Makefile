# n8n Repository Management Makefile
# Provides convenient targets for common operations

.PHONY: help up down restart status logs backup restore wf-import wf-validate wf-dedupe lint fmt ci clean

# Default target
help: ## Show this help message
	@echo "n8n Repository Management"
	@echo "========================"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# n8n service management
up: ## Start n8n service
	@echo "🚀 Starting n8n service..."
	@scripts/ops/n8n.sh up

down: ## Stop n8n service
	@echo "🛑 Stopping n8n service..."
	@scripts/ops/n8n.sh down

restart: ## Restart n8n service
	@echo "🔄 Restarting n8n service..."
	@scripts/ops/n8n.sh restart

status: ## Show n8n service status
	@echo "🔍 Checking n8n status..."
	@scripts/ops/n8n.sh status

logs: ## Show n8n logs (default: 20 lines)
	@echo "📋 Showing n8n logs..."
	@scripts/ops/n8n.sh logs

# Backup and restore
backup: ## Create n8n backup
	@echo "💾 Creating n8n backup..."
	@scripts/ops/n8n.sh backup

restore: ## Restore n8n from backup (usage: make restore BACKUP_PATH=/path/to/backup)
	@echo "🔄 Restoring n8n from backup..."
	@scripts/ops/n8n.sh restore $(BACKUP_PATH)

list-backups: ## List available backups
	@echo "📁 Listing available backups..."
	@scripts/ops/n8n.sh list-backups

# Workflow management
wf-import: ## Import workflows
	@echo "📥 Importing workflows..."
	@scripts/workflows/manage.sh import

wf-validate: ## Validate workflows
	@echo "✅ Validating workflows..."
	@scripts/workflows/manage.sh validate

wf-dedupe: ## Remove duplicate workflows
	@echo "🗑️ Removing duplicate workflows..."
	@scripts/workflows/manage.sh dedupe

# Code quality
lint: ## Run linting checks
	@echo "🔍 Running linting checks..."
	@scripts/bin/lint.sh

fmt: ## Format code
	@echo "✨ Formatting code..."
	@scripts/bin/fmt.sh

ci: ## Run CI checks
	@echo "🚀 Running CI checks..."
	@make lint
	@make fmt
	@echo "✅ CI checks completed"

# Development
dev-setup: ## Setup development environment
	@echo "🛠️ Setting up development environment..."
	@scripts/bin/dev-setup.sh

# Safety and protection
systems: ## Launch all protection systems
	@echo "🚀 Launching all protection systems..."
	@cd systems && ./master-launcher.sh

validate: ## Run final system validation
	@echo "🧪 Running final system validation..."
	@cd systems && ./final-system-validation.sh

# Cleanup
clean: ## Clean temporary files
	@echo "🧹 Cleaning temporary files..."
	@find . -name "*.tmp" -delete
	@find . -name "*.log" -delete
	@find . -name "*.pid" -delete

# Docker operations
docker-up: ## Start Docker services
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d

docker-down: ## Stop Docker services
	@echo "🐳 Stopping Docker services..."
	@docker-compose down

docker-logs: ## Show Docker logs
	@echo "🐳 Showing Docker logs..."
	@docker-compose logs -f

# Quick status check
quick-status: ## Quick status check
	@echo "🔍 Quick status check..."
	@echo "n8n Service: $$(systemctl is-active n8n-original 2>/dev/null || echo 'inactive')"
	@echo "Port 5678: $$(netstat -tlnp 2>/dev/null | grep ':5678 ' | wc -l) listeners"
	@echo "Docker: $$(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep n8n | wc -l) containers"

# Development helpers
dev: ## Development mode (start services and show logs)
	@echo "🛠️ Starting development mode..."
	@make up
	@make status
	@echo "📋 Press Ctrl+C to stop watching logs..."
	@make logs

# Emergency operations
emergency-stop: ## Emergency stop all services
	@echo "🚨 Emergency stopping all services..."
	@systemctl stop n8n-original 2>/dev/null || true
	@docker-compose down 2>/dev/null || true
	@echo "✅ All services stopped"

emergency-start: ## Emergency start all services
	@echo "🚨 Emergency starting all services..."
	@make up
	@make docker-up
	@make status

# System health
health: ## System health check
	@echo "🏥 Running system health check..."
	@scripts/safety/guard.sh verify

# Documentation
docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	@scripts/bin/generate-docs.sh

# Backup current state
snapshot: ## Create system snapshot
	@echo "📸 Creating system snapshot..."
	@scripts/safety/guard.sh snapshot

# Show current configuration
config: ## Show current configuration
	@echo "⚙️ Current configuration:"
	@echo "n8n Service: n8n-original"
	@echo "Port: 5678"
	@echo "URL: https://n8ncloud.tech"
	@echo "Backup Dir: /home/evens/n8n-cursor/backups"
	@echo "Log Dir: /home/evens/n8n-cursor/logs"

# Default target
.DEFAULT_GOAL := help

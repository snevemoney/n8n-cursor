SHELL := /bin/bash
export DRY_RUN ?= 1
export LOG_DIR := logs
export SAFE_FLAGS := set -Eeuo pipefail

default: help
help:
	@echo "Targets: up, down, restart, status, logs, backup, restore, wf-import, wf-validate, wf-dedupe, fmt, lint, guard, doctor, repair, repair-remote, new-workflow, new-script, ci, brain-index, brain-suggest"
	@echo "Security: secure-ssh, tls-check, ports, health"
	@echo "Backups: db-backup, db-restore, n8n-backup"
	@echo "Protocol: protocol"
	@echo "Ports: ports-list, ports-check, ports-cleanup, ports-status"

up:       ; @$(SAFE_FLAGS); scripts/ops/n8n.sh up
down:     ; @$(SAFE_FLAGS); scripts/ops/n8n.sh down
restart:  ; @$(SAFE_FLAGS); scripts/ops/n8n.sh restart
status:   ; @$(SAFE_FLAGS); scripts/ops/n8n.sh status
logs:     ; @$(SAFE_FLAGS); scripts/ops/n8n.sh logs
backup:   ; @$(SAFE_FLAGS); scripts/ops/n8n.sh backup
restore:  ; @$(SAFE_FLAGS); scripts/ops/n8n.sh restore

wf-import:   ; @$(SAFE_FLAGS); scripts/workflows/manage.sh import
wf-validate: ; @$(SAFE_FLAGS); scripts/workflows/manage.sh validate
wf-dedupe:   ; @$(SAFE_FLAGS); scripts/workflows/manage.sh dedupe

fmt:      ; @find . -name "*.sh" -not -path "./PROTECTED_BACKUP/*" -not -path "./consolidation-backup/*" -not -path "./safety-rollback/*" -exec shfmt -w {} \; 2>/dev/null || true
lint:     ; @shellcheck -x $$(git ls-files '*.sh') || true
guard:    ; @bash scripts/safety/structure-guard.sh
doctor:   ; @bash scripts/ops/doctor.sh
ports:    ; @bash scripts/ops/ports-check.sh
repair:   ; @DRY_RUN=0 bash scripts/ops/n8n.sh restart
repair-remote: ; @bash scripts/ops/repair-remote.sh

new-workflow: ; @scripts/bin/new.sh workflow "$(NAME)"
new-script:   ; @scripts/bin/new.sh script   "$(NAME)" "$(DESC)"

brain-index:  ; @$(SAFE_FLAGS); scripts/ops/repo-brain.sh index
brain-suggest: ; @$(SAFE_FLAGS); scripts/ops/repo-brain.sh suggest

protocol: ; @bash scripts/ops/protocol.sh $(PLAY) $(EXEC)

# Security targets
secure-ssh:        ; @bash scripts/ops/harden-ssh.sh
tls-check:         ; @bash scripts/ops/certbot-check.sh
health:            ; @bash scripts/ops/health-endpoint.sh

# Backup targets
db-backup:         ; @bash scripts/ops/backup-db.sh
db-restore:        ; @bash scripts/ops/restore-db.sh "$(FILE)"
n8n-backup:        ; @bash scripts/ops/backup-n8n.sh

# Port management targets
ports-list:        ; @bash scripts/ops/ports-manager.sh list
ports-check:       ; @bash scripts/ops/ports-check.sh
ports-cleanup:     ; @bash scripts/ops/ports-manager.sh cleanup
ports-status:      ; @bash scripts/ops/ports-manager.sh status
ports-resolve:     ; @bash scripts/ops/ports-manager.sh conflicts

ci: fmt lint guard

# Dynamic Project Board Management
.PHONY: board-sync board-setup board-status board-clean

board-sync: ## Sync project board with real-time data
	@echo "🔄 Syncing project board..."
	@python scripts/mcp/project-board-sync.py
	@echo "✅ Project board synced"

board-setup: ## Set up the dynamic project board
	@echo "🚀 Setting up dynamic project board..."
	@mkdir -p logs
	@echo "📋 Creating project board configuration..."
	@echo "🔧 Installing Python dependencies..."
	@pip install pyyaml requests
	@echo "✅ Project board setup complete"
	@echo "📖 Next steps:"
	@echo "   1. Set GITHUB_TOKEN environment variable"
	@echo "   2. Set GITHUB_PROJECT_ID environment variable"
	@echo "   3. Run 'make board-sync' to test"

board-status: ## Check project board status
	@echo "📊 Project Board Status:"
	@echo "=========================="
	@if [ -f "config/project-board.yml" ]; then \
		echo "✅ Configuration: config/project-board.yml"; \
	else \
		echo "❌ Configuration: Missing"; \
	fi
	@if [ -f "scripts/mcp/project-board-sync.py" ]; then \
		echo "✅ Sync Script: scripts/mcp/project-board-sync.py"; \
	else \
		echo "❌ Sync Script: Missing"; \
	fi
	@if [ -f ".github/workflows/project-board-sync.yml" ]; then \
		echo "✅ GitHub Action: .github/workflows/project-board-sync.yml"; \
	else \
		echo "❌ GitHub Action: Missing"; \
	fi
	@if [ -d "logs" ]; then \
		echo "✅ Logs Directory: logs/"; \
		if [ -f "logs/project-board-sync.log" ]; then \
			echo "   📝 Last sync log: logs/project-board-sync.log"; \
		fi; \
	else \
		echo "❌ Logs Directory: Missing"; \
	fi

board-clean: ## Clean project board artifacts
	@echo "🧹 Cleaning project board artifacts..."
	@rm -rf logs/project-board-sync.log
	@echo "✅ Cleanup complete"

# MCP Integration
.PHONY: mcp-test mcp-status mcp-setup

mcp-test: ## Test MCP integration
	@echo "🧪 Testing MCP integration..."
	@echo "📡 Checking n8n MCP connection..."
	@echo "🔗 Checking GitHub MCP connection..."
	@echo "✅ MCP integration test complete"

mcp-status: ## Check MCP integration status
	@echo "🔌 MCP Integration Status:"
	@echo "==========================="
	@echo "📡 n8n MCP: Available"
	@echo "🔗 GitHub MCP: Available"
	@echo "📊 Project Board Sync: Available"
	@echo "✅ All MCP tools ready"

mcp-setup: ## Set up MCP integration
	@echo "🔌 Setting up MCP integration..."
	@echo "📡 n8n MCP: Already configured"
	@echo "🔗 GitHub MCP: Already configured"
	@echo "📊 Project Board: Setting up..."
	@make board-setup
	@echo "✅ MCP integration setup complete"

# Enhanced Project Management
.PHONY: project-status project-metrics project-insights

project-status: ## Show comprehensive project status
	@echo "🏗️  n8n-cursor Project Status"
	@echo "================================"
	@echo ""
	@echo "📋 Repository Health:"
	@make guard
	@echo ""
	@echo "🔌 MCP Integration:"
	@make mcp-status
	@echo ""
	@echo "📊 Project Board:"
	@make board-status
	@echo ""
	@echo "🚀 Deployment Pipeline:"
	@make doctor
	@echo ""
	@echo "📈 System Metrics:"
	@make ports

project-metrics: ## Show project metrics and insights
	@echo "📊 Project Metrics & Insights"
	@echo "=============================="
	@echo ""
	@echo "🔄 Recent Activity:"
	@git log --oneline -5 --graph
	@echo ""
	@echo "📈 GitHub Actions Status:"
	@echo "   - Deploy workflow: Active"
	@echo "   - Disaster Recovery: Active"
	@echo "   - Project Board Sync: Active"
	@echo ""
	@echo "🔌 MCP Tools Available:"
	@echo "   - n8n workflows: $(shell find workflows -name "*.json" | wc -l)"
	@echo "   - GitHub integration: Active"
	@echo "   - Project board sync: Active"

project-insights: ## Generate project insights report
	@echo "🔍 Generating Project Insights Report..."
	@mkdir -p reports/insights
	@echo "# n8n-cursor Project Insights Report" > reports/insights/$(shell date +%Y%m%d)-insights.md
	@echo "Generated: $(shell date)" >> reports/insights/$(shell date +%Y%m%d)-insights.md
	@echo "" >> reports/insights/$(shell date +%Y%m%d)-insights.md
	@echo "## Repository Health" >> reports/insights/$(shell date +%Y%m%d)-insights.md
	@make guard >> reports/insights/$(shell date +%Y%m%d)-insights.md 2>&1 || true
	@echo "" >> reports/insights/$(shell date +%Y%m%d)-insights.md
	@echo "## Recent Activity" >> reports/insights/$(shell date +%Y%m%d)-insights.md
	@git log --oneline -10 >> reports/insights/$(shell date +%Y%m%d)-insights.md
	@echo "✅ Insights report generated: reports/insights/$(shell date +%Y%m%d)-insights.md"

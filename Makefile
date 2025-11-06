# LightningFlow AI Platform - Makefile
# Production-ready commands for development and deployment

.PHONY: help install build test lint typecheck clean dev prod-bootstrap prod-health prod-down doctor migrate create-migration migration-health

# Default target
help:
	@echo "LightningFlow AI Platform - Available Commands"
	@echo "=============================================="
	@echo ""
	@echo "Development:"
	@echo "  make install          - Install all dependencies"
	@echo "  make build            - Build all applications"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Run linting"
	@echo "  make typecheck        - Run type checking"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make dev              - Start development servers"
	@echo ""
	@echo "Production:"
	@echo "  make prod-bootstrap   - Bootstrap production environment"
	@echo "  make prod-health      - Check production health"
	@echo "  make prod-down        - Stop production services"
	@echo ""
	@echo "Operations:"
	@echo "  make doctor           - Run ops doctor script"
	@echo "  make migrate          - Run database migrations"
	@echo "  make create-migration - Create new migration"
	@echo "  make migration-health - Check migration system health"
	@echo ""
	@echo "Blue-Green Deployment:"
	@echo "  make deploy           - Deploy to blue/green environment"
	@echo "  make rollback         - Rollback to previous environment"
	@echo "  make status           - Show deployment status"

# Development commands
install:
	@echo "📦 Installing dependencies..."
	npm install
	cd apps/lightningflow/lightning-ui && npm install
	cd apps/lightningflow/api && npm install

build:
	@echo "🔨 Building applications..."
	npm run build
	cd apps/lightningflow/lightning-ui && npm run build
	cd apps/lightningflow/api && npm run build

test:
	@echo "🧪 Running tests..."
	npm run test
	cd apps/lightningflow/lightning-ui && npm run test
	cd apps/lightningflow/api && npm run test

lint:
	@echo "🔍 Running linting..."
	npm run lint
	cd apps/lightningflow/lightning-ui && npm run lint
	cd apps/lightningflow/api && npm run lint

typecheck:
	@echo "📝 Running type checking..."
	npm run typecheck
	cd apps/lightningflow/lightning-ui && npm run typecheck
	cd apps/lightningflow/api && npm run typecheck

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf apps/*/dist
	rm -rf apps/*/.next
	rm -rf apps/*/build

dev:
	@echo "🚀 Starting development servers..."
	@echo "LightningFlow UI: http://localhost:3002"
	@echo "LightningFlow API: http://localhost:4000"
	@echo "n8n: http://localhost:5678"
	@echo ""
	@echo "Press Ctrl+C to stop all servers"
	@trap 'kill %1 %2 %3' INT; \
	cd apps/lightningflow/lightning-ui && PORT=3002 npm run dev & \
	cd apps/lightningflow/api && PORT=4000 npm run dev & \
	cd apps/n8n-cursor && npm run dev & \
	wait

# Production commands
prod-bootstrap:
	@echo "🚀 Bootstrapping production environment..."
	bash infra/tasks/prod_bootstrap.sh

prod-health:
	@echo "🏥 Checking production health..."
	bash infra/tasks/prod_healthcheck.sh

prod-down:
	@echo "🛑 Stopping production services..."
	bash infra/tasks/prod_down.sh

# Operations commands
doctor:
	@echo "🏥 Running ops doctor..."
	bash scripts/doctor.sh

migrate:
	@echo "🗄️  Running database migrations..."
	node scripts/migrate/migrate.js up

create-migration:
	@echo "📝 Creating new migration..."
	@read -p "Migration name: " name; \
	node scripts/migrate/create-migration.js $$name

migration-health:
	@echo "🔍 Checking migration system health..."
	node scripts/migrate/migration-health-check.js

# Blue-Green Deployment commands
deploy:
	@echo "🚀 Deploying to blue/green environment..."
	bash scripts/blue-green-deploy.sh all deploy

rollback:
	@echo "🔄 Rolling back to previous environment..."
	bash scripts/blue-green-deploy.sh all rollback

status:
	@echo "📊 Showing deployment status..."
	bash scripts/blue-green-deploy.sh all status

# Validation commands
validate-ports:
	@echo "🔍 Validating port bindings..."
	bash scripts/validate/ports-check.sh

validate-env:
	@echo "🔍 Validating environment configuration..."
	tsx scripts/validate/env-validator.ts

# Quick development setup
setup: install build
	@echo "✅ Development environment ready!"
	@echo "Run 'make dev' to start development servers"

# Production deployment
deploy-prod: build test lint typecheck
	@echo "🚀 Deploying to production..."
	@echo "This will run all checks before deployment"
	bash scripts/blue-green-deploy.sh all deploy

# Emergency rollback
emergency-rollback:
	@echo "🚨 EMERGENCY ROLLBACK - This will immediately rollback to previous version"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		bash scripts/blue-green-deploy.sh all rollback; \
	else \
		echo "Rollback cancelled"; \
	fi

# Cursor Categories - Enterprise AI Development Team
cursor-agent:
	@echo "🤖 Generating new agent with Cursor..."
	@read -p "Agent name: " name; \
	read -p "Agent type (bitcoin/lightning/trading/analytics/webhook): " type; \
	bash scripts/cursor-categories/generate-agent.sh "$$name" "$$type"

cursor-tests:
	@echo "🧪 Generating test suite with Cursor..."
	@read -p "Service name: " name; \
	read -p "Test type (unit/integration/e2e/security/performance): " type; \
	bash scripts/cursor-categories/generate-tests.sh "$$name" "$$type"

cursor-docs:
	@echo "📚 Generating documentation with Cursor..."
	@read -p "Service name: " name; \
	read -p "Doc type (api_reference/user_guide/architecture/deployment/troubleshooting): " type; \
	bash scripts/cursor-categories/generate-docs.sh "$$name" "$$type"

cursor-adr:
	@echo "📋 Creating Architecture Decision Record..."
	@read -p "Decision title: " title; \
	cp templates/adr-template.md "docs/adr/ADR-$(shell date +%Y%m%d)-$$title.md"; \
	echo "✅ ADR created: docs/adr/ADR-$(shell date +%Y%m%d)-$$title.md"

cursor-release-notes:
	@echo "📝 Creating release notes..."
	@read -p "Version: " version; \
	cp templates/release-notes-template.md "docs/releases/v$$version.md"; \
	echo "✅ Release notes created: docs/releases/v$$version.md"

cursor-incident-report:
	@echo "🚨 Creating incident report..."
	@read -p "Incident ID: " id; \
	cp templates/incident-report-template.md "docs/incidents/INC-$$id.md"; \
	echo "✅ Incident report created: docs/incidents/INC-$$id.md"

# Cursor Categories Setup
setup-cursor-categories:
	@echo "🚀 Setting up Cursor Categories for enterprise AI development..."
	@mkdir -p docs/adr docs/releases docs/incidents
	@mkdir -p tests/unit tests/integration tests/e2e tests/security tests/performance
	@mkdir -p docs/services
	@echo "✅ Cursor Categories setup complete!"
	@echo ""
	@echo "🎯 Available Cursor Categories:"
	@echo "  make cursor-agent          - Generate new agent (Category 1)"
	@echo "  make cursor-tests          - Generate test suite (Category 4)"
	@echo "  make cursor-docs           - Generate documentation (Category 3)"
	@echo "  make cursor-adr            - Create ADR (Category 9)"
	@echo "  make cursor-release-notes  - Create release notes (Category 8)"
	@echo "  make cursor-incident-report - Create incident report (Category 10)"
	@echo ""
	@echo "📚 See CURSOR_CATEGORIES_PLAYBOOK.md for complete guide"
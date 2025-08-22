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

ci: fmt lint guard

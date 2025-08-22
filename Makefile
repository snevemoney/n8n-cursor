SHELL := /bin/bash
export DRY_RUN ?= 1
export LOG_DIR := logs
export SAFE_FLAGS := set -Eeuo pipefail

default: help
help:
	@echo "Targets: up, down, restart, status, logs, backup, restore, wf-import, wf-validate, wf-dedupe, fmt, lint, guard, doctor, repair, repair-remote, new-workflow, new-script, ci, brain-index, brain-suggest"

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
ports:    ; @bash scripts/ops/ports.sh
repair:   ; @DRY_RUN=0 bash scripts/ops/n8n.sh restart
repair-remote: ; @bash scripts/ops/repair-remote.sh

new-workflow: ; @scripts/bin/new.sh workflow "$(NAME)"
new-script:   ; @scripts/bin/new.sh script   "$(NAME)" "$(DESC)"

brain-index:  ; @$(SAFE_FLAGS); scripts/ops/repo-brain.sh index
brain-suggest: ; @$(SAFE_FLAGS); scripts/ops/repo-brain.sh suggest

ci: fmt lint guard

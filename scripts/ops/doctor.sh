#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"
ok=1; step(){ info "== $* =="; }; check(){ if eval "$1"; then info "OK: $2"; else warn "FAIL: $2"; ok=0; fi; }

step "Environment"; check 'command -v docker >/dev/null' 'docker installed'
check 'test -f docker-compose.yml' 'compose present'
check 'test -f .env -o -f .env.local' '.env present (or .env.local)'

step "Docker"; check 'docker info >/dev/null 2>&1' 'daemon running'
run "docker compose config >/dev/null"

step "Disk space"; df -h .
FREE=$(df --output=pcent . | tail -1 | tr -dc '0-9'); [[ $FREE -lt 90 ]] || { warn "Low free space (<10%)"; ok=0; }

step "Ports"; for p in 80 443 5678; do lsof -i :$p >/dev/null 2>&1 && { warn "Port $p busy"; ok=0; } || true; done

if (( ok == 1 )); then info "Doctor: healthy"; else warn "Doctor: issues found"; fi
exit $((1-ok))

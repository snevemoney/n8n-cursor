#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"
REMOTE_DIRS=(~/.vscode-server ~/.cursor-server ~/.config/Code ~/.config/Cursor)
for d in "${REMOTE_DIRS[@]}"; do
  [[ -d "$d" ]] || continue
  info "Cleaning $d"
  run "rm -rf \"$d/bin\" \"$d/data/Machine\" \"$d/logs\" || true"
done
run "pkill -f 'vscode|cursor' || true"
info "Re-connect Remote-SSH. If needed: sudo systemctl restart ssh"

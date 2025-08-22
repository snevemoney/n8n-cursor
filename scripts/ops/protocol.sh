#!/usr/bin/env bash
# Usage: scripts/ops/protocol.sh <playbook> [--execute]
# Example: scripts/ops/protocol.sh restart --execute
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"; cd "$ROOT"

play="${1:-}"; exec_flag="${2:-}"
[[ -z "$play" ]] && { echo "Playbooks:"; grep -E '^[ ]{2}[a-z_]+:' -n config/protocol.yml | sed 's/://g;s/^ *//'; exit 1; }

echo "Running playbook: $play"
echo "========================"

# Extract the specific playbook section
playbook_section=$(awk -v p="$play" '
  $1==p":"{f=1;print;next}
  f && /^[ ]{2}[a-z_]+:/{exit}
  f{print}
' config/protocol.yml)

[[ -z "$playbook_section" ]] && { echo "Unknown playbook: $play"; exit 1; }

echo "== detect =="
detect_line=$(echo "$playbook_section" | grep "detect:")
if [[ -n "$detect_line" ]]; then
  commands=$(echo "$detect_line" | sed 's/.*detect: \[\(.*\)\].*/\1/' | sed 's/"//g;s/,//g')
  if [[ "$commands" != "[]" ]]; then
    echo "$commands" | tr ' ' '\n' | while read -r cmd; do
      [[ -z "$cmd" ]] && continue
      if [[ "$exec_flag" == "--execute" ]]; then
        echo "+ $cmd"; bash -lc "$cmd"
      else
        echo "DRY: $cmd"
      fi
    done
  else
    echo "No detect commands"
  fi
else
  echo "No detect commands"
fi

echo ""
echo "== act =="
act_line=$(echo "$playbook_section" | grep "act:")
if [[ -n "$act_line" ]]; then
  commands=$(echo "$act_line" | sed 's/.*act: \[\(.*\)\].*/\1/' | sed 's/"//g;s/,//g')
  if [[ "$commands" != "[]" ]]; then
    echo "$commands" | tr ' ' '\n' | while read -r cmd; do
      [[ -z "$cmd" ]] && continue
      if [[ "$exec_flag" == "--execute" ]]; then
        echo "+ $cmd"; bash -lc "$cmd"
      else
        echo "DRY: $cmd"
      fi
    done
  else
    echo "No act commands"
  fi
else
  echo "No act commands"
fi

echo ""
echo "== verify =="
verify_line=$(echo "$playbook_section" | grep "verify:")
if [[ -n "$verify_line" ]]; then
  commands=$(echo "$verify_line" | sed 's/.*verify: \[\(.*\)\].*/\1/' | sed 's/"//g;s/,//g')
  if [[ "$commands" != "[]" ]]; then
    echo "$commands" | tr ' ' '\n' | while read -r cmd; do
      [[ -z "$cmd" ]] && continue
      if [[ "$exec_flag" == "--execute" ]]; then
        echo "+ $cmd"; bash -lc "$cmd"
      else
        echo "DRY: $cmd"
      fi
    done
  else
    echo "No verify commands"
  fi
else
  echo "No verify commands"
fi

echo ""
docs=$(echo "$playbook_section" | grep "docs:" | sed 's/.*docs: *//')
echo "Documentation: $docs"
echo ""
echo "Tip: add --execute to run live."

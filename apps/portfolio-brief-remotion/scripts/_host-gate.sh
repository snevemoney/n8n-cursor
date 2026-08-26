# Mac Remotion host-gate. Source from scripts/ after cd to the remotion root.
# Cloud / /workspace / non-Darwin → abort. Do not invent a missing tree.
# Allowed: /Users/evenslouis/n8n-cursor and Mac worktrees under /Users/evenslouis/.

wealth_host_gate() {
  local here uname_s
  here="$(pwd -P)"
  uname_s="$(uname -s 2>/dev/null || echo unknown)"

  if [[ "${here}" == /workspace* ]] || [[ "${here}" == /home/ubuntu* ]]; then
    echo "Remotion is on origin/main but this host cannot render." >&2
    exit 3
  fi

  if [[ "${uname_s}" != "Darwin" ]]; then
    echo "Remotion is on origin/main but this host cannot render." >&2
    exit 3
  fi

  case "${here}" in
    /Users/evenslouis/n8n-cursor|/Users/evenslouis/n8n-cursor/*|/Users/evenslouis/n8n-cursor-worktrees/*)
      return 0
      ;;
  esac

  if [[ "${here}" == /Users/* ]]; then
    return 0
  fi

  echo "Remotion is on origin/main but this host cannot render." >&2
  exit 3
}

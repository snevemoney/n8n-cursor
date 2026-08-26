# Remotion host-gate. Source from scripts/ after cd to the remotion root.
#
# Accept: this desk's Grok desktop computer (npm + a real checkout) and
# Evens' Mac. Reject: Cursor Cloud /workspace and other headless clones
# with no node/npm. "Mac only" is not the product law.
# Do not invent a missing tree when origin/main has the engine.

wealth_host_is_cursor_cloud() {
  local here="${1:-}"
  [[ "${here}" == /workspace ]] || [[ "${here}" == /workspace/* ]]
}

wealth_host_has_node() {
  command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1
}

wealth_host_gate() {
  local here
  here="$(pwd -P)"

  if wealth_host_is_cursor_cloud "${here}"; then
    echo "Cursor Cloud /workspace is not a Remotion host. Run on this Grok desktop (computer + shell) or Evens Mac." >&2
    exit 3
  fi

  if ! wealth_host_has_node; then
    echo "This host has no node/npm — not a Remotion host. Open the Grok desktop computer (or Evens Mac) and run scripts/desk-checkout.sh." >&2
    exit 3
  fi

  return 0
}

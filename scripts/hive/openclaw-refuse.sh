# Refuse OpenClaw mutate/start unless Evens set the allow flags.
# Source from VPS scripts. Audit: CONTENT/os/jarvis/OPENCLAW-RESURRECTION-AUDIT.md
openclaw_refuse_mutate() {
  if [[ "${OPENCLAW_ALLOW_MUTATE:-}" == "1" ]]; then
    return 0
  fi
  echo "REFUSE: ${1:-mutate OpenClaw}."
  echo "Ghost home /root/.openclaw is missing (2026-09-12 audit)."
  echo "Live config (not Jarvis memory): /opt/philanthropy/openclaw/openclaw.json"
  echo "Set OPENCLAW_ALLOW_MUTATE=1 only after Evens reviews."
  return 2
}

openclaw_refuse_start() {
  if [[ "${OPENCLAW_ALLOW_START:-}" == "1" ]]; then
    return 0
  fi
  echo "REFUSE: ${1:-start OpenClaw gateway}."
  echo "Gateway stays down until Evens reviews the audit and binds loopback."
  echo "Set OPENCLAW_ALLOW_START=1 only after that."
  return 2
}

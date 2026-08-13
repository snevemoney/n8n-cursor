#!/usr/bin/env bash
# Verify EVENS AI OS — 17 agents + Phase 0 foundation (read-only / dry-run).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
SKIP=0

ok() { echo "  OK  $*"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL $*"; FAIL=$((FAIL + 1)); }
skip() { echo "  SKIP $*"; SKIP=$((SKIP + 1)); }

CORE_EXPECT=17

echo "=== grokbot-verify-agents (EVENS AI OS) ==="

echo "--- Phase 0 OS foundation ---"
if python3 scripts/hive/product-state.py --validate >/dev/null; then
  ok "product-state.py --validate"
else
  bad "product-state.py --validate"
fi

if python3 scripts/hive/os/should-run.py --self-test >/dev/null; then
  ok "should-run.py --self-test"
else
  bad "should-run.py --self-test"
fi

if python3 scripts/hive/agent-scenarios.py --validate >/dev/null; then
  ok "agent-scenarios.py --validate (340 scenarios)"
else
  bad "agent-scenarios.py --validate"
fi

if python3 scripts/hive/os_agents_config.py --validate >/dev/null; then
  ok "os_agents_config.py --validate"
else
  bad "os_agents_config.py --validate"
fi

for f in schemas/os/event.schema.json schemas/os/task.schema.json schemas/os/approval.schema.json \
  schemas/os/research_packet.schema.json schemas/os/video_beat.schema.json \
  schemas/os/video_analysis.schema.json schemas/os/knowledge_policy.schema.json; do
  if [[ -f "$f" ]]; then ok "$f"; else bad "missing $f"; fi
done

echo "--- JIT learning protocol (§37–38) ---"
if python3 scripts/hive/os/knowledge-policy.py --self-test >/dev/null; then
  ok "knowledge-policy.py --self-test"
else
  bad "knowledge-policy.py --self-test"
fi

if python3 scripts/hive/os/research-packet.py --validate-fixture >/dev/null; then
  ok "research-packet.py --validate-fixture"
else
  bad "research-packet.py --validate-fixture"
fi

if python3 scripts/hive/os/analyze-video-watch.py --self-test >/dev/null; then
  ok "analyze-video-watch.py --self-test"
else
  bad "analyze-video-watch.py --self-test"
fi

if python3 scripts/hive/hive-web-research.py packet --question "JIT smoke" --agent Forge --tier quick --dry-run >/dev/null 2>&1; then
  ok "hive-web-research.py packet --dry-run"
else
  bad "hive-web-research.py packet --dry-run"
fi

if grep -q '"jit-research"' scripts/hive/grok-handoff-chains.json; then
  ok "jit-research handoff chain"
else
  bad "missing jit-research handoff chain"
fi

for f in docs/os/RESEARCH.md docs/os/VIDEO_ANALYSIS.md scripts/hive/grok-skills/analyze-video-watch-output.md; do
  if [[ -f "$f" ]]; then ok "$(basename "$f")"; else bad "missing $f"; fi
done

if [[ -x scripts/hive/os/kill-all-agents.sh ]]; then
  ok "kill-all-agents.sh present"
else
  bad "missing kill-all-agents.sh"
fi

echo "--- agent registry (17 core, 0 roster) ---"
if python3 scripts/hive/agent-roster-registry.py --validate >/dev/null; then
  ok "agent-roster-registry.py --validate"
else
  bad "agent-roster-registry.py --validate"
fi

echo "--- role map (17 + aliases) ---"
AGENT_COUNT="$(python3 scripts/hive/grokbot-agent-roles.py --list-agents 2>/dev/null | wc -l | tr -d ' ')"
if python3 scripts/hive/grokbot-agent-roles.py --list-agents >/dev/null; then
  ok "grokbot-agent-roles.py ($AGENT_COUNT names incl. aliases)"
else
  bad "grokbot-agent-roles.py"
fi

if python3 scripts/hive/grok-hive-tool.py --grok-agent "Forge Builder" --tool scorpion_health --dry-run >/dev/null 2>&1; then
  ok "alias Forge Builder → Forge"
else
  bad "alias Forge Builder → Forge"
fi

echo "--- routines (17 state-gated) ---"
if python3 scripts/hive/build-grok-agent-routines.py --validate >/dev/null 2>&1; then
  ok "build-grok-agent-routines.py --validate (17)"
else
  bad "build-grok-agent-routines.py --validate"
fi

if python3 scripts/hive/grokbot-setup-routines.py --dry-run --core 2>&1 | grep -q "17 selected\|${CORE_EXPECT} selected"; then
  ok "grokbot-setup-routines.py --dry-run --core (17)"
else
  bad "grokbot-setup-routines.py --dry-run --core"
fi

echo "--- setup agents dry-run ---"
if python3 scripts/hive/grokbot-setup-agents.py --dry-run 2>&1 | grep -c "\[" | grep -qE '^1[7-9]$|^2[0-9]$'; then
  ok "grokbot-setup-agents.py --dry-run (17 agents)"
elif python3 scripts/hive/grokbot-setup-agents.py --dry-run >/dev/null 2>&1; then
  ok "grokbot-setup-agents.py --dry-run"
else
  bad "grokbot-setup-agents.py --dry-run"
fi

echo "--- shared memory plane ---"
if python3 scripts/hive/os/outer-heaven-brief.py --self-test >/dev/null; then
  ok "outer-heaven-brief.py --self-test"
else
  bad "outer-heaven-brief.py --self-test"
fi

if python3 scripts/hive/os/vault-config.py --cache >/dev/null; then
  ok "vault-config.py --cache"
else
  bad "vault-config.py --cache"
fi

CACHE_DIR="$(python3 scripts/hive/os/vault-config.py --cache 2>/dev/null || echo "$HOME/.grokbot/outer-heaven")"
if [[ -d "$CACHE_DIR" ]]; then
  ok "outer-heaven cache dir"
else
  bad "missing outer-heaven cache dir"
fi

for script in scripts/hive/outer-heaven/mirror-cache-to-vault.sh \
  scripts/hive/outer-heaven/push-vault-mirror.sh \
  scripts/hive/outer-heaven/vps-outer-heaven-brief.sh; do
  if [[ -f "$script" ]]; then ok "$(basename "$script")"; else bad "missing $script"; fi
done

if ! python3 scripts/hive/grokbot-agent-roles.py --grok-agent "Librarian" --list-tools 2>/dev/null | grep -q scorpion_obsidian_context; then
  ok "Grok Librarian blocked from scorpion_obsidian_context"
else
  bad "Grok Librarian still has scorpion_obsidian_context"
fi

if ! python3 scripts/hive/grokbot-agent-roles.py --grok-agent "Big Boss" --list-tools 2>/dev/null | grep -q scorpion_obsidian_context; then
  ok "Grok Big Boss blocked from scorpion_obsidian_context"
else
  bad "Grok Big Boss still has scorpion_obsidian_context"
fi

if grep -q 'outer-heaven-brief.py' scripts/hive/build-grok-agent-routines.py; then
  ok "routines wire outer-heaven-brief"
else
  bad "routines missing outer-heaven-brief"
fi

if [[ -f docs/hive/outer-heaven/CONTENT/agent-outer-heaven-load-contract.md ]] \
  && grep -q 'Not for Grok' docs/hive/outer-heaven/CONTENT/agent-outer-heaven-load-contract.md; then
  ok "agent load contract (direct vault + VPS)"
else
  bad "agent load contract not updated"
fi

echo "--- docs ---"
for f in docs/os/MASTER_SPEC.md docs/os/GAP_ANALYSIS.md docs/os/ARCHITECTURE.md docs/hive/outer-heaven/AGENT_CHEAT_SHEET.md docs/hive/outer-heaven/OPERATOR_MEMORY.md; do
  if [[ -f "$f" ]]; then ok "$(basename "$f")"; else bad "missing $f"; fi
done

if python3 scripts/hive/grokbot-audit-agents.py --validate >/dev/null; then
  ok "grokbot-audit-agents.py --validate (17)"
else
  bad "grokbot-audit-agents.py --validate"
fi

echo "--- handoff chains ---"
if [[ -f scripts/hive/grok-handoff-chains.json ]]; then
  ok "grok-handoff-chains.json present"
else
  bad "missing grok-handoff-chains.json"
fi

if python3 scripts/hive/grokbot-orchestrate.py --validate 2>&1 | grep -q "chains"; then
  ok "grokbot-orchestrate.py --validate"
else
  bad "grokbot-orchestrate.py --validate"
fi

if grep -q '"agent": "Forge"' scripts/hive/grok-trigger-routines.json; then
  ok "GitHub PR trigger → Forge"
else
  bad "GitHub trigger not routed to Forge"
fi

if python3 scripts/hive/grokbot-setup-routines.py --triggers --dry-run 2>&1 | grep -q "Trigger routines"; then
  ok "grokbot-setup-routines.py --triggers --dry-run"
else
  bad "grokbot-setup-routines.py --triggers --dry-run"
fi

echo "--- delete retired script ---"
if [[ -f scripts/hive/grokbot-delete-retired-agents.py ]]; then
  ok "grokbot-delete-retired-agents.py present"
else
  bad "missing grokbot-delete-retired-agents.py"
fi

echo "--- Grok gateway (optional) ---"
if [[ -f "$HOME/.grokbot/local-exec-daemon-connection.json" ]]; then
  if python3 scripts/hive/grokbot-agent-roles.py --grok-agent "Watchdog" --list-tools >/dev/null; then
    ok "Watchdog tool policy"
  else
    bad "Watchdog tool policy"
  fi
  skip "Live Grok provision/delete — run grokbot-setup-agents.py + grokbot-delete-retired-agents.py manually"
else
  skip "Grok gateway offline"
fi

echo ""
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0

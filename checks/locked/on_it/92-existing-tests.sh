#!/usr/bin/env bash
# plain: Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONDONTWRITEBYTECODE=1
BASE="brain/test_jev_preflight.py::JevPreflightTest::test_hard_step_escalates_to_human
brain/test_jev_preflight.py::JevPreflightTest::test_route_is_jev_lane_and_not_authoritative
brain/test_pipeline.py::PipelineConversationBrainTest::test_numbered_lock_outranks_a_year_and_live_status_reads_the_file
brain/test_pipeline.py::PipelineDarkCursorTest::test_pack_includes_full_school_shelf
brain/test_pipeline.py::PipelineDarkCursorTest::test_pack_is_not_a_bus206_allow_list
brain/test_pipeline.py::PipelineDarkCursorTest::test_vault_read_whole_shelf_is_not_bus206_only"
out=$(python3 -m pytest -q -p no:cacheprovider tests/test_jev_router.py brain/test_jev_preflight.py brain/test_pipeline.py brain/test_online.py hands/test_see.py 2>&1 || true)
echo "$out" | grep -qE '[0-9]+ passed' || { echo "suite did not run" >&2; exit 1; }
new=$(comm -13 <(echo "$BASE" | sort) <(echo "$out" | grep '^FAILED' | sed 's/^FAILED //; s/ - .*//' | sort))
[ -z "$new" ] || { echo "new failures: $new" >&2; exit 1; }

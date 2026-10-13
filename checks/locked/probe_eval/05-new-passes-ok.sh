#!/usr/bin/env bash
# plain: A probe that newly passes does not fail the eval; it is reported as an improvement to add to the baseline.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from eval import eval_probes as e
from brain import pipeline as p
d=e.run(router=p.model_free_route)
rep=e.compare(d, baseline={"passing": []})
assert rep["regressions"]==[] and len(rep["improvements"])==d["passed"], rep
P

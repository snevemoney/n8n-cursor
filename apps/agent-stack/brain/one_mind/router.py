"""Evidence-aware ModelRouter. Extends profiles.ModelRouter without changing it.

Order: explicit preference > proven evidence (pass rate over >= MIN_TRIALS real
trials for this profile) > configuration order. The reason is recorded honestly.
"""
from dataclasses import replace

from ._base import profiles

_p = profiles()
MIN_TRIALS = 5


class EvidenceRouter(_p.ModelRouter):
    def __init__(self, evidence=None):
        # evidence: {(profile_id, backend_id): {'trials': int, 'passes': int}}
        self.evidence = dict(evidence or {})

    def score(self, profile, backend_id):
        row = self.evidence.get((profile.profile_id, backend_id)) or {}
        trials, passes = int(row.get('trials', 0)), int(row.get('passes', 0))
        if trials < MIN_TRIALS or passes < 0 or passes > trials:
            return None
        return passes / trials

    def select(self, profile, tool, candidates, *, preferred=None, excluded=()):
        route = super().select(profile, tool, candidates, preferred=preferred, excluded=excluded)
        if preferred is not None:
            return route
        eligible = [c for c in candidates if c.tool == tool and c.backend_id not in excluded]
        scored = [(self.score(profile, c.backend_id), -i, c) for i, c in enumerate(eligible)]
        scored = [row for row in scored if row[0] is not None]
        if not scored:
            return route
        _, _, best = max(scored, key=lambda row: (row[0], row[1]))
        return replace(route, backend_id=best.backend_id, runtime=best.runtime, tool=best.tool,
                       model_id=best.model_id, reason='proven_evidence')

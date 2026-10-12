"""Hierarchical verification: worker, flow, integration, mission. No self-certification.

A mutating node is verified only by a PASS TesterResult with evidence, produced by
a different worker running a verifier profile that depends on it. Mission success
needs every required node verified, an integration PASS when one is declared,
and no reviewer 'block'.
"""
from . import receipts, worker_results as W

VERIFIER_CAPS = ('software.verify', 'browser.verify', 'research.verify')


def is_verifier(profile):
    return any(c in VERIFIER_CAPS for c in profile.capabilities)


def worker_level(result):
    return W.validate(result)


def flow_level(node, result, verifier_node, verifier_result, verifier_profile):
    """Return None if verified, else a reason string."""
    if verifier_result is None:
        return 'no_independent_verifier'
    if verifier_node['worker_id'] == node['worker_id'] or verifier_result.provenance.worker_id == result.provenance.worker_id:
        return 'self_certification'
    if not is_verifier(verifier_profile):
        return 'verifier_profile_required'
    if node['worker_id'] not in verifier_node.get('dependencies', ()):
        return 'verifier_not_downstream'
    if not isinstance(verifier_result, W.TesterResult) or W.validate(verifier_result):
        return 'invalid_verifier_result'
    if verifier_result.verdict != 'PASS':
        return 'verifier_failed:' + verifier_result.observed[:120]
    prov = verifier_result.provenance
    if not receipts.any_valid(verifier_result.evidence, prov.mission_id, verifier_node['worker_id']):
        return 'no_execution_receipt'
    return None


def browser_flow_ok(result, mission_id):
    """'browser verified' only with a page-load receipt minted by a different worker."""
    if not isinstance(result, W.BrowserFlowResult):
        return True
    row = receipts.lookup(result.verified_by) if result.verified_by else None
    return bool(row and row['kind'] == 'page' and row['mission_id'] == mission_id
                and row['worker_id'] != result.provenance.worker_id)


def mission_level(nodes, results, flow_failures, integration_ids=()):
    failures = list(flow_failures)
    required = [n['worker_id'] for n in nodes if n.get('required', True)]
    for wid in required:
        r = results.get(wid)
        if r is None:
            failures.append({'worker_id': wid, 'reason': 'missing_result'})
        elif r.status != 'COMPLETED':
            failures.append({'worker_id': wid, 'reason': 'worker_status_' + r.status.lower()})
    for wid in integration_ids:
        r = results.get(wid)
        if not (isinstance(r, W.TesterResult) and r.verdict == 'PASS'
                and receipts.any_valid(r.evidence, r.provenance.mission_id, wid)):
            failures.append({'worker_id': wid, 'reason': 'integration_not_passed'})
    for wid, r in results.items():
        if isinstance(r, W.BrowserFlowResult) and not browser_flow_ok(r, r.provenance.mission_id):
            failures.append({'worker_id': wid, 'reason': 'browser_not_verified_by_page_load'})
    for wid, r in results.items():
        if isinstance(r, W.ReviewerResult) and r.recommendation == 'block':
            failures.append({'worker_id': wid, 'reason': 'reviewer_block'})
    seen, unique = set(), []
    for f in failures:
        key = (f['worker_id'], f['reason'])
        if key not in seen:
            seen.add(key); unique.append(f)
    return {'verified': not unique, 'failures': unique, 'required': required}

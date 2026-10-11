"""Deterministic acceptance checks for existing Jarvis mission owners.

No scheduler or terminal writer lives here. Workers' success claims are compared
with separately recorded verifier receipts and the current requested task set.
"""
import copy
import hashlib
import json


def contract_digest(flow):
    value = {'mission_id':flow.mission_id, 'task_id':flow.flow_id, 'revision':flow.revision,
             'objective':flow.objective, 'constraints':flow.constraints,
             'stop_conditions':flow.stop_conditions, 'verification_recipe':flow.verification_recipe}
    return hashlib.sha256(json.dumps(value,sort_keys=True).encode()).hexdigest()


def verification_receipt(flow, proof):
    return {'mission_id':flow.mission_id, 'task_id':flow.flow_id, 'revision':flow.revision,
            'contract_digest':contract_digest(flow), 'producer_profile':'browser.verifier',
            'producer_profile_version':1, 'proof':copy.deepcopy(proof)}


def verify_browser_mission(flows, results, control, receipts, authoritative_flows=None):
    authoritative_flows = authoritative_flows or {}
    expected = {f.flow_id:authoritative_flows.get(f.flow_id,f) for f in flows
                if f.flow_id not in control.get('cancel_flows',())}
    failures = []
    by_id = {}
    for row in results:
        task_id = row.get('flow_id')
        if task_id in by_id:
            failures.append({'task_id':task_id, 'reason':'duplicate_worker_result'})
        by_id[task_id] = row
        if task_id not in {f.flow_id for f in flows}:
            failures.append({'task_id':task_id, 'reason':'unexpected_worker_result'})
    accepted = []
    for task_id, flow in expected.items():
        row = by_id.get(task_id)
        revision = control.get('flow_updates',{}).get(task_id,{}).get('revision',flow.revision)
        receipt = receipts.get((flow.mission_id, task_id, revision))
        if row is None:
            reason = 'required_worker_result_missing'
        elif row.get('verified') is not True:
            reason = row.get('terminal_reason') or 'worker_result_not_verified'
        elif row.get('revision',0) != revision or flow.revision != revision:
            reason = 'stale_worker_result'
        elif not isinstance(receipt,dict):
            reason = 'independent_verifier_receipt_missing'
        elif (receipt.get('mission_id') != flow.mission_id or receipt.get('task_id') != task_id or
              receipt.get('revision') != revision or receipt.get('contract_digest') != contract_digest(flow) or
              receipt.get('producer_profile') != 'browser.verifier' or receipt.get('producer_profile_version') != 1):
            reason = 'verifier_receipt_contract_mismatch'
        else:
            proof = receipt.get('proof')
            if (not isinstance(proof,dict) or proof.get('verified') is not True or
                not isinstance(proof.get('verifier_id'),str) or not proof['verifier_id'] or
                not isinstance(proof.get('evidence'),dict) or not proof['evidence'] or row.get('evidence') != proof):
                reason = 'independent_verifier_proof_invalid'
            else:
                reason = None
                accepted.append({'task_id':task_id, 'revision':revision, 'verifier_id':proof['verifier_id'],
                                 'contract_digest':receipt['contract_digest']})
        if reason is not None:
            failures.append({'task_id':task_id, 'reason':reason})
    return {'verified':bool(expected) and not control.get('cancel') and not failures,
            'required_task_ids':sorted(expected), 'accepted':accepted, 'failures':failures}


def unverified_response(acceptance):
    """A model cannot turn rejected evidence into a user-facing success claim."""
    tasks = sorted({str(row['task_id']) for row in acceptance['failures']})
    if tasks:
        return 'I couldn’t verify the full requested outcome. The results for ' + ', '.join(tasks) + ' still need independent verification.'
    return 'The requested outcome is not verified yet.'

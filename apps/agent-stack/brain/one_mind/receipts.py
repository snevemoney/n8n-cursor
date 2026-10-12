"""Execution receipts. 'Done' needs a receipt that a separate verifier actually ran code/tests
(kind 'run') or loaded a page through the fake browser (kind 'page').

Receipts are minted only by the execution helpers (run_tests wrappers, fake_browser.verify,
test fakes that model a run) into a process-local ledger keyed by mission + worker.
A string that merely looks like a receipt is not one.
"""
import hashlib
import json
import threading

KINDS = ('run', 'page')
_LEDGER = {}
_LOCK = threading.Lock()


def record(kind, mission_id, worker_id, detail):
    if kind not in KINDS:
        raise ValueError('unknown_receipt_kind')
    body = json.dumps([kind, mission_id, worker_id, detail], sort_keys=True, default=str)
    rid = '%s:%s' % (kind, hashlib.sha256(body.encode()).hexdigest()[:20])
    with _LOCK:
        _LEDGER[rid] = {'kind': kind, 'mission_id': mission_id, 'worker_id': worker_id, 'detail': detail}
    return rid


def lookup(rid):
    with _LOCK:
        return _LEDGER.get(rid)


def valid(rid, mission_id, worker_id, kinds=KINDS):
    row = lookup(rid)
    return bool(row and row['kind'] in kinds and row['mission_id'] == mission_id and row['worker_id'] == worker_id)


def any_valid(evidence, mission_id, worker_id, kinds=KINDS):
    return any(valid(e, mission_id, worker_id, kinds) for e in evidence or ())

"""Generic One-Mind MissionController (runs alongside the browser controller).

Lifecycle: GOAL -> GROUND -> PLAN -> GRAPH -> EXECUTE -> OBSERVE -> VERIFY ->
RECOVER -> REPLAN -> COMPLETE. Workers return WorkerResults; only this owner
verifies the mission and writes the single terminal commit, whose id is
sha256(mission_id + verified outcome). Behind JARVIS_ONE_MIND=1.
"""
import json
import os
from dataclasses import dataclass, field, asdict
from pathlib import Path

from .flag import require_enabled
from . import scheduler as S, verification as V, worker_results as W
from .context_builder import ContextBuilder
from .trace import Tracer, ActionRecord, terminal_commit_id

PHASES = ('GOAL', 'GROUND', 'PLAN', 'GRAPH', 'EXECUTE', 'OBSERVE', 'VERIFY', 'RECOVER', 'REPLAN', 'COMPLETE')
MUTATING = ('EDIT', 'WRITE', 'CLICK', 'INPUT', 'SEND', 'DELETE', 'DEPLOY', 'PUBLISH', 'PAY')


@dataclass
class MissionResult:
    mission_id: str
    status: str  # VERIFIED | PARTIAL | NEEDS_APPROVAL | FAILED | CANCELLED
    verified: bool
    terminal_commit_id: str
    accepted: list = field(default_factory=list)
    failures: list = field(default_factory=list)
    paused: list = field(default_factory=list)
    artifacts: dict = field(default_factory=dict)
    duplicate: bool = False

    def to_dict(self):
        return asdict(self)


class MissionController:
    def __init__(self, root, registry, workers, *, deliver=None, context_builder=None, advisor=None):
        require_enabled()
        self.root = Path(root)
        self.registry = registry
        self.workers = workers  # profile_id -> callable(context: dict, node: dict, attempt: int) -> WorkerResult
        self.deliver = deliver  # called exactly once with the committed MissionResult dict
        self.context = context_builder or ContextBuilder()
        self.advisor = advisor  # JevAdvisor (SHADOW); output never read back

    # ---------- terminal commit ----------
    def _terminal_path(self, mission_id):
        return self.root / mission_id / 'terminal.json'

    def commit(self, tracer, outcome):
        path = self._terminal_path(outcome.mission_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        verified_outcome = {'status': outcome.status, 'verified': outcome.verified, 'accepted': sorted(outcome.accepted)}
        outcome.terminal_commit_id = terminal_commit_id(outcome.mission_id, verified_outcome)
        try:
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
        except FileExistsError:
            existing = json.loads(path.read_text(encoding='utf-8'))
            tracer.emit('terminal.duplicate_suppressed', terminal_commit_id=existing['terminal_commit_id'])
            existing['duplicate'] = True
            return existing
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(outcome.to_dict(), stream, sort_keys=True, default=str)
        tracer.emit('terminal.commit', terminal_commit_id=outcome.terminal_commit_id, status=outcome.status,
                    verified=outcome.verified)
        if self.deliver is not None:
            self.deliver(outcome.to_dict())
        return outcome.to_dict()

    # ---------- run ----------
    def run(self, mission, *, control=None, approvals=()):
        """mission: {mission_id, objective, authority: MissionAuthority, nodes: [...], integration: [...]}
        control: list of steering events applied at safe boundaries (between batches):
            {'id', 'after_batch': int, 'node': worker_id, 'changes': {...}} or {'id','after_batch','cancel':True}
        """
        mid = mission['mission_id']
        existing = self._terminal_path(mid)
        tracer = Tracer(self.root / mid, mid)
        if existing.exists():
            row = json.loads(existing.read_text(encoding='utf-8'))
            tracer.emit('terminal.duplicate_suppressed', terminal_commit_id=row['terminal_commit_id'])
            return row | {'duplicate': True}
        authority = mission['authority']
        nodes = [dict(n) for n in mission['nodes']]
        by_id = {n['worker_id']: n for n in nodes}
        tracer.emit('mission.phase', phase='GOAL', objective=mission.get('objective', ''))
        tracer.emit('mission.phase', phase='GROUND', authority=authority.to_dict())
        tracer.emit('mission.phase', phase='PLAN', node_count=len(nodes))
        plan = S.batches(nodes)
        tracer.emit('mission.phase', phase='GRAPH', batches=plan,
                    workers=[{k: n.get(k) for k in ('worker_id', 'profile_id', 'dependencies')} for n in nodes])
        results, paused, used, attempts = {}, set(), {'actions': 0}, {}
        events = sorted(control or [], key=lambda e: e['after_batch'])
        feedback = {}
        status = None
        batch_index = 0
        while batch_index < len(plan):
            for wid in plan[batch_index]:
                if wid in paused or wid in results:
                    continue
                self._execute_node(tracer, mission, authority, by_id[wid], results, paused, used, attempts,
                                   feedback, nodes, approvals)
            # RECOVER: tester FAIL -> repair builder (retry budget), then re-test
            self._recover(tracer, mission, authority, plan[batch_index], by_id, results, paused, used,
                                      attempts, feedback, nodes, approvals)
            # safe boundary: apply steering
            due = [e for e in events if e['after_batch'] == batch_index]
            for event in due:
                events.remove(event)
                tracer.emit('mission.steering', **event)
                if event.get('cancel'):
                    status = 'CANCELLED'
                    break
                affected = S.dependents(nodes, [event['node']])
                by_id[event['node']].update(event.get('changes', {}))
                kept = sorted(w for w in results if w not in affected)
                for w in affected:
                    results.pop(w, None)
                tracer.emit('mission.phase', phase='REPLAN', affected=sorted(affected), kept=kept)
                pending = [n for n in nodes if n['worker_id'] not in results and n['worker_id'] not in paused]
                ids = {n['worker_id'] for n in pending}
                plan = plan[:batch_index + 1] + S.batches(
                    [dict(n, dependencies=[d for d in n.get('dependencies', ()) if d in ids]) for n in pending])
            if status == 'CANCELLED':
                break
            batch_index += 1
        tracer.emit('mission.phase', phase='VERIFY')
        flow_failures, accepted = self._flow_verify(nodes, by_id, results)
        mission_check = V.mission_level([n for n in nodes if n['worker_id'] not in paused], results, flow_failures,
                                        mission.get('integration', ()))
        tracer.emit('mission.verification', verified=mission_check['verified'], failures=mission_check['failures'],
                    accepted=accepted)
        if status != 'CANCELLED':
            if paused:
                status = 'NEEDS_APPROVAL'
            elif mission_check['verified'] and self._independently_executed(nodes, results):
                status = 'VERIFIED'
            elif mission_check['verified']:
                status = 'PARTIAL'
                mission_check['failures'].append({'worker_id': '*', 'reason': 'no_independent_execution'})
            elif accepted:
                status = 'PARTIAL'
            else:
                status = 'FAILED'
        outcome = MissionResult(mid, status, status == 'VERIFIED', '', accepted=sorted(accepted), failures=mission_check['failures'], paused=sorted(paused),
                                artifacts={w: r.to_dict() for w, r in results.items()})
        tracer.emit('mission.phase', phase='COMPLETE', status=status)
        return self.commit(tracer, outcome)

    def _execute_node(self, tracer, mission, authority, node, results, paused, used, attempts, feedback, nodes, approvals):
        profile = self.registry.resolve(node['profile_id'], node.get('profile_version'))
        action = node.get('action', 'READ')
        capability = node.get('capability', profile.capabilities[0])
        verdict = authority.decide(action, capability, tuple(node.get('domains', ())), system=node.get('system'),
                                   used=used)
        if verdict == 'REQUIRE_APPROVAL' and node['worker_id'] in approvals:
            verdict = 'AUTO_EXECUTE'
        action_id = tracer.next_id('action', node['worker_id'])
        if verdict != 'AUTO_EXECUTE':
            tracer.action(ActionRecord(action_id, node['worker_id'], action, capability, True, verdict, False, None,
                                       'authority:' + verdict))
            if verdict == 'REQUIRE_APPROVAL':
                scope = S.dependents(nodes, [node['worker_id']])
                paused |= scope
                tracer.emit('mission.approval_pause', node=node['worker_id'], paused=sorted(scope))
            else:
                prov = W.Provenance(mission['mission_id'], node['task_id'], node['worker_id'], profile.profile_id,
                                    profile.version, trace_id=tracer.trace_id)
                results[node['worker_id']] = W.WorkerResult(tracer.next_id('artifact', node['worker_id']), 'blocked',
                                                            prov, status='BLOCKED', notes='authority_block')
            return
        task = {'test_feedback': feedback.get(node['worker_id'])} if feedback.get(node['worker_id']) else {}
        task.update({k: results[d].to_dict() for d in node.get('dependencies', ()) if d in results
                     for k in ('patch_ref',)})
        state = {'objective': mission.get('objective', ''), 'acceptance': node.get('acceptance', ''),
                 'constraints': mission.get('constraints', ()), **node.get('inputs', {})}
        built = self.context.build(profile, state, task=task)
        built['mission_id'] = mission['mission_id']
        built['emit'] = lambda event, **f: tracer.emit(event, worker_id=node['worker_id'], **f)
        if self.advisor is not None and built['missing']:
            self.advisor.ask(tracer, 'context_sufficiency', {'worker_id': node['worker_id'], 'missing': built['missing']})
        attempt = attempts.get(node['worker_id'], 0)
        attempts[node['worker_id']] = attempt + 1
        used['actions'] += 1
        try:
            result = self.workers[profile.profile_id](built, node, attempt)
            errors = V.worker_level(result)
        except Exception as exc:  # worker failure is an observation, never a mission verdict
            result, errors = None, ['worker_exception:' + type(exc).__name__]
        if result is None or errors:
            prov = W.Provenance(mission['mission_id'], node['task_id'], node['worker_id'], profile.profile_id,
                                profile.version, trace_id=tracer.trace_id)
            result = W.WorkerResult(tracer.next_id('artifact', node['worker_id']), 'error', prov, status='FAILED',
                                    notes=';'.join(errors)[:300])
        executed = True
        tracer.action(ActionRecord(action_id, node['worker_id'], action, capability, True, 'AUTO_EXECUTE', executed,
                                   None, 'profile:%s@%d attempt:%d' % (profile.profile_id, profile.version, attempt)))
        tracer.emit('mission.phase', phase='OBSERVE', worker_id=node['worker_id'], result_kind=result.kind,
                    result_status=result.status, artifact_id=result.artifact_id,
                    verdict=getattr(result, 'verdict', None))
        results[node['worker_id']] = result

    def _recover(self, tracer, mission, authority, batch, by_id, results, paused, used, attempts, feedback, nodes, approvals):
        for wid in batch:
            r = results.get(wid)
            if not (isinstance(r, W.TesterResult) and r.verdict == 'FAIL'):
                continue
            node = by_id[wid]
            targets = [d for d in node.get('dependencies', ()) if by_id[d].get('action') in MUTATING]
            for target in targets:
                profile = self.registry.resolve(by_id[target]['profile_id'])
                budget = dict(getattr(profile, 'budgets', ()) or ()).get('retries', 1)
                if attempts.get(target, 0) > budget:
                    tracer.emit('mission.phase', phase='RECOVER', worker_id=target, outcome='retry_budget_exhausted')
                    continue
                tracer.emit('mission.phase', phase='RECOVER', worker_id=target, reason=r.observed[:200])
                if self.advisor is not None:
                    self.advisor.ask(tracer, 'failure_classify', {'observed': r.observed, 'condition': r.condition})
                feedback[target] = {'condition': r.condition, 'expected': r.expected, 'observed': r.observed}
                results.pop(target, None); results.pop(wid, None)
                self._execute_node(tracer, mission, authority, by_id[target], results, paused, used, attempts,
                                   feedback, nodes, approvals)
                self._execute_node(tracer, mission, authority, node, results, paused, used, attempts, feedback,
                                   nodes, approvals)
                return self._recover(tracer, mission, authority, batch, by_id, results, paused, used, attempts,
                                     feedback, nodes, approvals)
        return True

    def _independently_executed(self, nodes, results):
        """Done gate (F3): some verifier-profile worker, separate from every builder, holds a run/page receipt."""
        builders = {n['worker_id'] for n in nodes if n.get('action', 'READ') in MUTATING}
        for n in nodes:
            r = results.get(n['worker_id'])
            if n['worker_id'] in builders or not V.is_verifier(self.registry.resolve(n['profile_id'])):
                continue
            if isinstance(r, W.TesterResult) and r.verdict == 'PASS' and \
                    V.receipts.any_valid(r.evidence, r.provenance.mission_id, n['worker_id']):
                return True
        return any(isinstance(r, W.BrowserFlowResult) and V.browser_flow_ok(r, r.provenance.mission_id) for r in results.values())

    def _flow_verify(self, nodes, by_id, results):
        failures, accepted = [], []
        for node in nodes:
            wid = node['worker_id']
            r = results.get(wid)
            if r is None or r.status != 'COMPLETED':
                continue
            profile = self.registry.resolve(node['profile_id'])
            if isinstance(r, W.BrowserFlowResult) and not V.browser_flow_ok(r, r.provenance.mission_id):
                failures.append({'worker_id': wid, 'reason': 'browser_not_verified_by_page_load'})
                continue
            if V.is_verifier(profile):
                if isinstance(r, W.TesterResult) and r.verdict == 'PASS' and V.receipts.any_valid(r.evidence, r.provenance.mission_id, wid):
                    accepted.append(wid)
                elif isinstance(r, W.TesterResult) and r.verdict == 'PASS':
                    failures.append({'worker_id': wid, 'reason': 'no_execution_receipt'})
                continue
            if node.get('action', 'READ') not in MUTATING:
                accepted.append(wid)
                continue
            verifiers = [n for n in nodes if wid in n.get('dependencies', ())
                         and V.is_verifier(self.registry.resolve(n['profile_id']))]
            reason = 'no_independent_verifier'
            for vn in verifiers:
                reason = V.flow_level(node, r, vn, results.get(vn['worker_id']), self.registry.resolve(vn['profile_id']))
                if reason is None:
                    break
            if reason is None:
                accepted.append(wid)
            else:
                failures.append({'worker_id': wid, 'reason': reason})
        return failures, accepted

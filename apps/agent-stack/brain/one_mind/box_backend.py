"""Real box-agent coding backend behind the ModelRouter (Backend contract).

profile software.builder + tool 'box.shell' -> EvidenceRouter selects this backend from a
BackendRegistry -> run(request) copies the repo slice into a throwaway Sandbox, drives
BoxCodingAgent (edit -> real test run -> repeat, iteration/time budget) and returns the
patch plus an independent verifier run. Model calls go through RoutedModelClient, so the
model alias is chosen per call from configuration (JARVIS_ONE_MIND_ALIASES, key
'frontier.chat'; defaults are placeholders) with evidence and fallback, all charged to the
mission budget (hard max $0.50). Never the Mac, never the source tree.

CI: inject a FakeLLM-backed client. A paid LiteLLM client is only built by from_env() when
allow_paid=True AND a key is present in the environment; the registry refuses a paid backend
unless allow_paid. Nothing here prints or stores the key.
"""
from .backends import Backend
from .coding_worker import BoxCodingAgent, run_tests
from .flag import require_enabled
from .llm import live_available, LiteLLMClient
from .model_routing import RoutedModelClient, mission_meter
from .registry import REGISTRY
from .sandbox import Sandbox

MODEL_TOOL = 'frontier.chat'


class BoxCodingBackend(Backend):
    backend_id = 'box.coding'
    runtime = 'box'
    tool = 'box.shell'

    def __init__(self, client, *, profile_id='software.builder', router=None, table=None,
                 max_iterations=4, max_seconds=600):
        self.profile = REGISTRY.resolve(profile_id)
        self.client = client
        self.paid = bool(getattr(client, 'paid', False))
        self.routed = RoutedModelClient(self.profile, MODEL_TOOL, client, router=router, table=table)
        self.max_iterations, self.max_seconds = max_iterations, max_seconds
        self.model_id = 'routed:' + MODEL_TOOL

    @classmethod
    def from_env(cls, authority, *, allow_paid=False, **kw):
        """Live client only when explicitly allowed and a key exists; otherwise refuse (callers use fakes)."""
        if not (allow_paid and live_available()):
            raise RuntimeError('live_coding_backend_unavailable')
        return cls(LiteLLMClient(mission_meter(authority)), **kw)

    def run(self, request):
        require_enabled()
        files, test_cmd = tuple(request['files']), list(request['test_cmd'])
        agent = BoxCodingAgent(self.routed, model='auto', files=files, test_cmd=test_cmd,
                               max_iterations=self.max_iterations, max_seconds=self.max_seconds)
        sb = Sandbox(request['source'])
        try:
            out = agent.run(sb, request.get('objective', ''), request.get('test_feedback'))
            patch = sb.diff(files)
            check = run_tests(sb.root, test_cmd)  # independent re-run, not the builder's own result
            passed = bool(out['status'] == 'COMPLETED' and patch and check['passed'])
            self.routed.record_outcome(passed)
            return {'status': 'COMPLETED' if passed else 'FAILED', 'patch': patch, 'iterations': out['iterations'],
                    'reason': out.get('reason', ''), 'verify': {k: check[k] for k in ('passed', 'exit_code', 'seconds')},
                    'routes': list(self.routed.routes), 'spent_usd': round(getattr(self.client.meter, 'spent', 0.0), 6)}
        finally:
            sb.cleanup()

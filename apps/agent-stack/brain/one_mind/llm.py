"""Model clients for One-Mind workers. LiteLLM proxy (OpenAI-compatible) or a deterministic fake.

Key comes from env (JARVIS_LITELLM_KEY, else LITELLM_KEY_JARVIS); it is never logged,
printed, traced or put in repr. Every call is metered against a hard USD cap; a call
is refused before it is sent once the cap is reached.
"""
import json
import os
import urllib.request

DEFAULT_BASE = 'https://llm.evenslouis.ca/v1'
KEY_ENVS = ('JARVIS_LITELLM_KEY', 'LITELLM_KEY_JARVIS')
# Conservative fallback price when the proxy does not report cost ($ per 1k tokens, in/out).
FALLBACK_PRICE = (0.003, 0.015)


class BudgetExceeded(RuntimeError):
    pass


class CostMeter:
    def __init__(self, cap_usd):
        if cap_usd < 0:
            raise ValueError('negative_cap')
        self.cap = float(cap_usd)
        self.spent = 0.0
        self.calls = []

    def check(self, estimate=0.0):
        if self.spent + estimate > self.cap + 1e-12:
            raise BudgetExceeded('model_budget_exhausted spent=%.4f cap=%.2f' % (self.spent, self.cap))

    def add(self, row):
        self.spent += float(row.get('cost_usd') or 0.0)
        self.calls.append(row)


def key_from_env():
    for name in KEY_ENVS:
        value = os.environ.get(name, '').strip()
        if value:
            return value
    return ''


def live_available():
    return bool(key_from_env())


class LiteLLMClient:
    paid = True

    def __init__(self, meter, *, base_url=None, timeout=120, on_call=None):
        self.base_url = (base_url or os.environ.get('JARVIS_LITELLM_BASE_URL') or DEFAULT_BASE).rstrip('/')
        self.meter = meter
        self.timeout = timeout
        self.on_call = on_call

    def __repr__(self):
        return 'LiteLLMClient(base_url=%r, key=<env>)' % self.base_url

    def chat(self, model, messages, *, max_tokens=1500, estimate_usd=0.05):
        self.meter.check(estimate_usd)
        key = key_from_env()
        if not key:
            raise RuntimeError('litellm_key_missing')
        body = json.dumps({'model': model, 'messages': messages, 'max_tokens': max_tokens, 'temperature': 0}).encode()
        req = urllib.request.Request(self.base_url + '/chat/completions', data=body, method='POST',
                                     headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key})
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            header_cost = resp.headers.get('x-litellm-response-cost')
            data = json.loads(resp.read().decode())
        usage = data.get('usage') or {}
        pin, pout = usage.get('prompt_tokens', 0), usage.get('completion_tokens', 0)
        cost = float(header_cost) if header_cost not in (None, '') else pin / 1000 * FALLBACK_PRICE[0] + pout / 1000 * FALLBACK_PRICE[1]
        row = {'model': model, 'served_model': data.get('model'), 'prompt_tokens': pin, 'completion_tokens': pout,
               'cost_usd': round(cost, 6), 'cost_source': 'proxy' if header_cost else 'fallback_price'}
        self.meter.add(row)
        if self.on_call:
            self.on_call(row)
        return data['choices'][0]['message']['content'] or ''


class FakeLLM:
    """Scripted replies (str or callable(messages)->str); fixed fake cost per call."""
    paid = False

    def __init__(self, replies, meter=None, cost_per_call=0.0, on_call=None):
        self.replies = list(replies)
        self.meter = meter or CostMeter(1.0)
        self.cost = cost_per_call
        self.on_call = on_call
        self.prompts = []

    def chat(self, model, messages, *, max_tokens=1500, estimate_usd=0.0):
        self.meter.check(self.cost)
        self.prompts.append(messages)
        if not self.replies:
            raise RuntimeError('fake_llm_exhausted')
        reply = self.replies.pop(0)
        text = reply(messages) if callable(reply) else reply
        row = {'model': model, 'served_model': 'fake', 'prompt_tokens': 0, 'completion_tokens': 0,
               'cost_usd': self.cost, 'cost_source': 'fake'}
        self.meter.add(row)
        if self.on_call:
            self.on_call(row)
        return text

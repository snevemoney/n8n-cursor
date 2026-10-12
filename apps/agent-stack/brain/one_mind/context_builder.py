"""ContextBuilder: each worker gets only the keys its profile's context_policy allows.

Deterministic. Unknown/extra mission state never leaks into a worker request.
Jarvis voice context reuses memory/store.py's existing #599/#606 blocks via the
caller; this module never reads files and never touches JARVIS_SHARED_CONTEXT.
"""
import json

DEFAULT_CHAR_CAP = 6000
SECRET_HINTS = ('api_key', 'apikey', 'secret', 'password', 'token', 'credential_value', 'private_key')


def _redact(value):
    if isinstance(value, dict):
        return {k: ('[redacted]' if any(h in k.lower() for h in SECRET_HINTS) else _redact(v)) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_redact(v) for v in value]
    return value


class ContextBuilder:
    def __init__(self, char_cap=DEFAULT_CHAR_CAP):
        self.char_cap = char_cap

    def build(self, profile, mission_state, *, task=None):
        allowed = tuple(profile.context_policy)
        sources = dict(mission_state)
        if task:
            sources.update(task)
        context = {key: _redact(sources[key]) for key in allowed if key in sources}
        missing = [key for key in allowed if key not in sources]
        body = json.dumps(context, sort_keys=True, default=str)
        truncated = []
        while len(body) > self.char_cap and context:
            key = max(context, key=lambda k: len(json.dumps(context[k], default=str)))
            text = json.dumps(context[key], default=str)
            context[key] = text[: max(0, len(text) - (len(body) - self.char_cap) - 20)] + '…'
            truncated.append(key)
            body = json.dumps(context, sort_keys=True, default=str)
            if len(truncated) > 2 * len(allowed):
                break
        return {'profile_id': profile.profile_id, 'profile_version': profile.version, 'context': context,
                'missing': missing, 'truncated': sorted(set(truncated))}

    @staticmethod
    def sufficient(built):
        """Deterministic sufficiency floor; Jev may add advisory judgment on top (B4)."""
        return not built['missing']

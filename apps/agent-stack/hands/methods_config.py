"""Config-side Z-methods (Z99, Z100, Z106-Z112, Z116). Pure functions, no network, no hardware.

Builder candidates only: each core is unit-proven offline; GUI, devices, vendors and
approvals are named blockers in the ledger. Nothing here sends, pushes or spends.
"""
from __future__ import annotations

import json
import os
import re
import stat
import tempfile
from pathlib import Path

try:
    from . import project_methods as pm
except ImportError:  # loaded by path in tests
    import project_methods as pm

ENV_NAME = re.compile(r"[A-Z][A-Z0-9_]{1,63}\Z")
ASSIGN = re.compile(r"(?<![A-Za-z0-9])([A-Za-z][A-Za-z0-9_-]*)\s*[:=]\s*[\"']?([A-Za-z0-9_./+-]{12,})")
TOKEN = re.compile(r"\b(?:sk-|xai-|ghp_|gho_|github_pat_|xox[abp]-)[A-Za-z0-9_-]{16,}|\bAKIA[0-9A-Z]{16}\b|\bAIza[A-Za-z0-9_-]{20,}|\bya29\.[A-Za-z0-9_-]{20,}")


# ---- Z99: secrets go to .env.local, never into chat -------------------------------
def find_secret(text):
    """Return (name_hint, value) for the first secret-looking value, or None."""
    t = TOKEN.search(text)
    if t:
        return None, t.group(0)
    if pm.SECRET.search(text):
        for m in ASSIGN.finditer(text):
            if re.search(r"key|token|secret|password", m.group(1), re.I):
                return m.group(1), m.group(2)
    return None


def in_repo(path: Path):
    return any((p / ".git").exists() for p in (path, *path.parents))


def route_secret(text, env_file, name=None):
    """Move a pasted secret to a 0600 .env.local outside any git repo; reply never echoes it."""
    found = find_secret(text)
    if not found:
        return {"ok": True, "stored": False, "spoken": "No secret found in that message.", "redacted": text}
    hint, value = found
    env_file = Path(env_file).absolute()
    var = (name or re.sub(r"[^A-Za-z0-9]+", "_", hint or "JARVIS_SECRET").upper()).strip("_")
    redacted = text.replace(value, "[REDACTED]")
    if env_file.name != ".env.local" or in_repo(env_file.parent) or env_file.is_symlink():
        return {"ok": False, "stored": False, "redacted": redacted,
                "spoken": "I did not store it: the secret file must be a .env.local outside any git repository. Please rotate that key, since it was typed into chat."}
    if not ENV_NAME.fullmatch(var):
        return {"ok": False, "stored": False, "redacted": redacted, "spoken": "I need a valid variable name for that key."}
    env_file.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    lines = [l for l in (env_file.read_text().splitlines() if env_file.exists() else []) if not l.startswith(var + "=")]
    # A unique, exclusively created sibling cannot follow a pre-planted temp symlink.
    fd, temp_name = tempfile.mkstemp(prefix=".env.local.", suffix=".tmp", dir=env_file.parent)
    tmp = Path(temp_name)
    try:
        with os.fdopen(fd, "w") as f:
            os.fchmod(f.fileno(), stat.S_IRUSR | stat.S_IWUSR)
            f.write("\n".join(lines + [f"{var}={value}"]) + "\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, env_file)
    finally:
        if tmp.exists():
            tmp.unlink()
    return {"ok": True, "stored": True, "var": var, "redacted": redacted,
            "spoken": f"Saved as {var} in your .env.local, not in chat. Treat the pasted copy as exposed and rotate it."}


# ---- Z100: provider-supplied per-agent setup prompt --------------------------------
BAD_PROMPT = re.compile(r"(?:paste|send|post|share|include|type)\b[^.\n]{0,40}\b(?:key|token|secret)\b[^.\n]{0,40}\b(?:chat|here|message|reply|url|http)|curl\b[^\n]*\|\s*(?:ba)?sh|ignore (?:all |previous )?instructions", re.I)


def setup_prompt(agent, provider, env_var):
    """Prompt the key page hands to one agent: names the variable, forbids chat paste."""
    agent, provider = pm.slug(agent), pm.slug(provider)
    if not ENV_NAME.fullmatch(env_var):
        raise ValueError("Use an upper-case environment variable name")
    return (f"Set up {provider} for the agent '{agent}'. Read the key from the environment variable {env_var}. "
            f"Tell the owner to put {env_var}=<key> in .env.local outside the repository. "
            "Never ask for the key in chat and never print it.")


def vet_setup_prompt(text):
    """Reject a pasted vendor prompt that holds a secret or tells the agent to leak/run remote code."""
    return {"ok": not (find_secret(text) or BAD_PROMPT.search(text)),
            "env_vars": sorted(set(re.findall(r"\b[A-Z][A-Z0-9]*_[A-Z0-9_]{2,}\b", text)))}


# ---- Z106: first-run wizard (API key presence + OS + mic/speaker) -------------------
OSES = ("macos", "linux", "windows")
STEPS = ("api_key", "os", "mic", "speaker")


def wizard_next(state, answer=None, *, environ=None, devices=None):
    """Immutable step machine. api_key answer = env var NAME (value is never stored)."""
    state, devices = dict(state or {}), devices or {}
    environ = os.environ if environ is None else environ
    step = next((s for s in STEPS if s not in state), None)
    if step is None:
        return {"state": state, "done": True, "prompt": "Setup complete."}
    if answer is not None:
        if step == "api_key":
            if not ENV_NAME.fullmatch(answer) or not environ.get(answer):
                raise ValueError("That environment variable is not set; put it in .env.local first")
            value = answer
        elif step == "os":
            if answer.lower() not in OSES:
                raise ValueError("Pick macos, linux or windows")
            value = answer.lower()
        else:
            if answer not in devices.get(step, ()):
                raise ValueError(f"Pick one of the listed {step} devices")
            value = answer
        state = {**state, step: value}
        step = next((s for s in STEPS if s not in state), None)
    return {"state": state, "done": step is None, "prompt": "Setup complete." if step is None else f"Next: choose {step}."}


# ---- Z107: optional action modules --------------------------------------------------
class Registry:
    """Core always answers; optional modules can be removed or fail without breaking it."""

    def __init__(self, core, modules=None):
        self.core, self.modules = core, dict(modules or {})

    def without(self, name):
        return Registry(self.core, {k: v for k, v in self.modules.items() if k != name})

    def handle(self, text):
        for name, mod in self.modules.items():
            try:
                got = mod(text)
            except Exception:  # noqa: BLE001 - a broken module must not take the core down
                continue
            if got is not None:
                return {"by": name, "reply": got}
        return {"by": "core", "reply": self.core(text)}


# ---- Z109: per-stage provider swap with a local privacy path ------------------------
STAGES = {"stt": "whisper", "llm": "ollama", "tts": "piper"}


def providers(cfg):
    """cfg maps stage -> provider name; 'local' picks the open local engine for that stage."""
    out = {}
    for stage, local in STAGES.items():
        choice = str(cfg.get(stage, "")).strip().lower()
        if not choice:
            raise ValueError(f"Choose a {stage} provider")
        out[stage] = local if choice == "local" else choice
    local_all = all(out[s] == STAGES[s] for s in STAGES)
    return {"providers": out, "private": local_all, "slower": any(out[s] == STAGES[s] for s in STAGES),
            "note": "All three stages run on this machine." if local_all else "At least one stage leaves this machine."}


# ---- Z110: plugin catalog ------------------------------------------------------------
CATALOG = {"remote_control": {"summary": "Control Jarvis while away", "needs_approval": True, "enabled": False},
           "calendar": {"summary": "Read calendar", "needs_approval": False, "enabled": False},
           "notes": {"summary": "Read and write project notes", "needs_approval": False, "enabled": False}}


def enable_plugin(name, *, approved=False, catalog=CATALOG):
    if name not in catalog:
        raise ValueError("Unknown plugin")
    if catalog[name]["needs_approval"] and not approved:
        raise PermissionError("This plugin needs Evens's explicit approval")
    return {**catalog, name: {**catalog[name], "enabled": True}}


# ---- Z111: cache-friendly agent loop --------------------------------------------------
VOLATILE = re.compile(r"\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}|\b(?:uuid|request[_-]?id|nonce)\b|\b\d{10,13}\b", re.I)


def build_request(system, tools, turns):
    """Stable prefix = system + canonical tools; turns are append-only after it."""
    prefix = [{"role": "system", "content": system}, {"role": "tools", "content": json.dumps(tools, sort_keys=True)}]
    if VOLATILE.search(system) or VOLATILE.search(prefix[1]["content"]):
        raise ValueError("Volatile text in the cached prefix breaks prefix caching")
    return prefix + list(turns)


def shared_prefix(a, b):
    n = 0
    for x, y in zip(a, b):
        if x != y:
            break
        n += 1
    return n


def cache_report(requests):
    """For consecutive requests: how many leading messages repeated (cache-hit candidates)."""
    rows = [{"call": i, "shared": shared_prefix(requests[i - 1], r), "total": len(r),
             "append_only": r[:len(requests[i - 1])] == requests[i - 1]} for i, r in enumerate(requests) if i]
    return {"rows": rows, "ok": all(r["append_only"] for r in rows)}


# ---- Z112: route routine calls to a cheap OpenAI-compatible endpoint -------------------
def route_call(kind, cfg):
    """cfg: {'routine': {'base_url','model','key_env'}, 'frontier': {...}, 'routine_kinds': [...]}.
    Returns request settings only; no model names or prices are invented here."""
    tier = "routine" if kind in cfg.get("routine_kinds", ()) else "frontier"
    t = cfg.get(tier) or {}
    url = str(t.get("base_url", ""))
    if not re.match(r"https://|http://(?:127\.0\.0\.1|localhost)[:/]", url) or not t.get("model") or not ENV_NAME.fullmatch(str(t.get("key_env", ""))):
        raise ValueError(f"The {tier} route needs a https or local base_url, a model and a key env var name")
    return {"tier": tier, **{k: t[k] for k in ("base_url", "model", "key_env")}}


# ---- Z116: dev chores end as a draft PR with tests -------------------------------------
TESTFILE = re.compile(r"(?:^|/)(?:test_[^/]+\.py|[^/]+_test\.py|[^/]+\.test\.[jt]sx?|tests?/)")


def chore_pr(title, files, test_result, base="main"):
    """Plan only: refuses a chore without a changed test file and a passing result. Never pushes."""
    title = pm.clean_text(title)
    if not any(TESTFILE.search(f) for f in files):
        raise ValueError("A chore needs a test file in the change")
    if not re.search(r"\b\d+ passed\b", test_result) or re.search(r"\b[1-9]\d* (?:failed|error)", test_result):
        raise ValueError("A chore PR needs a passing test run")
    return {"branch": "claude/" + pm.slug(title)[:40], "base": base, "draft": True, "pushed": False,
            "body": f"## {title}\n\nFiles:\n" + "\n".join(f"- {f}" for f in sorted(files)) + f"\n\nTests: {test_result.strip()}\n"}

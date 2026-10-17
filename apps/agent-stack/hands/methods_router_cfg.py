"""Handlers for config/prompt/voice-setting cores: Z100 Z104 Z105 Z106 Z109 Z110 Z112 Z116 X07 X08 X09.
Each handler returns the spoken string. Nothing here generates media, spends, pushes or touches hardware."""
from __future__ import annotations

import json
import os
from decimal import InvalidOperation

import methods_config as mc
import methods_prompts as mp
import methods_voice as mv
from methods_router_common import methods_root, pairs, rx


def z100(m):
    p = mc.setup_prompt(m["agent"], m["prov"], m["env"])
    return p + " Prompt text only: no key was handled."


def z104(m):
    got = mp.character(pairs(m["kv"]))
    return f"{got['prompt']} Fingerprint {got['fingerprint']}. Prompt only, nothing generated."


def z105(m):
    return mp.minimal_edit(m["ref"], m["chg"]) + " Prompt only, nothing generated."


def z106(m):
    path = methods_root() / "wizard.json"
    state = json.loads(path.read_text()) if path.is_file() else {}
    step, ans = (m["step"] or "").lower(), m["ans"]
    if step in ("mic", "speaker"):
        return "I cannot list audio devices from here, so the mic and speaker steps are not wired."
    if step:
        expected = next((s for s in mc.STEPS if s not in state), None)
        if step != expected:
            return f"That is not the next step. {mc.wizard_next(state)['prompt']}"
        state = mc.wizard_next(state, ans)["state"]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(state))
    nxt = mc.wizard_next(state)
    return f"Set so far: {', '.join(state) or 'nothing'}. {nxt['prompt']}"


def z109(m):
    cfg = {k: v for k, v in pairs(m["kv"].replace(" ", ",")).items()}
    got = mc.providers(cfg)
    return f"{got['note']} {'Local engines are slower.' if got['slower'] else ''} Check only: the live voice pipeline is unchanged."


def z110_list(_m):
    return "Plugins: " + "; ".join(f"{k} ({'needs Evens approval' if v['needs_approval'] else 'no approval'}, off)"
                                   for k, v in mc.CATALOG.items()) + ". Nothing is enabled."


def z110_enable(m):
    try:
        mc.enable_plugin(m["name"].lower())
    except PermissionError as e:
        return f"Not enabled. {e}."
    return "Policy allows it, but no plugin loader is wired, so nothing was enabled."


def z112(m):
    cfg_path = os.environ.get("JARVIS_ROUTE_CFG")
    if not cfg_path or not os.path.isfile(cfg_path):
        return "No route config is set (JARVIS_ROUTE_CFG), so I cannot say where that call would go."
    got = mc.route_call(m["kind"].lower(), json.load(open(cfg_path)))
    return f"That call goes to the {got['tier']} route at {got['base_url']}, model {got['model']}. Savings are unverified."


def z116(m):
    files = [f for f in m["files"].replace(",", " ").split() if f]
    got = mc.chore_pr(m["title"], files, m["tests"])
    return f"Draft PR planned on branch {got['branch']}. Not pushed; pushing needs Evens."


def x07(_m):
    return "Planned voice setting: " + " ".join(mv.edge_tts_args()) + ". Not applied to the live voice."


def x08_short(m):
    return mp.shorten(m["t"])


def x08_ceiling(m):
    try:
        got = mp.ceiling_gate(m["spent"], m["next"], m["ceiling"])
    except (InvalidOperation, ValueError) as e:
        return f"{e}."
    return ("Allowed" if got["allowed"] else "Blocked: over the ceiling") + f". Remaining {got['remaining']}."


def x09(m):
    issues = mp.persona_lint(m["t"])
    return "Persona lint: " + ("; ".join(issues) if issues else "clean") + "."


HANDLERS = [
    ("Z100", rx(r"key setup prompt for (?P<agent>[\w-]+) on (?P<prov>[\w-]+) using (?P<env>[A-Za-z][A-Za-z0-9_]{1,63})"), z100),
    ("Z104", rx(r"character sheet[:,]? (?P<kv>\w+ ?\w*=.+)"), z104),
    ("Z105", rx(r"minimal edit of (?P<ref>[^:]+?): (?P<chg>.+)"), z105),
    ("Z106", rx(r"setup wizard(?: (?P<step>api_key|os|mic|speaker) (?P<ans>\S+))?"), z106),
    ("Z109", rx(r"provider check (?P<kv>(?:(?:stt|llm|tts)=\w+[ ,]*)+)"), z109),
    ("Z110", rx(r"plugin catalog"), z110_list),
    ("Z110", rx(r"enable plugin (?P<name>[\w-]+)"), z110_enable),
    ("Z112", rx(r"cheap route for (?P<kind>[\w-]+)"), z112),
    ("Z116", rx(r"chore pr plan (?P<title>.+?) files (?P<files>.+?) tests (?P<tests>.+)"), z116),
    ("X07", rx(r"voice settings"), x07),
    ("X08", rx(r"shorten: (?P<t>.+)"), x08_short),
    ("X08", rx(r"ceiling check spent (?P<spent>\S+) next (?P<next>\S+) ceiling (?P<ceiling>\S+)"), x08_ceiling),
    ("X09", rx(r"persona lint: (?P<t>.+)"), x09),
]

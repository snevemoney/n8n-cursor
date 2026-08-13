#!/usr/bin/env python3
"""Patch running Scorpion container G1 golden-path check (hotfix until redeploy)."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

CONTAINER = "evenslouis_paths-scorpion-1"
CHUNK = "/app/apps/scorpion/.next/server/chunks/7309.js"

OLD_FN = (
    'function hasRecentNotifySmoke(e=24){let t=Date.now()-36e5*e;return loadAll().filter'
    '(e=>("notify.smoke"===e.jobType||"audit.smoke"===e.jobType)&&"done"===e.status'
    "&&Date.parse(e.updatedAt)>=t).sort((e,t)=>t.updatedAt.localeCompare(e.updatedAt))[0]}"
)
NEW_FN = (
    OLD_FN
    + 'function hasRecentTelegramReport(e=24){let t=Date.now()-36e5*e;return loadAll().filter'
    '(e=>"report.notify"===e.jobType&&"done"===e.status&&"telegram"===e.source'
    "&&Date.parse(e.updatedAt)>=t).sort((e,t)=>t.updatedAt.localeCompare(e.updatedAt))[0]}"
)

OLD_RETURN = (
    'return[{path:"G1",name:"Telegram → agent tool reply",pass:!1,'
    'detail:"Operator verify: send Telegram instruction, confirm tool-backed reply on VPS",'
    "checkedAt:e},r,i]}}"
)
NEW_RETURN = (
    "let n=await fetchStatus(`${l}/claw/`),p=hasRecentTelegramReport(24),c=n.ok&&!!p,"
    'g={path:"G1",name:"Telegram → agent tool reply",pass:c,'
    'detail:p?`Recent report.notify mission ${p.correlationId} (${p.updatedAt})`:'
    'n.ok?"OpenClaw reachable; no Telegram hive report in 24h — ask Big Boss in #general":'
    '`OpenClaw unreachable: ${n.detail}`,checkedAt:e};return[g,r,i]}}'
)


def main() -> None:
    js = subprocess.check_output(["docker", "exec", CONTAINER, "cat", CHUNK], text=True)
    if OLD_FN not in js:
        sys.exit("hasRecentNotifySmoke block not found")
    if OLD_RETURN not in js:
        sys.exit("G1 return block not found")
    patched = js.replace(OLD_FN, NEW_FN).replace(OLD_RETURN, NEW_RETURN)
    tmp = Path("/tmp/7309.patched.js")
    tmp.write_text(patched)
    subprocess.check_call(["docker", "cp", str(tmp), f"{CONTAINER}:{CHUNK}"])
    print("patched scorpion G1 check")


if __name__ == "__main__":
    main()

#!/bin/bash
# Local macOS `say` → public/voice/{episode}/{cut}/{scene}.wav + cues.json
# Default voice: Reed (English (US)). Override: VOICE=Samantha
# No paid TTS. If say fails, stop.
set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-}"
if [[ ! "${DATE}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  DATE="$(basename "$(ls src/data/episodes/*.ts | sort | tail -1)" .ts)"
fi

if ! command -v say >/dev/null 2>&1; then
  echo "say not found. Local macOS TTS is required. Do not fall back to a paid API." >&2
  exit 1
fi

DEFAULT_VOICE="Reed (English (US))"
FALLBACK_VOICE="Samantha"
VOICE="${VOICE:-$DEFAULT_VOICE}"

voice_installed() {
  say -v '?' | grep -F -q "$1"
}

if ! voice_installed "$VOICE"; then
  echo "Voice '$VOICE' is not in say -v '?'; falling back to $FALLBACK_VOICE." >&2
  VOICE="$FALLBACK_VOICE"
fi
if ! voice_installed "$VOICE"; then
  echo "No usable local say voice (tried '$VOICE'). Do not fall back to a paid API." >&2
  exit 1
fi
export VOICE

TMP="$(mktemp)"
trap 'rm -f "${TMP}"' EXIT

npx tsx src/voice/printCues.ts "${DATE}" > "${TMP}"

python3 - "${TMP}" <<'PY'
import json
import re
import subprocess
import sys
from pathlib import Path

payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
voice = payload["voice"]
rate = str(payload["sayRateWpm"])
episode_id = payload["episodeId"]


def wav_seconds(path: Path):
    try:
        out = subprocess.check_output(["afinfo", str(path)], text=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    m = re.search(r"estimated duration:\s+([0-9.]+)", out)
    return float(m.group(1)) if m else None


def speak(txt: Path, wav: Path, wpm: str) -> None:
    cmd = [
        "say",
        "-v",
        voice,
        "-r",
        wpm,
        "-o",
        str(wav),
        "--file-format",
        "WAVE",
        "--data-format",
        "LEI16@22050",
        "-f",
        str(txt),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stdout, file=sys.stderr)
        print(proc.stderr, file=sys.stderr)
        print("say failed. Do not fall back to a paid API.", file=sys.stderr)
        raise SystemExit(1)


def fit_say(lines, txt: Path, wav: Path, scene_sec: float, label: str):
    """Shorten existing lines until the wav fits the scene. Never add facts."""
    current = list(lines)
    wpm = rate
    for _ in range(24):
        txt.write_text(" ".join(current), encoding="utf-8")
        speak(txt, wav, wpm)
        dur = wav_seconds(wav)
        if dur is None or dur <= scene_sec:
            return current
        if wpm == rate:
            wpm = str(min(200, int(rate) + 25))
            print(f"retry {label} at {wpm} wpm (audio {dur:.2f}s > scene {scene_sec:.2f}s)")
            continue
        if len(current) > 1:
            dropped = current.pop()
            print(f"shorten {label}: drop last line ({dropped[:48]}…)")
            wpm = rate
            continue
        words = current[0].split()
        if len(words) <= 3:
            print(f"warn {label}: still {dur:.2f}s > {scene_sec:.2f}s after minimum line", file=sys.stderr)
            return current
        keep = max(3, len(words) - 4)
        current = [" ".join(words[:keep]).rstrip(".,;:") + "."]
        print(f"shorten {label}: trim to {keep} words")
        wpm = rate
    return current


root = Path("public/voice") / episode_id
root.mkdir(parents=True, exist_ok=True)
(root / "VOICE.txt").write_text(
    f"{voice}\nUS English · local macOS say · presenter script · not a branded newsreader · not a clone\nrate {rate} wpm\nVOICE=Samantha restores the old compact voice\n",
    encoding="utf-8",
)

for cut, script in payload["cuts"].items():
    outdir = root / cut
    outdir.mkdir(parents=True, exist_ok=True)
    fps = script["fps"]
    total = script["totalFrames"]
    manifest_cues = []
    for cue in script["cues"]:
        scene = cue["sceneId"]
        safe = re.sub(r"[^A-Za-z0-9._-]", "-", scene)
        wav = outdir / f"{safe}.wav"
        txt = outdir / f"{safe}.txt"
        scene_sec = cue["durationInFrames"] / fps
        spoken = fit_say(cue["lines"], txt, wav, scene_sec, f"{cut}/{safe}")
        end = cue["startFrame"] + cue["durationInFrames"]
        if end > total:
            print(f"cue {cut}/{safe} ends at {end} > composition {total}", file=sys.stderr)
            raise SystemExit(1)
        manifest_cues.append(
            {
                "sceneId": scene,
                "startFrame": cue["startFrame"],
                "durationInFrames": cue["durationInFrames"],
                "file": f"{safe}.wav",
                "lines": spoken,
            }
        )
        print(f"ok {cut}/{safe}.wav  {cue['startFrame']}+{cue['durationInFrames']}")
    last = manifest_cues[-1]
    last_end = last["startFrame"] + last["durationInFrames"]
    (outdir / "cues.json").write_text(
        json.dumps(
            {
                "episodeId": episode_id,
                "cut": cut,
                "voice": voice,
                "fps": fps,
                "totalFrames": total,
                "lastCueEnd": last_end,
                "cues": manifest_cues,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {outdir}/cues.json  {len(manifest_cues)} cues  last end {last_end}/{total}")

print(f"voice {voice}  episode {episode_id}")
PY

echo "regenerate: bash scripts/render-voice.sh ${DATE}"
ls -lh "public/voice/${DATE}/full" "public/voice/${DATE}/morning60" | head -40

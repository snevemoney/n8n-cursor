#!/usr/bin/env bash
# One path: build Jarvis Orb.app (existing face overlay). 127.0.0.1:4018 only.
# Usage: bash apps/agent-stack/face/install-orb-app.sh
#        bash apps/agent-stack/face/install-orb-app.sh open
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${AGENT_STACK_FACE_PORT:-4018}"
DIST="$HERE/dist"
APP="$DIST/Jarvis Orb.app"
MACOS="$APP/Contents/MacOS"
RES="$APP/Contents/Resources"
USER_APP="${HOME}/Applications/Jarvis Orb.app"
MAC_APPS="/Applications/Jarvis Orb.app"

if [[ "${VOICE_OS_BIND:-}" == "0.0.0.0" ]]; then
  echo "refused: 0.0.0.0 bind"
  exit 2
fi

echo "Packaging Jarvis Orb (face stays 127.0.0.1:${PORT})…"

if ! python3 - "http://127.0.0.1:${PORT}/healthz" <<'PY'
import sys, urllib.request
try:
    urllib.request.urlopen(sys.argv[1], timeout=2)
except Exception:
    sys.exit(1)
PY
then
  echo "Face is dark on 127.0.0.1:${PORT}. The app will wait. Start apps/agent-stack/face/start.sh first."
fi

rm -rf "$APP"
mkdir -p "$MACOS" "$RES" "$HERE/bin"
BIN="$HERE/bin/jarvis-widget"
ORB_ARCH="$(/usr/bin/uname -m)"
ORB_MIN_OS="$(/usr/bin/plutil -extract LSMinimumSystemVersion raw -o - "$HERE/Info.plist")"
if [[ ! -x "$BIN" || "$HERE/widget.swift" -nt "$BIN" || "$HERE/Info.plist" -nt "$BIN" || "$HERE/install-orb-app.sh" -nt "$BIN" ]]; then
  echo "Compiling widget.swift…"
  /usr/bin/swiftc -O -target "${ORB_ARCH}-apple-macosx${ORB_MIN_OS}" -framework Cocoa -framework WebKit -o "$BIN" "$HERE/widget.swift"
else
  echo "Using existing $BIN"
fi
/bin/cp "$BIN" "$MACOS/JarvisOrb"
/bin/cp "$HERE/Info.plist" "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"

python3 - "$RES/orb.png" <<'PY'
import struct, zlib, sys
path = sys.argv[1]
w = h = 256
px = bytearray(w * h * 4)
cx = cy = 127.5
for y in range(h):
    for x in range(w):
        dx, dy = x - cx, y - cy
        r = (dx * dx + dy * dy) ** 0.5
        i = (y * w + x) * 4
        if r < 108:
            t = 1 - r / 108
            px[i] = int(20 + t * 50)
            px[i + 1] = int(170 + t * 80)
            px[i + 2] = int(70 + t * 50)
            px[i + 3] = 255
        elif r < 118:
            fade = (118 - r) / 10
            px[i] = 40
            px[i + 1] = 255
            px[i + 2] = 110
            px[i + 3] = int(220 * fade)
def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
raw = b"".join(b"\x00" + bytes(px[y * w * 4 : (y + 1) * w * 4]) for y in range(h))
open(path, "wb").write(
    b"\x89PNG\r\n\x1a\n"
    + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    + chunk(b"IDAT", zlib.compress(raw, 9))
    + chunk(b"IEND", b"")
)
PY

ICONSET="$DIST/AppIcon.iconset"
rm -rf "$ICONSET"
mkdir -p "$ICONSET"
/usr/bin/sips -z 16 16 "$RES/orb.png" --out "$ICONSET/icon_16x16.png" >/dev/null
/usr/bin/sips -z 32 32 "$RES/orb.png" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
/usr/bin/sips -z 32 32 "$RES/orb.png" --out "$ICONSET/icon_32x32.png" >/dev/null
/usr/bin/sips -z 64 64 "$RES/orb.png" --out "$ICONSET/icon_32x32@2x.png" >/dev/null
/usr/bin/sips -z 128 128 "$RES/orb.png" --out "$ICONSET/icon_128x128.png" >/dev/null
/usr/bin/sips -z 256 256 "$RES/orb.png" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
/usr/bin/sips -z 256 256 "$RES/orb.png" --out "$ICONSET/icon_256x256.png" >/dev/null
/usr/bin/sips -z 512 512 "$RES/orb.png" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
/usr/bin/sips -z 512 512 "$RES/orb.png" --out "$ICONSET/icon_512x512.png" >/dev/null
/bin/cp "$ICONSET/icon_512x512.png" "$ICONSET/icon_512x512@2x.png"
if /usr/bin/iconutil -c icns -o "$RES/AppIcon.icns" "$ICONSET" 2>/dev/null; then
  rm -rf "$ICONSET"
else
  echo "iconutil skipped; Finder will use a generic mark."
  rm -rf "$ICONSET"
fi

/usr/bin/xattr -cr "$APP" 2>/dev/null || true
/usr/bin/codesign --force --deep --sign - "$APP" >/dev/null

mkdir -p "${HOME}/Applications"
rm -rf "$USER_APP"
/bin/cp -R "$APP" "$USER_APP"
/usr/bin/xattr -cr "$USER_APP" 2>/dev/null || true
/usr/bin/codesign --force --deep --sign - "$USER_APP" >/dev/null

# Finder / Launchpad list is /Applications. Same bundle, one extra copy.
if [[ -d /Applications && -w /Applications ]]; then
  rm -rf "$MAC_APPS"
  /bin/cp -R "$APP" "$MAC_APPS"
  /usr/bin/xattr -cr "$MAC_APPS" 2>/dev/null || true
  /usr/bin/codesign --force --deep --sign - "$MAC_APPS" >/dev/null
else
  echo "Could not write /Applications. Jarvis Orb stays in ~/Applications only."
fi

LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
if [[ -x "$LSREGISTER" ]]; then
  "$LSREGISTER" -f "$USER_APP" >/dev/null
  if [[ -d "$MAC_APPS" ]]; then
    "$LSREGISTER" -f "$MAC_APPS" >/dev/null
  fi
fi

echo
echo "Built: $APP"
echo "Installed: $USER_APP"
if [[ -d "$MAC_APPS" ]]; then
  echo "Mac apps list: $MAC_APPS"
fi
echo "Open: open \"${MAC_APPS:-$USER_APP}\""
echo "Reopen: Spotlight / Launchpad → Jarvis Orb, or Applications → Jarvis Orb"
echo "Drag the orb (not the three buttons) to another display or corner."
echo "Face stays 127.0.0.1:${PORT}. This app does not bind a port."

if [[ "${1:-}" == "open" ]]; then
  /usr/bin/open "${MAC_APPS:-$USER_APP}"
fi

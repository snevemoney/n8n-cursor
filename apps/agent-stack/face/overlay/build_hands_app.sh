#!/bin/bash
# Builds Jarvis's own input helper (mouse + keyboard for the operator) as an app bundle at ~/Applications/Jarvis Hands.app (override: JARVIS_HANDS_APP=/path).
# A rebuild changes the code signature, and macOS ties the Accessibility switch to it, so:
#   1. nothing is rebuilt (or re-signed) when jarvis_hands.swift and this script are unchanged -> the grant is kept;
#   2. when it must be rebuilt it is signed with a stable identity if one exists (JARVIS_HANDS_SIGN_ID, or a keychain code-signing
#      identity named "Jarvis Hands Local"), else ad hoc with an explicit designated requirement on the bundle identifier, which is
#      what macOS stores for the grant (CANDIDATE: confirm after the first rebuild that the switch survived; if not, re-toggle it).
# Prints REBUILT or UNCHANGED as the first word of the last line, so a caller knows whether Evens must re-toggle Accessibility.
set -e
# Unit tests may compile an explicit scratch bundle, but never replace the
# installed application or invalidate its Accessibility identity by default.
if { [ -n "${PYTEST_CURRENT_TEST:-}" ] || [ "${JARVIS_POINTER_OFF:-}" = "1" ]; } && [ -z "${JARVIS_HANDS_APP:-}" ]; then
  echo "SKIPPED installed click-app build in test mode; set an explicit scratch destination"
  exit 0
fi
HERE="$(cd "$(dirname "$0")" && pwd)"; APP="${JARVIS_HANDS_APP:-$HOME/Applications/Jarvis Hands.app}"; ID=ai.grok.jarvis.hands
SHA="$(cat "$HERE/jarvis_hands.swift" "$0" | shasum -a 256 | cut -d' ' -f1)"
if [ -x "$APP/Contents/MacOS/jarvis_hands" ] && [ "$(cat "$APP/Contents/.src.sha" 2>/dev/null)" = "$SHA" ] && [ -z "$JARVIS_HANDS_FORCE" ]; then
  echo "UNCHANGED $APP (signature and Accessibility grant kept)"; exit 0
fi
mkdir -p "$APP/Contents/MacOS"
swiftc -O -target arm64-apple-macos13.0 "$HERE/jarvis_hands.swift" -o "$APP/Contents/MacOS/jarvis_hands"
cat > "$APP/Contents/Info.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleIdentifier</key><string>$ID</string><key>CFBundleName</key><string>Jarvis Hands</string>
<key>CFBundleExecutable</key><string>jarvis_hands</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleShortVersionString</key><string>1.1</string>
<key>LSUIElement</key><true/><key>LSMinimumSystemVersion</key><string>13.0</string><key>CFBundleInfoDictionaryVersion</key><string>6.0</string><key>CFBundleVersion</key><string>2</string></dict></plist>
PL
echo "$SHA" > "$APP/Contents/.src.sha"   # before signing, so the seal covers it
SIGN="${JARVIS_HANDS_SIGN_ID:-}"
if [ -z "$SIGN" ] && security find-identity -v -p codesigning 2>/dev/null | grep -q "Jarvis Hands Local"; then SIGN="Jarvis Hands Local"; fi
if [ -n "$SIGN" ]; then
  codesign --force --deep -s "$SIGN" --identifier "$ID" "$APP"; HOW="identity $SIGN"
else
  codesign --force --deep -s - --identifier "$ID" -r "=designated => identifier \"$ID\"" "$APP"; HOW="ad hoc, designated requirement on $ID"
fi
echo "REBUILT $APP ($HOW). Turn on Accessibility for Jarvis Hands if macOS dropped it."

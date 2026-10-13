#!/bin/bash
# Builds Jarvis's own click helper as an app bundle (ad-hoc signed) at ~/Applications/Jarvis Click.app.
# Rebuilding changes the ad-hoc signature, so macOS may ask for the Accessibility switch again.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; APP="$HOME/Applications/Jarvis Click.app"
mkdir -p "$APP/Contents/MacOS"
swiftc -O -target arm64-apple-macos13.0 "$HERE/jarvis_click.swift" -o "$APP/Contents/MacOS/jarvis_click"
cat > "$APP/Contents/Info.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleIdentifier</key><string>ai.grok.jarvis.click</string><key>CFBundleName</key><string>Jarvis Click</string>
<key>CFBundleExecutable</key><string>jarvis_click</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleShortVersionString</key><string>1.0</string>
<key>LSUIElement</key><true/><key>LSMinimumSystemVersion</key><string>13.0</string><key>CFBundleInfoDictionaryVersion</key><string>6.0</string><key>CFBundleVersion</key><string>1</string></dict></plist>
PL
codesign --force --deep -s - --identifier ai.grok.jarvis.click "$APP"
echo "$APP"

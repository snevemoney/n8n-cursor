---
name: App teardown with REA
description: >-
  Use when a competitor app, web bundle, Electron/desktop app, APK or binary must be understood (features, endpoints, flows) for a teardown or interop — REA MCP first, Ghidra headless as fallback.
---
# App teardown with REA

**Owner:** Researcher/Forge. **Added:** 2026-10-11 gap audit (REA + Ghidra were installed but had no trigger).

## When
Competitor teardown, "how does X do Y", a client's legacy binary, a web app whose API we must integrate with.

## Do
1. Legal check: only artifacts we own, have a licence for, or that are public web bundles. No DRM/licence bypass. If unsure, stop and ask Evens.
2. `oh-uselog rea teardown`.
3. Web/JS: REA MCP `analyze_web_bundle`, `inspect_web_page`, `recover_javascript_sources`, `inspect_web_network_capture`.
4. Electron/desktop: `list_electron_targets`, `capture_electron_scenario`; native: `open_binary` → `binary_overview` → `list_strings` / `search_procedures` → `procedure_pseudo_code`.
5. Android: `inspect_android_package`, `search_android_classes`.
6. Fallback, no MCP: Ghidra headless `/opt/ghidra/current/support/analyzeHeadless /tmp/gproj p -import <file> -deleteProject` (heavy: need >8 GB free disk, check `df -h /`).
7. Write `TEARDOWN.md` in the packet: features, endpoints, data model, what we will not copy.

## Done when
TEARDOWN.md exists with evidence (function names/addresses or request captures), not chat-only.

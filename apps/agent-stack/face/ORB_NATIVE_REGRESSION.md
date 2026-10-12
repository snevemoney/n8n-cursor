# Native Orb restart regression

This is a manual native integration test, not a CI rendering assertion.

Preconditions: Face /healthz is healthy at 127.0.0.1:4018; installed Orb was built from the candidate source; no active turn. Preserve the app backup. Leave Mic, Eyes, Desktop and Watch unarmed.

1. Quit Orb normally and relaunch the installed app.
2. Observe through native accessibility until loading finishes. Require the /widget HTML, Type to Jarvis input, controls and saved response to be present; the loading pane must disappear.
3. Repeat three consecutive cold launches without Reload Face or any other rescue.
4. Fail if a healthy Face leaves a blank window, if controls never become accessible, or if manual reload is needed. Record actual observations and build provenance, not just HTTP status.

2026-10-07 experiment: unmodified compatible source produced a blank cold launch. Making WKWebView renderable under the loading pane before navigation produced three consecutive complete cold launches. Existing four Orb source checks passed; they do not cover native rendering. Service outage/reconnect and interrupted-turn restart are separate unfinished tests.

Packaging: build against Info.plist LSMinimumSystemVersion. Verify installed Mach-O LC_BUILD_VERSION matches that deployment target. A default-target experiment failed launch with kLSIncompatibleSystemVersionErr; its exact Mach-O minimum was not captured, so numerical SDK/host causality remains unproven.

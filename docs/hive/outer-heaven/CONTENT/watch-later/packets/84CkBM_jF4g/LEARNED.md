# LEARNED — 84CkBM_jF4g
Protocol: jarvis-signal-engine

# A. Source map
- **00:00 - 00:40**: Intro demo showcasing voice-controlled REA (Reverse Engineer Anything) MCP server connected to JARVIS interface, demonstrating live teardowns of `igloo.inc` and Apple Notes (`Notes.app`), and generating a custom web app replacement ("Slate").
- **00:40 - 02:12**: Overview of the REA GitHub repository (`morluto/rea`), detailing its role as an open-source Model Context Protocol (MCP) server containing 170+ analysis tools.
- **02:12 - 04:09**: Live demonstration: JARVIS reverse engineers the interactive 3D WebGL website `igloo.inc` by spawning a clean browser session, tracking scroll events, capturing JS scripts, and compiling a teardown report.
- **04:09 - 05:40**: Breakdown of the `igloo.inc` teardown report stored in the local knowledge graph (3D WebGL Web app structure, Svelte wrapper, Three.js r165, GSAP 3.12.5, virtual scroll mechanics).
- **05:40 - 08:08**: Theoretical explanation of AI-assisted reverse engineering: structural analysis vs. source code copying, ethical boundaries, clean-room design principles.
- **08:08 - 10:15**: Live demonstration: JARVIS reverse engineers native macOS application `/System/Applications/Notes.app` via voice command, inspecting binary plists, dylibs, and Objective-C/AppKit classes.
- **10:15 - 12:07**: Walkthrough of the downloadable REA + JARVIS Prompt Pack PDF, explaining setup scripts (`npx rea-agents setup`), system prompts, and Anthropic API key configuration.
- **12:07 - 13:35**: Review of the native Apple Notes teardown report (AppKit native app, version 4.11, Objective-C `ICM` classes, compiled `.nib` layouts, `Assets.car`, 5 XPC extensions for Siri/Spotlight/Widgets).
- **13:35 - 14:18**: Claude Code automated build pipeline: taking the Apple Notes teardown report as a blueprint prompt to generate a web-based replacement app ("Slate - Notes").
- **14:18 - 15:50**: Side-by-side comparative testing of the generated Slate web app against native macOS Apple Notes (3-pane layout, markdown shortcuts, task checklists, local browser storage).
- **15:50 - 17:28**: Deep dive into REA capabilities across target types (Native binaries, Go/Rust binaries, WASM, EVM bytecode, SQLite databases, Electron apps).
- **17:28 - 17:29**: Video summary, community call to action, and ethical usage reminders.

# B. Atomic knowledge
- **Claim**: REA operates as an open-source MCP server with 170+ analysis tools compatible with Claude Code, Cursor, and Codex. [SOURCE]
- **Claim**: Reverse engineering with AI produces structural blueprints, dependency maps, and pseudocode, not original proprietary source code. [SOURCE]
- **Claim**: `igloo.inc` is built as a single-page WebGL app wrapped in Svelte, utilizing Three.js (r165), GSAP (3.12.5), and virtual scroll progress mapping without standard page DOM depth. [SHOWN at 04:10, 08:04]
- **Claim**: Apple Notes (`/System/Applications/Notes.app`) is a native AppKit application (v4.11, build 2974) using Objective-C classes prefixed with `ICM`, compiled nib interface files, and 5 XPC extension bundles. [SHOWN at 12:14, 12:58]
- **Claim**: Claude Code can consume an REA teardown Markdown report as a spec prompt to construct a full-featured web replacement in sandbox mode. [SHOWN at 13:42, 14:18]
- **Claim**: REA supports analysis of native binaries (Hopper/Ghidra/IDA integration), WASM modules, SQLite schemas, EVM bytecode, and Electron app packages. [SHOWN at 16:52]

# C. Procedures as ordered steps
### 1. Setting up REA MCP Server for Claude Code
1. Ensure Node.js 22.19+ (or Node.js 24/26) and `npm` are installed.
2. Run command `npx rea-agents setup` in the terminal to initialize the REA MCP tools.
3. Configure Claude Code (`config.json`) to register the REA MCP server endpoint.

### 2. Reverse Engineering a Website via Voice/Jarvis
1. Issue voice prompt: *"Jarvis reverse engineer [URL]"*.
2. Assistant opens target URL in a clean headless/automated browser.
3. REA captures network requests, DOM structure, dynamic JS script imports, and scroll hooks.
4. REA generates a structured Markdown teardown report detailing framework versions, asset sizes, and runtime mechanics.
5. Report is automatically saved to the local 3D knowledge graph vault (`localhost:4719`).

### 3. Reverse Engineering a Native macOS App
1. Issue voice prompt: *"Jarvis reverse engineer the [App Name] app on my Mac"*.
2. Assistant locates app path (e.g. `/System/Applications/Notes.app`).
3. REA runs binary inspection: reads `Info.plist`, traces dylib resolution, extracts Objective-C/Swift class symbols, and inspects XPC extension bundles.
4. Assistant generates binary teardown report and displays key architecture on screen.

### 4. Rebuilding a Clean-Room App from Teardown Blueprint
1. Provide REA teardown report to Claude Code as input blueprint.
2. Instruct agent to scaffold clean web architecture implementing core features (e.g., 3-pane layout, markdown editing, local storage).
3. Agent compiles and deploys app in a local sandboxed browser test window.
4. Perform interactive UI verification against target app specs.

# D. Shown on screen
- **00:00 - 00:36**: AI WORKSHOP OS running at `localhost:4719` featuring a 3D force-directed node graph, JARVIS voice status HUD (OPUS 5.5 model indicator), teardown progress panel, and browser popups.
- **00:42, 16:52 - 17:00**: GitHub repository page `morluto/rea` showing repository metadata (~207k stars, MIT License), README setup commands (`npx rea-agents setup`), and tool matrix table.
- **01:08 - 01:14, 10:28 - 10:44**: PDF document viewer displaying "Give Your Jarvis X-Ray Vision - REA Prompt Pack" containing system prompts (Prompt 01: "The Galaxy and the Brain", Prompt 02: "Speech", Prompt 03: "The Demo Moment") and Anthropic API key configuration instructions.
- **04:10**: Teardown modal for `igloo.inc` showing execution metadata (REA 6.4.0), WebGL breakdown, DOM element counts (27 elements), bundle details (`App3D-d68cb154.js`, 1.4 MB containing Three.js and GSAP), and virtual scroll progress value logic.
- **08:24 - 08:32, 14:30 - 14:32**: Native Apple Notes macOS application interface displaying three-pane layout (folders panel, note list, active note viewer).
- **10:48, 11:44 - 11:54**: Skool platform UI (`skool.com/aiworkshop-lite`) displaying course modules ("JARVIS (V7) - The Senses Era") and downloadable resources (`brain-jarvis-skill-v7-mac.zip`, `brain-jarvis-skill-v7-windows.zip`, `Jarvis-V7-Install-Guide.pdf`).
- **12:14 - 12:58**: Apple Notes teardown report modal showing target path `/System/Applications/Notes.app`, AppKit framework analysis, version 4.11 (build 2974), Objective-C class names (`ICM` prefix), compiled nib files, `Assets.car`, 5 XPC plugin extensions, and `Notes.sdef` AppleScript dictionary.
- **13:42**: Build task status card: `BUILD - A NOTES APP SIMILAR T...` with state indicators (`blueprint: Teardown - Apple Notes`, `BUILDER: deploying...`, `BUILDER: online - sandboxed`).
- **14:18 - 14:32**: Web application "Slate - Notes" running in browser overlay, showing clean 3-pane layout, markdown edit shortcuts (`Cmd+N`, `Cmd+K`, `Cmd+P`), task checkboxes, and auto-save indicator.

# E. Said vs shown mismatches
- **Star Count**: Description claims 230,000+ stars for REA repo, whereas GitHub screen shown at 16:56 displays `207k` stars (or 206.6k). This is likely due to rounding or rapid star growth.
- **Voice Automation UI**: The presenter speaks simple sentences (*"Jarvis reverse engineer Apple Notes"*), while the screen shows an underlying local web architecture (`localhost:4719`) running custom voice listeners and Claude Code agent bridges.

# F. Failures and recoveries
- None shown in video; all live voice commands, REA MCP binary inspections, and Claude Code web app generations executed without errors.

# G. Decision points (IF -> THEN)
- **IF** analyzing a 3D interactive web page **THEN** REA inspects live DOM, captured JS bundles, canvas contexts, and scroll event listeners to deduce rendering engine (e.g. Three.js).
- **IF** analyzing a macOS native application **THEN** REA targets the bundle path (`.app`), extracts `.plist` metadata, inspects `.nib` layout files, and enumerates Objective-C class symbols.
- **IF** generating a clean-room software recreation **THEN** supply the REA teardown Markdown report as a spec prompt to Claude Code while explicitly prohibiting direct copy-pasting of proprietary code or asset graphics.

# H. Tools/repos/MCPs named
- **REA (`morluto/rea`)**: Open-source MCP server with 170+ reverse-engineering tools for web, native binary, WASM, and SQLite analysis.
- **Claude Code**: Anthropic CLI agent tool used to execute prompts, interact with MCP servers, and build software projects.
- **Claude Opus 5.5**: Anthropic LLM model referenced in PDF setup prompts for complex multi-step reasoning.
- **AI WORKSHOP OS**: Custom web UI dashboard (`localhost:4719`) featuring a 3D force-directed knowledge graph second brain and J.A.R.V.I.S. voice interaction HUD.
- **Obsidian**: Markdown note storage engine integrated into the second brain vault.
- **Three.js & GSAP**: JavaScript WebGL rendering and animation libraries detected during web teardown.
- **AppKit & Objective-C / Swift**: macOS native GUI frameworks detected during Apple Notes analysis.
- **Skool (`skool.com/aiworkshop-lite`)**: Community platform hosting downloadable prompt packs and installer zips.

# I. Challenges
- **Decompilation Scope**: REA generates structural blueprints, signatures, and pseudocode, not original raw source code. Expecting full source code restoration is inaccurate.
- **Legal & Copyright**: Rebuilding software based on teardowns must follow clean-room practices without copying proprietary assets, branding, or licensed code.

# J. Use for Jarvis
- Connect REA MCP server (`npx rea-agents setup`) directly into Evens's Mac Claude Code agent environment.
- Enable voice or text commands allowing Jarvis to analyze local macOS binaries (`/Applications/*.app`) or target web URLs on demand.
- Automatically output structured Markdown teardown blueprints into Jarvis's local knowledge graph vault.
- Use teardown blueprints as structured prompts for coding agents to scaffold functional utility tools or clone app layouts.

# K. Open questions
- What specific sub-tools within REA handles Mach-O binary parsing vs web bundle extraction?
- How effectively does REA handle heavily obfuscated or minified commercial JavaScript bundles?
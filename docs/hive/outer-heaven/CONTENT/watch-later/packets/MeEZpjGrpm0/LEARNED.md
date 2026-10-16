# LEARNED — MeEZpjGrpm0
Protocol: jarvis-signal-engine

# A. Source Map
- **00:00**: Intro to ADA v2 built from scratch, replacing the old 3-model pipeline assistant.
- **00:30**: Adoption of Gemini native audio model for zero-latency turn-taking, real-time voice, and speech interruption handling.
- **01:45**: Multimodal vision demo identifying diecast cars and anime action figures live on camera.
- **02:40**: Transition from digital-only assistant to physical home automation control.
- **03:05**: Local Kasa smart bulb discovery and Python socket integration.
- **03:30**: Autonomous LLM tool calling mechanism explanation and light-control demo.
- **04:30**: OpenCV hand tracking and air gesture control for cursor movement and pinch toggles.
- **05:45**: Browser automation via Gemini Computer Use model.
- **06:30**: Asynchronous multi-agent execution (background browser agent operating while main voice UI remains responsive).
- **08:00**: CAPTCHA blocking failure mode, safety confirmation dialogs, and settings drawer walkthrough.
- **08:35**: Workspace file system project management and long-term conversation history persistence.
- **10:50**: Multi-agent CAD generator hierarchy with step-by-step thinking logs.
- **12:30**: Automated STL slicing and direct 3D print dispatch via Moonraker API to Creality K1 printers.

# B. Atomic Knowledge
- **Native Audio vs. 3-Stage Pipeline**: Replacing STT + LLM + TTS with a native audio model eliminates multi-hop latency and enables real-time speech interruption handling. *[SOURCE]* (Evidence: Instantaneous stopping when interrupted at 01:20).
- **Asynchronous Agent Task Execution**: Spawning computer-use browser tasks in background subprocesses keeps the primary voice UI loop non-blocking and available for ongoing commands. *[SOURCE]* (Evidence: Light show executed concurrently during web search at 07:32).
- **Hierarchical Task Delegation**: Specialized domain tasks (like CAD generation) should be routed from the conversational coordinator to dedicated generator sub-agents with dedicated UI feedback panes. *[SOURCE]* (Evidence: `DESIGNER THINKING` panel rendered at 11:54).
- **Local LAN IoT Control**: Local network socket discovery (`python-kasa`) avoids cloud API rate limits and round-trip latency when controlling smart home hardware. *[SOURCE]* (Evidence: Local IPs `10.0.0.81-83` listed in Smart Control UI at 03:08).
- **Direct Moonraker 3D Print Integration**: AI assistants can automate manufacturing by sending compiled CAD STL files directly to Moonraker API endpoints (port 7125) on Klipper 3D printers. *[SOURCE]* (Evidence: Creality K1 Moonraker endpoint connected at 12:34).
- **CAPTCHA Vulnerability**: Vision-based computer-use agents cannot cleanly solve modern anti-bot CAPTCHAs and require human fallback or task termination. *[SOURCE]* (Evidence: CAPTCHA grid halt at 08:02).

# C. Procedures as Ordered Steps
1. **Native Voice Assistant Loop Setup**:
   - Establish a bidirectional streaming socket with Gemini Native Audio API.
   - Route local microphone PCM stream into model input.
   - Set speech interruption listener to cancel active audio playout buffer instantly when user voice is detected.
2. **Local Smart Home Tool Registration**:
   - Scan local subnet (`10.0.0.x`) using `python-kasa` to resolve device IP addresses.
   - Define tool schema definitions (`turn_off_lights`, `cycle_lights`, `set_light_color`) and pass to LLM function caller.
   - Execute direct IP socket commands on function call triggers.
3. **Asynchronous Browser Computer Use**:
   - Spawn worker sub-agent process with Gemini Computer Use tool definitions (`click_at`, `type_text_at`, `scroll_document`).
   - Feed periodic browser viewport screenshots into model context window.
   - Maintain non-blocking IPC channel back to main UI thread.
4. **Project Memory & Workspace Persistence**:
   - Allocate isolated directory per project (e.g., `project_robot_arm/`).
   - Store conversation transcripts (`history.json`) and text files (`plan`) inside folder.
   - Provide LLM with file tools (`write_file`, `read_file`, `create_folder`).
   - Reload transcripts and file summaries into context upon project context switch.
5. **CAD Design to 3D Print Automation**:
   - Route user CAD design request to specialist CAD generator model.
   - Stream CAD sub-agent thinking steps to UI visualizer (`DESIGNER THINKING`).
   - Output rendered STL file to workspace.
   - Send POST request to Moonraker API (`http://<printer_ip>:7125/printer/print/start`) with generated STL payload.

# D. Shown on Screen
- **00:16**: Windows 11 Desktop with `A.D.A` folder.
- **00:22**: A.D.A UI featuring central circular voice ring, lower history log, floating CAD prototype panel on right.
- **03:08**: `SMART CONTROL` modal overlay displaying `Right Office Light` (`10.0.0.83`), `Left Office Light` (`10.0.0.82`), `Right Room Light` (`10.0.0.81`) with brightness/color sliders.
- **04:41**: Camera feed displaying OpenCV hand joint skeleton tracking overlay for air-gesture cursor control.
- **06:42**: `WEB_AGENT_VIEW` pop-up window running Chrome browser automation with live task execution logs.
- **08:02**: CAPTCHA challenge displayed in `WEB_AGENT_VIEW` halting automation.
- **08:20**: `SETTINGS` drawer showing Security (Face Authentication), Audio Input/Output devices (`Echo Cancelling Speakerphone`), Camera (`Insta360 Link`), Sensitivity slider, and Tool Configuration toggles.
- **08:53**: Folder switcher switching context from `PROJECT : TEMP` to `PROJECT : ROBOT ARM` and opening `plan` file content.
- **11:54**: `CAD PROTOTYPE` panel showing live `DESIGNER THINKING... 1/3` text stream during part generation.
- **12:34**: `3D PRINTERS` configuration window listing `Creality K1` (`10.0.0.247:7125 - MOONRAKER`) and `Creality K1 SE` (`10.0.0.36:7125 - MOONRAKER`).
- **12:54**: Browser tab displaying Moonraker/Mainsail web camera stream monitoring 3D printer bed.

# E. Said vs Shown Mismatches
- At **06:30**, presenter verbally states "add a 25 kg servo motor to my cart", but the UI chat prompt log at **06:36** shows typed text "add 25 kg survival mode to my cart".
- At **01:33**, presenter asks "What is 5 plus 5?", audio responds "5 + 5 equals 10", while UI log briefly overlaps transcript text from the preceding interrupted story.

# F. Failures and Recoveries
- **Gesture Control Unreliability**: Air pinch control was difficult to hold steadily during light triggers (`This is a lot harder THAN I THOUGHT`). *Recovery*: Added cursor sensitivity slider and gesture horizontal flip toggle in Settings drawer [08:20].
- **Browser CAPTCHA Failure**: Gemini Computer Use agent got blocked on Google/Amazon CAPTCHA visual grid [08:02]. *Recovery*: Process stopped manually to prevent policy violations; fallback to user manual action.

# G. Decision Points (IF -> THEN)
- **IF** user requests complex web browsing task **THEN** delegate task to background `Gemini Computer Use` sub-agent process.
- **IF** background web agent attempts computer/file system control **THEN** prompt user with GUI confirmation dialog.
- **IF** user speaks while assistant is talking **THEN** terminate playout audio buffer immediately and return to listening mode.
- **IF** user requests physical 3D part creation **THEN** trigger CAD generator sub-agent, display thinking steps, render STL, and prompt for 3D printer dispatch.
- **IF** user confirms CAD print **THEN** dispatch STL file to local Moonraker 3D printer REST API.

# H. Tools/Repos/MCPs Named
- **GitHub Repo**: `nazirlouis/ada_v2` (Core codebase for ADA assistant).
- **Gemini 2.5 Native Audio API**: Unified multimodal audio streaming model for speech conversation.
- **Gemini Computer Use**: Vision-based browser automation model.
- **OpenCV / MediaPipe**: Vision library for webcam hand joint tracking.
- **python-kasa**: Python library for local TP-Link Kasa smart device control.
- **Moonraker API**: Klipper 3D printer management interface operating on port 7125.
- **BuildPart / OpenSCAD**: CAD script compilation engine.

# I. Challenges & Limitations
- **Anti-Bot Systems**: Computer-use web agents routinely fail when confronting Cloudflare or Google CAPTCHA tests.
- **Gesture Control Ergonomics**: Air gestures via webcam lack haptic feedback and cause physical fatigue compared to hardware mouses.
- **Multi-Model Overhead**: Orchestrating voice models, computer-use agents, and CAD generators requires strict state management and error handling.

# J. Use for Jarvis (Mac Operator Application)
- **Non-blocking Subprocessor Execution**: Run long-running web scraping or code analysis tasks in background threads while keeping Jarvis voice listener UI fully responsive.
- **Local Folder Project Context**: Organize Jarvis memory into project subdirectories, auto-loading contextual history when switching task folders.
- **Direct Sub-Agent UI Panel Integration**: Create dedicated UI floating windows (e.g., live web agent view, code generation thinking stream) for specialized sub-agents.
- **Direct API Device Hardware Binding**: Connect Jarvis directly to local LAN hardware (printers, smart plugs) via REST/WebSocket endpoints.

# K. Open Questions
- How does the system handle state sync back to the voice model if a background web agent encounters an unhandled exception or CAPTCHA timeout?
- What exact Python CAD framework (BuildPart/CadQuery/OpenSCAD) is executing inside the CAD generation sub-agent process?
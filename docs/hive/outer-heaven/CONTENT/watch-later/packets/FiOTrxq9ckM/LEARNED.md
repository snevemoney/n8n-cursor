# LEARNED — FiOTrxq9ckM
Protocol: jarvis-signal-engine
Watched: whole video by Gemini (gemini-3.8-flash, Google AI Studio free tier) from the YouTube link, 1 frame/s + audio, learn lens, no download

# Signal Analysis: Fullstack Agent (My Jarvis AI Assistant)

### A. Source Map
- `00:00 - 00:12`: Teaser demonstration showing the full-screen circuit board HUD visualizer (`J.A.R.V.I.S. Visualizer`) in `SPEAKING` state with British voice delivery.
- `00:12 - 01:07`: Presenter Jared Rhodenizer introduces the open-source repository `fullstack-agent`, detailing its 4 core subsystems: persistent memory, two-way voice conversation, visualizer face HUD, and optional bare-hand AR gesture control.
- `01:07 - 02:16`: Live interaction test with voice input (`LISTENING`), cryptographic matrix thinking animation (`THINKING`), and persona demonstration (`SPEAKING`). Jarvis explains the difference between a chatbot and an active voice agent with infinite memory.
- `02:16 - 03:29`: Presenter prompts Jarvis about Claude Code execution capabilities. Jarvis enumerates file read/write, code rewriting, executing real terminal commands, internet search, and parallel sub-agent task orchestration.
- `03:29 - 04:48`: Presenter asks Jarvis to list actual tasks performed. Jarvis enters `THINKING` state for ~18 seconds while executing memory lookups, then reports on 24/7 server monitoring, marketing copywriting, visual generation, and assisting in building the studio rig.
- `04:48 - 05:45`: Presenter breaks down the underlying storage mechanism: plain markdown files housed inside a local Obsidian vault directory read by Claude Code on session initiation.
- `05:45 - 07:06`: Transition to `Barehands` gesture-controlled spatial HUD. Jared demonstrates pinch-to-drag, two-handed scaling, 3D perspective tilt, folder navigation, and rendering 3D GLB assets (`coin.glb`).
- `07:06 - 07:38`: Voice integration inside Barehands UI: Jared requests an image of the "Wand and Lantern"; Jarvis retrieves the image and displays it on a floating spatial window.
- `07:38 - 08:27`: Demonstration of the "Claw" remote targeting gesture, pulling elements towards the user, opening markdown files from the Obsidian vault, reading metadata/text, and closing windows with top-tap.
- `08:27 - 08:59`: Architectural recap and modular deployment options across GitHub repos.
- `08:59 - 09:09`: CRT terminal styled outro screen with links to social channels (@jaredrhod).

### B. Atomic Knowledge
1. **Persistent Markdown Memory Vault Architecture**:
   - *Claim*: Unlimited, zero-loss long-term context is achieved without vector database complexity by pointing Claude Code to a designated Obsidian vault folder containing structured plain-text markdown files.
   - *Why*: Claude Code natively reads local files on session initialization and writes updates to disk during execution. Plain-text markdown files eliminate proprietary schema locks and maintain human-inspectable context indefinitely.
   - *Conditions*: File structure must be indexed (e.g. `Stream Vault/index.md`) so the model knows which files to query.
   - *Evidence*: `05:27 - 05:38` Jared explains Obsidian vault local storage; `08:08 - 08:22` displays markdown headers (`status: active`, `project: meta`, `type: index`). [SOURCE]

2. **State-Reactive HUD Visual Feedback**:
   - *Claim*: Voice assistant interaction friction is significantly reduced when three discrete operational states (`LISTENING`, `THINKING`, `SPEAKING`) are visually rendered with immediate audio-reactive waveforms and encrypted character generation.
   - *Why*: User speech pauses can trigger false end-of-turn events; displaying an oscillating audio waveform confirms capture, while a randomized matrix scramble provides visual proof of API processing/tool invocation.
   - *Conditions*: Requires real-time bi-directional IPC or WebSocket event streams between the agent runtime (Claude Code / Backtalk) and the frontend HUD.
   - *Evidence*: Demonstrated continuously between `01:07` and `04:48`. [SOURCE]

3. **Optical Bare-Hand Gesture UI Without Wearables**:
   - *Claim*: Spatial manipulation of OS window elements, 3D models, and agent file trees can be accomplished through a standard webcam using computer-vision hand tracking (MediaPipe or similar WebGL/WebRTC pipeline) without gloves or headsets.
   - *Why*: Pinch-to-move, two-hand zoom, 3D tilt, and claw-to-grab gestures map natural spatial affordances to window management.
   - *Conditions*: Requires unimpeded webcam line-of-sight and sufficient ambient lighting.
   - *Evidence*: Verified across `05:45 - 08:27`. [SOURCE]

### C. Procedures as Ordered Steps

#### 1. Fullstack Agent End-to-End Deployment
1. Prerequisites: Ensure Node.js, Git, and Anthropic Claude Code CLI are installed and authenticated.
2. Clone the core installer repository: `git clone https://github.com/jaredrhod/fullstack-agent`.
3. Execute the interactive installer script.
4. Select the desired module composition when prompted:
   - Component 1: `ai-memory-vault` (Obsidian-compatible markdown file schema).
   - Component 2: `backtalk` (Push-to-talk voice input and ElevenLabs/TTS voice response).
   - Component 3: `ai-visualizer` (Full-screen circuit board or alternate HUDs).
   - Component 4 (Optional): `barehands` (Webcam-based spatial gesture controller).
5. Configure API credentials (Anthropic API key, TTS provider keys if separate).
6. Initialize the runtime by triggering the listener (`Space` tap or hotword wake).

#### 2. Spatial File Navigation via Barehands Gesture Control
1. Launch the `barehands` interface window.
2. Present hand to camera until the tracking reticle locks onto palm/fingers.
3. Pinch index finger and thumb to grab the main circular hub (`J.A.R.V.I.S. ACTIVE`).
4. Tap or release pinch to deploy satellite category bubbles (`VAULT`, `PROPS`, `WIDGETS`).
5. Hover and pinch over `PROPS` to reveal sub-directories and `.glb` / image assets.
6. Pinch a file node (e.g. `coin.glb`) and drag it into workspace to render 3D viewport.
7. Pinch with both hands simultaneously: pull apart to scale up, push together to scale down.
8. Grip with closed fist and twist wrist to orient the object across pitch, roll, and yaw axes.
9. Tap the top border bar of any active floating window to dismiss/close.

### D. Shown on Screen
- `00:00 - 00:12`: High-contrast green-on-black circuit board HUD (`ai-visualizer`). Top-left shows `J.A.R.V.I.S.` / `PROTOCOL: ONLINE / CONNECTION / JARVIS`. Top-right shows status toggle `SPEAKING` with running clock `21:40:25` to `21:40:33`. Center features an illuminated bezel surrounding text `J . A . R . V . I . S .`.
- `01:07 - 01:16`: Visualizer switches to `LISTENING 21:49:50`. Central bezel displays a dynamic cyan sine-wave oscilloscope responding to microphone gain. Lower label reads: `SAY "JARVIS" OR TAP SPACE`.
- `01:16 - 01:19`: Visualizer toggles to `THINKING 21:49:59`. Oscilloscope is replaced by high-speed randomized character scramble (`<WTY39VV6.Z8`, `*TWNI%9QF>*X`, `1URKP7EHCN/Q`).
- `02:26 - 02:32`: Extended character matrix scramble during model inference: `P6F01V6TIZ?E`, `T*ZSX<2P0ST@`, `0$610AF%D20B`, `Q50R#>P*ZW61`.
- `03:35 - 03:52`: Extended tool execution state (`THINKING 21:52:25 - 21:52:43`) running through 17 cryptographic cycles while querying local Obsidian files.
- `05:45 - 06:40`: `Barehands` AR interface. Translucent cyan concentric ring HUD labeled `J . A . R . V . I . S . / ACTIVE`. Orbiting satellite bubbles: `VAULT (Stream Vault)`, `PROPS (Green Screen)`, `WIDGETS (Clocks, Timers)`.
- `06:40 - 06:53`: Glassmorphic directory menu titled `PROPS`. File listings: `ad-examples`, `fx`, `holo`, `misc`, `models`, `sales-funnel-graphics`, `the-wizard-hideout`. Sub-folder `holo` displays `.glb` files (`bg-machine.glb`, `coin.glb`, `hulk.glb`, `human.glb`, `iron-man-mach-1.glb`, `iron-man-mach-2.glb`, `machine.glb`, `pink-turtle.glb`, `sphers.glb`, `trex.glb`).
- `06:54 - 07:06`: 3D rendering of `coin.glb` - an illuminated, translucent glowing dollar sign medallion manipulated in real-time AR space.
- `07:24 - 07:37`: Floating photographic panel retrieved by Jarvis showing a stone-walled fantasy interior with banner reading `THE WAND & LANTERN`.
- `07:59 - 08:26`: Text viewer window titled `Stream Vault`. Metadata pane shows: `status: active`, `project: meta`, `type: index`. Document body reads: `Read this file at the start of every conversation to understand who I am, how we work together, and how this vault is organized... Part 1 - Who I Am: Jared Rhodenizer. I live in Georgia. I run three businesses...`.
- `08:59 - 09:09`: Retro CRT terminal screen. Typing prompt: `~ $ @jaredrhod`. Resolves into green pixel font header `@jaredrhod` with subtext `TIKTOK - YOUTUBE - GITHUB - X`.

### E. Said vs Shown Mismatches
- *Stated Sub-Agent Execution vs Display*: Jarvis claims (`03:02 - 03:10`) that he can "spin up other little versions of myself to go chase down five things in parallel while I keep talking to you". While Claude Code supports sub-agent task branching, the visualizer on screen shows only a single unified `THINKING` and `SPEAKING` status indicator without sub-agent telemetry or process trees.
- *Autonomous 3 AM Server Repair*: Jarvis claims (`03:56 - 04:05`, `04:31 - 04:38`) that he wakes up at 3 AM to autonomously fix broken servers without paging the user. In the video, the architecture demonstrated is a local CLI agent driven by push-to-talk (`Space`) or wake word; standalone daemonized background cron execution is claimed but not explicitly demonstrated on screen.
- *Push-to-Talk vs Always-Listening Wake Word*: The on-screen text states `SAY "JARVIS" OR TAP SPACE`, but in the video description Jared notes "Hold one key, talk out loud, let go". The UI indicates dual-mode support, while the narration emphasizes push-to-talk simplicity.

### F. Failures and Recoveries
- *Latency During Deep Memory Retrieval*: At `03:35 - 03:53`, when asked to recount past tasks, Jarvis takes approximately 18 seconds in `THINKING` state before generating audio.
  - *Recovery*: The system utilizes continuous cryptographic visual scrambling and animated glowing line states so the operator knows the connection has not dropped or stalled. Jared covers the delay verbally: "See how it's taking him a little bit longer to respond? He's actually gone to look it up. That's what he's doing in the background right now."

### G. Decision Points (IF -> THEN)
- **IF** the user wants a full voice-and-vision desktop agent environment **THEN** clone and run `fullstack-agent` to install all four subsystems in one unified pipeline.
- **IF** the operator uses a non-Claude LLM (e.g. GPT-4o, local Llama via Ollama) **THEN** do not install `backtalk` (which relies on the Claude SDK); instead, clone and run `ai-memory-vault`, `ai-visualizer`, and `barehands` independently.
- **IF** screen real estate is limited or immersion is unnecessary **THEN** omit `barehands` and `ai-visualizer`, relying solely on the CLI/terminal and `ai-memory-vault`.
- **IF** interacting with 3D models or floating windows remotely across the room **THEN** use the "Claw" hand gesture (contracted fingers directed at target) to lock and drag assets rather than standard point-and-pinch.

### H. Tools, Repos, and Components Named
- `fullstack-agent` (`https://github.com/jaredrhod/fullstack-agent`): Unified installer wrapping the memory vault, voice subsystem, visualizer HUD, and gesture engine.
- `ai-memory-vault` (`https://github.com/jaredrhod`): Structured local file template and indexing convention configured for Obsidian vaults.
- `ai-visualizer` (`https://github.com/jaredrhod`): Electron/web-based real-time HUD rendering circuit board, audio oscilloscopes, and operational status.
- `backtalk` (`https://github.com/jaredrhod`): Low-latency bidirectional voice pipeline built specifically on Anthropic's Claude SDK with TTS/STT integration.
- `barehands` (`https://github.com/jaredrhod`): Touchless optical hand-tracking AR overlay allowing window manipulation, 3D file viewing, and spatial computing without external sensors.
- `Claude Code`: Anthropic's terminal-based autonomous coding agent providing tool calling, file read/write, bash execution, and search capabilities.
- `Obsidian`: Local markdown knowledge management software used as the backing datastore for the agent's memory.

### I. Challenges and Critical Analysis
- *Context Window Bloat*: Relying on an Obsidian vault indexed at the start of every session works cleanly for small-to-medium business vaults. However, as the vault grows to thousands of notes, loading or indexing raw markdown without dynamic chunking, BM25, or hybrid vector retrieval will exceed prompt limits or incur prohibitive token costs.
- *Token Latency*: The 18-second delay observed at `03:35` highlights the round-trip latency when an agent must execute bash/file grep tools before piping output back to a TTS model. For conversational fluidity, speculative execution or streaming partial TTS responses is needed.
- *Webcam Gesture Precision*: While pinching and rotating large floating cards works smoothly, fine-grained tasks (e.g. typing text, code editing) cannot be performed reliably via bare-hand optical tracking without high fatigue and low accuracy.

### J. Use for Jarvis (Evens's Mac Operator)
- **State-Synchronized Visualizer**: Evens's Jarvis operator can adopt the three-state HUD (`LISTENING` oscilloscope -> `THINKING` scramble -> `SPEAKING` pulse) in an unobtrusive secondary display or overlay window to provide instant visual feedback on background tool calls.
- **Obsidian Vault Operator Memory**: Implement a dedicated `operator-vault` in markdown where Jarvis records runbooks, project states, and user preferences. Injecting an `index.md` on startup grounds the agent's identity and operational limits without brittle database setups.
- **Spatial Media Inspection (Barehands)**: Adapt the `barehands` gesture listener for multi-monitor media triage—allowing the operator to swipe away completed review tasks or pull full-screen research artifacts forward using webcam gestures while away from the keyboard.

### K. Open Questions
- Which specific TTS and STT engines power `backtalk` under the hood (e.g. local Whisper + ElevenLabs, Cartesia, or Deepgram)?
- How does `fullstack-agent` handle file concurrency when Claude Code writes to a markdown note that is simultaneously open and active inside Obsidian?
- What tracking library drives `barehands` (custom MediaPipe JavaScript wrapper, Three.js, or Electron native bindings)?
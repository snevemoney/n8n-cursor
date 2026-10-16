# LEARNED — FiOTrxq9ckM
Protocol: jarvis-signal-engine
Watched: whole video by Gemini from the YouTube link, 1 frame/s + audio, no download

# Jarvis AI Assistant & Fullstack Agent Overview

## A. Source Map
- **00:00 - 00:12**: Jarvis teaser demo with animated circuit board UI ("J.A.R.V.I.S.") introducing its persistent memory and assistant capabilities.
- **00:12 - 01:07**: Jared Rhodeniizer introduces the video, explaining the `fullstack-agent` GitHub repo which packages four core components (Voice, Visualizer, Memory, and Bare Hands).
- **01:08 - 02:16**: Jarvis voice tour detailing the text-based voice interface, visualizer state transitions (Listening, Thinking, Speaking), and unlimited persistent memory.
- **02:17 - 03:29**: Jarvis details its core technical capabilities running via Claude Code: file operations (read/write/edit), terminal execution, internet searching, and spawning parallel sub-agents.
- **03:30 - 04:48**: Jarvis queries its own memory vault (showing the "Thinking" state) to recall tasks completed for Jared: 24/7 server monitoring, marketing copy generation, video title/thumbnail design, and hardware/visualizer setup.
- **04:48 - 05:44**: Jared explains agent customization (personality, naming, Obsidian vault memory backend) and introduces the optional Bare Hands spatial gesture system.
- **05:45 - 07:12**: Bare Hands gesture demo: moving UI windows in mid-air, double-pinching to zoom, 3D tilt/rotation, file hierarchy navigation, and rendering 3D GLB models ($ coin hologram).
- **07:13 - 08:27**: Bare Hands "Claw" gesture demonstration (target shaking, fist pull), markdown text file rendering ("Stream Vault"), 3D plane manipulation, and gesture closing.
- **08:28 - 08:59**: Summary of fullstack installer repo features and call to action.
- **08:59 - 09:08**: Outro screen displaying handle `@jaredrhod` across platforms.

## B. Atomic Knowledge
- **Fullstack Agent Bundle**: Unifies four open-source modules into a single installer script for Claude Code: AI Memory Vault, Visualizer, Backtalk (Voice), and Bare Hands (Spatial Gesture UI).
  - *Why*: Simplifies setup into a single CLI command rather than configuring independent services.
  - *Conditions*: Requires Claude Code installed locally.
  - *Source*: Said & Description at 00:12 - 01:07.
- **Persistent Memory Architecture**: Uses local plain-text Markdown files inside an Obsidian Vault rather than vector database context limits.
  - *Why*: Allows cross-session retention across months/years without losing past contextual history.
  - *Conditions*: File path stored in local filesystem vault.
  - *Source*: Said at 01:41 - 02:07 & 05:30 - 05:38.
- **Bare Hands Spatial Tracking**: Uses standard webcam computer vision hand tracking without VR headsets, smart glasses, or spatial gloves.
  - *Why*: Enables Minority Report-style air gestures (pinching, grabbing, rotating, clawing) on standard monitors.
  - *Conditions*: Requires accessible webcam video feed.
  - *Source*: Shown & Said at 05:45 - 08:27.

## C. Procedures as Ordered Steps
### Setting Up Fullstack Agent with Claude Code
1. Install Claude Code on local machine.
2. Clone or run installer command from `https://github.com/jaredrhod/fullstack-agent`.
3. Follow the 3-step setup prompt to select desired components (Memory Vault, Backtalk Voice, Circuit Visualizer, Bare Hands UI).
4. Point the memory configuration to local Obsidian vault path.
5. Launch agent via terminal or voice trigger.

### Interacting with Bare Hands Gesture Control
1. Ensure webcam has clear line of sight to user hands.
2. **Drag Window**: Pinch thumb and index finger over window header and drag.
3. **Resize / Zoom**: Double-pinch with both hands and pull outward/inward.
4. **3D Rotation**: Pinch and hold on an element, then rotate hand in 3D space.
5. **The Claw Grab**: Form a claw shape with fingers toward an element (element shakes), make a fist, and pull back toward screen.
6. **Close Window**: Tap the top control bar of any active hologram/window.

## D. Shown on Screen
- **00:00 - 01:07 / 01:08 - 04:48**: Animated green circuit board visualizer labeled `J.A.R.V.I.S.` showing status indicators (`LISTENING`, `THINKING`, `SPEAKING`). Matrix/scrambled text effect during `THINKING` phase.
- **05:45 - 08:58**: Camera overlay showing Jared interacting with cyan circular HUD (`J.A.R.V.I.S. ACTIVE`). Interactive file menus (`PROPS`, `VAULT`, `WIDGETS`, `PREPS`), green 3D hologram ($ coin GLB model), text file reader (`Stream Vault`), and image display window (`The Wand & Lantern`).
- **08:59 - 09:08**: Terminal-style screen displaying `~ $ @jaredrhod` and social platform links (TikTok, YouTube, GitHub, X).

## E. Said vs Shown Mismatches
- None observed. Visuals directly match spoken descriptions of memory recall, file fetching, visualizer state transitions, and gesture mechanics.

## F. Failures and Recoveries
- During memory recall at **03:35 - 03:52**, Jarvis takes ~17 seconds in `THINKING` state to search local markdown files before speaking. Jared verbally acknowledges the longer response latency ("He's gone to look... he's actually going to look it up in the background").

## G. Decision Points
- **IF** user wants full voice + gesture setup -> **THEN** run `fullstack-agent` installer script.
- **IF** user only wants persistent memory on custom LLMs -> **THEN** use standalone `ai-memory-vault` repo.
- **IF** user lacks VR/AR hardware -> **THEN** enable optional `barehands` camera-based gesture UI.

## H. Tools / Repos / MCPs Named
- `fullstack-agent`: Main installer repo (`github.com/jaredrhod/fullstack-agent`).
- `Claude Code`: Anthropic CLI coding agent driving execution.
- `ai-memory-vault`: Standalone Obsidian plain-text memory repository.
- `ai-visualizer`: Circuit board UI indicator web app.
- `backtalk`: Voice input/output speech interface running on Claude SDK.
- `barehands`: Spatial gesture control system.
- `Obsidian`: Local markdown note-taking tool used as memory storage backend.

## I. Challenges & Realities
- **Response Latency**: Complex file-search queries require multi-second scanning delays while the agent inspects local markdown files.
- **Model Scope**: Voice backtalk system relies specifically on Claude SDK / Claude Code runtime.

## J. Use for Jarvis
- Integrate plain-text Obsidian vault indexing at startup for Evens's Mac operator memory.
- Adopt visual state indicators (`LISTENING`, `THINKING`, `EXECUTING`) to give clear feedback during background operations.
- Combine voice triggers with background execution tools for seamless hands-free control.

## K. Open Questions
- What exact computer vision model (e.g. MediaPipe Hand Landmarker) powers the webcam tracking in `barehands`?
- How does `backtalk` handle real-time audio streaming and latency minimization during voice responses?
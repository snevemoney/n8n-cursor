# LEARNED — FiOTrxq9ckM
Protocol: jarvis-signal-engine
Watched: whole video by Gemini from the YouTube link, 1 frame/s + audio, no download

# Jarvis AI Assistant Analysis

## A. Source Map
- **00:00 - 00:12**: Intro animation featuring Jarvis voiceover and circuit board visualizer HUD.
- **00:12 - 01:08**: Presenter Jared introduces the fullstack-agent repo and main system components.
- **01:08 - 02:16**: Live demo of Jarvis voice response, thinking animation, and persistent memory explanation.
- **02:16 - 03:29**: Demo of Claude Code integration: file management, command execution, and internet search.
- **03:29 - 04:48**: Real-time log search demo showing Jarvis retrieving past accomplishments and background jobs.
- **04:48 - 05:45**: Overview of the Obsidian vault setup for persistent memory.
- **05:45 - 08:27**: Bare Hands spatial HUD demo: gesture controls, 3D manipulation, file browsing, and image generation.
- **08:27 - 08:59**: Summary of full-stack agent installer components and open-source availability.
- **08:59 - 09:08**: Outro graphics with social links.

## B. Atomic Knowledge
- **Persistent Memory**: Stored as plain-text files inside an Obsidian vault, indexed on conversation startup. (Source: Said & Shown, 01:45, 05:15)
- **Claude SDK Dependency**: Full voice interaction (`backtalk`) strictly requires Claude Code/SDK. (Source: Description)
- **Bare Hands Interface**: Camera-based gesture control requiring no specialized VR hardware or gloves. (Source: Shown, 05:45)

## C. Procedures as Ordered Steps
1. Install Claude Code CLI on host machine.
2. Clone the installer repository from `https://github.com/jaredrhod/fullstack-agent`.
3. Run installer script and choose desired modules (Memory, Voice, Visualizer, Bare Hands).
4. Point memory configuration to an Obsidian vault directory.
5. Launch agent interface.

## D. Shown on Screen
- **00:00**: Circuit board HUD with glowing status text (`SPEAKING`, `THINKING`, `LISTENING`).
- **01:16**: Scrambled character text in center box indicating reasoning processing.
- **05:45**: Cyan circular HUD overlay following hand gestures on video feed.
- **06:42**: Translucent glassmorphism file menu listing local computer directories.
- **06:54**: Interactive 3D green dollar coin model rendered and rotated in mid-air.
- **07:24**: Spatial image rendering of room interior upon voice command.
- **08:09**: Plain-text document displayed and tilted in 3D spatial window.

## E. Said vs Shown Mismatches
- None. Visual indicators and UI state changes accurately reflect voiceover statements throughout.

## F. Failures and Recoveries
- **03:35**: Noticeable delay in voice response. Recovered automatically; Jared explained Jarvis was searching local files in the background.

## G. Decision Points
- **IF** installing complete assistant **THEN** use `fullstack-agent` installer script.
- **IF** requiring only modular features (e.g., memory or gesture control) **THEN** clone individual standalone repos from `github.com/jaredrhod`.

## H. Tools/Repos/MCPs Named
- `fullstack-agent`: Unified installer repo.
- `ai-memory-vault`: Plain-text persistent memory module.
- `ai-visualizer`: Circuit board visualizer overlay.
- `backtalk`: Speech-to-speech voice interaction library.
- `barehands`: Webcam gesture tracking HUD interface.
- `Claude Code`: Underlying execution engine.

## I. Challenges
- Voice integration requires Claude SDK, limiting direct compatibility with alternative open LLMs.

## J. Use for Jarvis
- Adapt plain-text Obsidian vault indexing for low-overhead persistent memory across execution sessions.

## K. Open Questions
- What are the system overheads of running real-time gesture tracking alongside heavy LLM agent tasks?
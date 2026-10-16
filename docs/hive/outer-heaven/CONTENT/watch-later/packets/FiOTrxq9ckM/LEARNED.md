# LEARNED — FiOTrxq9ckM
Protocol: jarvis-signal-engine

### A. Source Map
- **00:00**: Jarvis circuit board visualizer displaying state (`SPEAKING`).
- **06:02**: Barehands gesture-tracking interface demo with HUD overlay.
- **07:28**: Generated scene rendering screen presentation.

### B. Atomic Knowledge
- **Jarvis System Architecture**: Comprises 4 modular parts: Memory Vault, Voice (Backtalk), Face (Visualizer), and Hands (Barehands). *Why*: Modular install design. *Conditions*: Claude Code required for unified installer. *Evidence*: Video description. [SOURCE]
- **LLM Compatibility**: Individual repos support various LLMs, but `backtalk` and `fullstack-agent` require Claude SDK / Claude Code. *Why*: Native API bindings. *Evidence*: Video description. [SOURCE]

### C. Procedures as Ordered Steps
1. Install Claude Code CLI tool.
2. Clone and run `fullstack-agent` repo.
3. Select desired components (Memory, Voice, Visualizer, Hands) during interactive setup.

### D. Shown on Screen
- **00:00**: Animated circuit board HUD visualizer labeled `J.A.R.V.I.S.` showing status `SPEAKING` at timestamp `22:40:25`.
- **06:02**: Circular cyan tracking HUD overlaid on camera feed, displaying hand gesture tracking (`ACTIVE`).
- **07:28**: Rendered interior tavern scene (`The Wand & Lantern`) with web link overlays.

### E. Said vs Shown Mismatches
- No transcript available; evaluation based on description claims and video frames.

### F. Failures and Recoveries
- **Failure**: Incompatibility when running `fullstack-agent` or `backtalk` with non-Claude models.
- **Recovery**: Deploy individual standalone repos (`ai-memory-vault`, `ai-visualizer`, `barehands`) for other LLMs.

### G. Decision Points
- **IF** using Claude Code **THEN** deploy via unified `fullstack-agent` installer.
- **IF** using non-Claude models **THEN** manually integrate standalone repos excluding `backtalk`.

### H. Tools/Repos/MCPs Named
- `fullstack-agent`: Main unified CLI installer script.
- `ai-memory-vault`: File-based persistent memory system.
- `ai-visualizer`: Fullscreen state HUD interface.
- `backtalk`: Push-to-talk voice pipeline.
- `barehands`: Spatial gesture control system.
- `Claude Code`: Target agent CLI framework.

### I. Challenges
- Strict dependency on Claude SDK for voice integrations.
- Gesture tracking latency and accuracy bounds under varied lighting.

### J. Use for Jarvis
- Integrates local text file memory and state HUD overlays directly onto the Mac desktop operator workflow.

### K. Open Questions
- What window manager API does `barehands` use to map gestures to Mac OS desktop actions?
- How does `ai-memory-vault` handle file pruning or vector indexing at scale?
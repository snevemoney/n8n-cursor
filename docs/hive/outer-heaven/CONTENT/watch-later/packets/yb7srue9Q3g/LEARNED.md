# LEARNED — yb7srue9Q3g
Protocol: jarvis-signal-engine

### A. Source Map
- **00:00 - AI After Effects Revolution**: Intro showcasing GPT-6 Astra integration with Adobe After Effects via Higgsfield AI.
- **00:46 - Codex App Setup**: Codex desktop environment configuration with model choice `GPT-6 Astra Extra High`.
- **01:23 - Install Higgsfield Plugin**: Browsing `higgsfield.ai/gpt-astra` to connect the After Effects plugin and MCP bridge.
- **02:48 - Browse Plugin Templates**: Exploring preset prompt categories including SaaS Animation, Localization Motion, Presentation Animation, and Whiteboard Animation.
- **05:44 - Free Prompt Pack Access**: Reviewing the 6-prompt *GPT-6 Astra Motion Pack* PDF guidelines, specifications, and prompt structures.
- **06:40 - Run a Prompt Demo**: Selecting and copying Prompt 02 ("Mechanical Choreography: ORDER / CHAOS") into Codex.
- **07:57 - Build Process & Waiting**: Codex executing automated tool calls (`MCP ae_do on higgsfield-use-after-effects`), Blender model setup, and ExtendScript keyframing.
- **09:18 - Review Final Animation**: Inspecting the 15-second 1080x1920 30fps generated video output directly inside Codex's preview player.
- **11:20 - Editable Layers in AE**: Opening the output `.aep` project file in Adobe After Effects 2026, demonstrating separate compositions, folder trees, native 3D camera rigs, and editable keyframes.
- **13:06 - Wrap Up & Resources**: Overview of Skool community downloads (`holo-gestures.zip`, prompt packs) and concluding remarks.

### B. Atomic Knowledge
- **GPT-6 Astra + Higgsfield MCP Integration**: GPT-6 Astra running inside Codex can programmatically generate 3D assets and construct native Adobe After Effects compositions via Higgsfield's MCP server (`higgsfield-use-after-effects`). *(SOURCE: SHOWN - Frame 08:28, 09:20)*
- **Native Editable .AEP Output**: Unlike standard text-to-video AI tools that output flat video files, this pipeline generates complete `.aep` project files containing organized folder trees (`01-DELIVERY`, `02-SCENE`, `03-MODELS`, `04-SD_DESIGN`), native keyframes, cameras, light rigs, and editable text. *(SOURCE: SHOWN - Frame 09:46, 11:20)*
- **Strict Motion Prompt Requirements**: Prompts must explicitly specify target canvas properties (e.g. 15s, 1080x1920, 30 fps), instruct the agent to inspect connected tools first, demand non-flattened native layers, and specify time-stamped choreography breakdowns. *(SOURCE: SHOWN - Frame 05:54, 05:58)*

### C. Procedures as Ordered Steps
1. **Environment Initialization**: Open Codex desktop app, select model `GPT-6 Astra Extra High`, and verify Higgsfield MCP server connection.
2. **Target Application Launch**: Open Adobe After Effects 2026 alongside Codex.
3. **Prompt Specification**: Select or craft a structured prompt containing explicit canvas specs (duration, resolution, fps), layer constraints (native shapes, non-flattened video), and multi-stage time intervals.
4. **Execution**: Submit prompt to Codex. Codex inspects available tools (AE 26.3+, Blender), builds geometry, and executes ExtendScript keyframing scripts (`Choreography.js`).
5. **Verification & Download**: Review the generated video preview inside Codex, then download the output `.aep` project package.
6. **Manual Customization**: Open the `.aep` file in Adobe After Effects to adjust keyframe timing, camera paths, textures, or text elements.

### D. Shown on Screen
- **Higgsfield Portal (`higgsfield.ai/gpt-astra`)**: Web UI showcasing presets like SaaS Animation, Localization, Whiteboard, and Paper Collage with template prompt triggers (at 01:56, 02:50, 04:36).
- **Codex Desktop App**: Multi-modal chat UI with execution status logs ("Working for 32s"), tool invocation tags (`Used Higgsfield integration, loaded tools, ran commands`), inline MP4 video player, and downloadable asset links (at 07:16, 08:02, 08:28, 09:20, 09:46).
- **GPT-6 Astra Motion Pack PDF**: 8-page document detailing prompt structures and prompt templates like *Product Explosion*, *Mechanical Choreography*, *Architectural Assembly* (at 05:44, 05:54, 07:08, 11:14).
- **Adobe After Effects 2026**: Project panel showing folder structure (`01-DELIVERY`, `02-SCENE`, `03-MODELS`, `04-SD_DESIGN`), composition window, and timeline keyframes for `ORDER_CHAOS - MASTER` (at 01:36, 07:00, 11:20).

### E. Said vs Shown Mismatches
- *Note*: No spoken audio transcript was included in the source data. Video description claims match screen visuals regarding GPT-6 Astra, Codex app, Higgsfield AE plugin, and native AE layer outputs.

### F. Failures and Recoveries
- **Script / Tool Execution Check**: During build execution, Codex logs script warnings/retries (`MCP ae_do on higgsfield-use-after-effects`). Codex automatically re-evaluates the environment, switches to the native After Effects clean-rig workflow, and completes the build successfully without user intervention (Frame 09:20).

### G. Decision Points (IF -> THEN)
- **IF** the goal is quick non-customizable video generation -> **THEN** use standard video models (Sora, Runway, Luma).
- **IF** the goal is professional, editable motion graphics with layer keyframes and client-ready AE files -> **THEN** execute time-anchored structured prompts via Codex + Higgsfield AE MCP into Adobe After Effects.

### H. Tools/Repos/MCPs Named
- **Codex Desktop App**: Local AI desktop environment running agent workflows.
- **GPT-6 Astra / GPT-6 Astra Extra High**: Model selection profile in Codex.
- **Higgsfield AE Plugin / Higgsfield MCP** (`higgsfield-use-after-effects`, `MCP ae_do`): Bridge MCP connecting Codex to Adobe After Effects.
- **Adobe After Effects 2026 (v26.3+)**: Target desktop host motion design software.
- **Blender**: 3D model asset generator called automatically during execution.

### I. Challenges
- **Dependency Locks**: Requires specific software versions (After Effects 26.3+) and specialized MCP plugins.
- **Latency**: Multi-step asset generation (Blender models + ExtendScript keyframing) takes over 1-2 minutes per run.
- **Hype vs Reality**: Naming of "GPT-6 Astra" represents high-tier experimental/custom model branding presented in the video environment.

### J. Use for Jarvis
- Evens's Mac operator can construct custom MCP wrappers linking Claude Code / Codex to Adobe After Effects via ExtendScript/Python, automating lower-thirds, kinetic typography, and HUD overlay generation from simple voice or text commands.

### K. Open Questions
- What exact low-level ExtendScript API routines does the Higgsfield MCP invoke inside After Effects?
- Can custom brand typography fonts and audio stems be automatically ingested and synchronized by the agent?
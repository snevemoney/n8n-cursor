# LEARNED — gt8k4bA01Mo
Protocol: jarvis-signal-engine

# Learned Knowledge Base

## A. Source map
- **00:00 - 00:36**: Demo of 3D animated perfume landing page ("SILLAGE") with fluid dynamic explosion background hosted locally on port 4999.
- **00:37 - 01:07**: Overview of Claude Code terminal executing the HALCYON estate website build, handling frame slicing, DOM assertions, and local server startup.
- **01:08 - 01:42**: Demonstration of award-winning website inspiration examples: luxury car night drive with light trails ("VANTA") on port 4977.
- **01:43 - 03:51**: Breakdown of prompt engineering rules for web design (copy placement, hero section focus, CTA rules, loading screen counters).
- **03:52 - 04:33**: Navigation through Claude App desktop interface, showing session metrics and token consumption dashboard.
- **04:34 - 07:24**: Higgsfield MCP landing page (`higgsfield.ai/mcp`) setup instructions and live demo of a continuous cosmic zoom web page ("MAGNITUDE") on port 4996.
- **07:25 - 08:54**: Step-by-step configuration of Higgsfield MCP connector within Claude Desktop Settings -> Connectors.
- **09:55 - 11:53**: Deep dive into `The-Seedance-2.5-Website-Pack.pdf` specification and prompt templates (Resort Journey, Product Spin Drop, Restaurant Fire & Smoke, Architectural Estate Cutaway).
- **11:54 - 13:28**: Claude Code command execution generating video batches via Higgsfield MCP, creating HTML/JS, slicing per-floor cutaway images, and testing viewports.
- **13:29 - 14:46**: Review of final HALCYON estate luxury listing demo site ($28.5M cutaway floor selector and mortgage calculator) and Skool community classroom resources.

## B. Atomic knowledge
- **Claim**: Seedance 2.5 on Higgsfield MCP enables single-generation video clips up to 30 seconds without chaining or continuity drift.
  - **Why**: Traditional video AI models cap at 5–15 seconds, requiring complex stitching that loses visual coherence across scroll transitions.
  - **Conditions**: Must run via Higgsfield MCP interface in `omni_reference` mode at maximum 720p resolution.
  - **Evidence**: Shown in PDF documentation page 2 at 00:50 and 09:14 ("a single generation can run up to thirty seconds... 720p is the ceiling").
  - **Label**: SOURCE
- **Claim**: Consistency across video clips beats higher rendering resolution for high-end web builds.
  - **Why**: A slightly soft 720p clip with identical product aesthetics looks more expensive than four crisp 4K clips with inconsistent lighting or geometry.
  - **Conditions**: Using a single primary keyframe from GPT Image 2/reference image passed as `start_image` across all downstream clip calls.
  - **Evidence**: Shown on page 10 of `The-Seedance-2.5-Website-Pack.pdf` frame 10:02.
  - **Label**: SOURCE
- **Claim**: Forcing viewport re-rendering resolves collapsed canvas layout errors during automated Claude Code browser testing.
  - **Why**: Hidden DOM panes can cause WebGL/Canvas elements to collapse to zero height, breaking DOM assertions.
  - **Conditions**: Executing automated headless testing via Claude Code page scripts.
  - **Evidence**: Terminal log at frame 00:38: "The canvas has zero height because the hidden pane collapsed the layout entirely... force a real viewport size, then retest."
  - **Label**: SOURCE
- **Claim**: Converting a 30-second seamless turntable clip into 72 scrubbable image frames enables zero-latency interactive 360-degree product viewers.
  - **Why**: Scrubbing an array of preloaded images via mouse position/drag is smoother and lighter on GPU than seeking raw HTML5 video elements.
  - **Conditions**: Video generated with camera completely locked off and identical start/end position.
  - **Evidence**: Frame 00:54 and 09:24 (`Prompt 02 - Product & Commerce: The Drop`).
  - **Label**: INFERENCE

## C. Procedures as ordered steps
1. **Connect Higgsfield MCP to Claude Desktop / Claude Code**:
   1. Navigate to `higgsfield.ai/mcp` and copy the remote MCP connector URL.
   2. Open Claude Desktop -> Settings -> Connectors -> Add Custom Connector.
   3. Set connector name to `Higgsfield` and paste the URL into the `Remote MCP server URL` field.
   4. Authenticate session and grant tool permissions for `Higgsfield: Generate Video Batch`.
2. **Generate Video Assets for Website Backgrounds**:
   1. Generate a single hero image reference using an image generation model on a black reflective floor with studio lighting.
   2. Call Seedance 2.5 via Higgsfield MCP using settings: `mode: omni_reference`, `resolution: 720p`, `aspect_ratio: 16:9`, `generate_audio: false`.
   3. Pass the hero image asset ID as `start_image` for all multi-chapter scene prompts to lock visual continuity.
3. **Build Interactive Web Front-End via Claude Code**:
   1. Prompt Claude Code to generate project structure (`index.html`, dynamic JS engine, CSS styles).
   2. Use FFmpeg scripts to extract keyframes from generated clips (e.g., 180 frames at 1600px width, quality 86 for scroll scrub; 72 frames for drag-to-spin).
   3. Program scroll-scrub handlers binding page scroll depth to canvas/image frame indices.
   4. Construct functional UI widgets (colorway switcher, size selection guards, interactive floor selectors, mortgage calculators).
4. **Verify and Localhost Launch**:
   1. Command Claude Code: "Launch on localhost and verify every scroll animation works before telling me it's done."
   2. Execute automated browser validation checks to verify canvas dimensions, layout integrity, and error-free console logs.

## D. Shown on screen
- **Tools & Applications**: Claude Desktop App, Claude Code CLI/Terminal interface, Google Chrome, Mac Preview (PDF viewer), Skool platform (`skool.com/aiworkshop`).
- **Web Demos**: 
  - `localhost:4999`: SILLAGE perfume 3D fluid splash site (00:00, 01:04).
  - `localhost:4977`: VANTA night drive car light trails site (01:32, 06:20).
  - `localhost:4996`: MAGNITUDE space cosmic zoom site (05:16, 05:42).
  - `HALCYON`: $28,500,000 architectural villa listing with 3D cutaway floor selector (00:38, 11:56, 13:36).
- **MCP Setup**: `higgsfield.ai/mcp` showing connector URL field and Claude settings overlay at 08:14.
- **PDF Specs (`The-Seedance-2.5-Website-Pack.pdf`)**: Parameters list (12v, omni_reference, video_edit, video_extension; duration 4–30s; resolutions 480p/720p; aspect ratios 21:9, 16:9, 4:3, 1:1, 3:4, 9:16) at 09:14.
- **Rules List**: "Five things that took me months to learn" at 10:02.

## E. Said vs shown mismatches
- No spoken audio transcript was provided in the source input. All findings are derived directly from high-resolution contact sheet frames, PDF prompt documents, and terminal outputs visible on screen.

## F. Failures and recoveries
- **Failure**: Canvas element rendering failure during automated browser evaluation in Claude Code (`The canvas has zero height because the hidden pane collapsed the layout entirely`).
- **Recovery**: Claude Code automatically detected the DOM collapse, injected script overrides to force real viewport dimensions, re-executed interaction checks, and verified frame integrity.

## G. Decision points (IF -> THEN)
- **IF** building a luxury physical product showcase (e.g., sneakers, watches, fragrance):
  - **THEN** generate a 10-second seamless 360° turntable clip, slice into 72 frames with FFmpeg, and bind to a horizontal drag gesture for an interactive spin-it-yourself viewer.
- **IF** creating a multi-section architectural listing:
  - **THEN** prompt Seedance 2.5 for an exploded cutaway clip showing all floor levels, extract individual per-floor frame cuts using FFmpeg, and link tabs to room inventory lists.
- **IF** video background loading causes page lag:
  - **THEN** cap frame exports to 180 frames max, 1600px width, quality level 86, and integrate a full-bleed percentage loading screen into the hero experience.

## H. Tools/repos/MCPs named
- **Claude Code**: Terminal agent used for generating website engines, writing CSS/JS, running local test servers, and validating DOM components.
- **Higgsfield MCP**: Remote Model Context Protocol server delivering ByteDance Seedance 2.5 video generation API directly into Claude.
- **Seedance 2.5**: Multimodal video generation model by ByteDance supporting up to 30-second unbroken video takes and multi-reference conditioning.
- **FFmpeg**: CLI media tool used in background scripts by Claude Code to extract frame sequences and slice per-floor keyframes.
- **GPT Image 2**: Named in prompt pack for generating initial hero image reference files with exact material and studio lighting attributes.

## I. Challenges
- **Resolution Ceiling**: Seedance 2.5 is hard-capped at 720p output, requiring smart downscaling/upscaling strategies to avoid pixelation on high-DPI displays.
- **Preload Bandwidth**: Scrubbable frame sequences (180+ PNG/JPG frames) can degrade performance on slow networks if not optimized with WebP compression or canvas sprite sheets.
- **Token & Credit Usage**: High-volume video batching via MCP can quickly exhaust API credits if initial prompt parameters (start images, aspect ratios) are improperly configured.

## J. Use for Jarvis
- **Jarvis Operator Implementation**: 
  - Evens's Mac assistant can mount Higgsfield MCP inside Claude Desktop / Claude Code tools to auto-generate video assets for UI prototypes.
  - Jarvis can write automated shell workflows using FFmpeg to process generated video files into canvas-ready frame arrays for interactive Mac apps or dashboards.
  - Implement Claude Code verification loops (`Launch on localhost and verify...`) to ensure generated UI apps render error-free before presenting to operator.

## K. Open questions
- What is the exact latency and credit cost per 30-second 720p render when invoking Higgsfield MCP via batch mode?
- How effectively can Seedance 2.5 maintain text legibility when embedded keyframe graphics are included in reference inputs?
# LEARNED — ppAKkmkpEU4
Protocol: jarvis-signal-engine
Watched: whole video by Gemini (gemini-3.8-flash, Google AI Studio free tier) from the YouTube link, 1 frame/s + audio, learn lens, no download

# Buda Agent Workbench UI Analysis

### A. Source Map
- **00:00 - 00:04**: Buda Agent Workbench UI overview (version Buda v1.7.0 released).
- **00:04 - 00:11**: User prompt in center chat instructing the agent (`Arcade Builder Agent`) to build "Mushroom Jump".
- **00:11 - 00:16**: Agent execution results summary (`Used 17 tools`, created files, preview server on port 3000, git commit, artifact `DESIGN_NOTE.md`).
- **00:16 - 00:26**: Opening generated artifact `DESIGN_NOTE.md` in the right-side split pane while center chat remains intact.
- **00:26 - 00:30**: Switching right panel tool from Files view to `Local Browser` and selecting port `http://localhost:3000`.
- **00:30 - 00:39**: Interactive execution and verification of HTML5 canvas game (`Mushroom Jump`) directly inside the workbench browser frame.
- **00:39 - 00:46**: Expanding the bottom drawer tool tray via the top-right header control `Show bottom panel`.
- **00:46 - 00:51**: Launching an interactive sandbox terminal in the bottom dock (`agent@sandbox-530d7b88:~$`), running `cd`, `ls -la`, and `curl -I`.
- **00:51 - 01:05**: Demonstrating full three-pane workbench context (Center Chat + Right Inspector/Browser + Bottom Terminal).
- **01:05 - 01:08**: Closing brand screen: `Buda - Build Your Agent Company` (buda.im).

### B. Atomic Knowledge
1. **3-Sided Surrounding Layout Pattern**:
   - *Claim*: Workbench architectures that place conversational chat in the center and dock tools (files, preview browsers, shell terminals) to the side and bottom prevent context-switching and window occlusion during multi-turn agent runs.
   - *Why*: The operator can inspect real-time artifacts, playtest interactive UI, and tail CLI processes without masking the conversation stream or losing scroll position.
   - *Conditions*: Requires responsive multi-pane layout management with tabbed or dockable panes.
   - *Evidence*: Shown at 00:19 - 01:05.
   - *Label*: SOURCE.

2. **Headless Sandbox Port Forwarding & Local Browser Inspection**:
   - *Claim*: Agent sandboxes serving web applications on internal ports (e.g., `localhost:3000`) can be seamlessly exposed to an in-UI embedded browser widget via open-port discovery.
   - *Why*: Avoids external browser windows, manual proxying, or leaving the editing environment.
   - *Conditions*: Sandbox requires containerized port detection (`Open Ports` menu listing `http://localhost:3000`).
   - *Evidence*: Shown at 00:26 - 00:39.
   - *Label*: SOURCE.

3. **Inline File Artifact Click-to-Panel Binding**:
   - *Claim*: Emitting discrete file attachment cards in chat output (e.g., `DESIGN_NOTE.md`) that open directly into an adjacent file inspector pane eliminates file tree navigation friction.
   - *Why*: Reduces user interaction to 1 click to verify agent design docs.
   - *Evidence*: Shown at 00:16 - 00:21.
   - *Label*: SOURCE.

### C. Procedures as Ordered Steps
1. **Building and Verifying a Web App with Buda Agent**:
   - Step 1: Prompt agent in center chat specifying app type, game mechanics, file output directory (`/agent/mushroom-jump.app`), and design documentation requirement.
   - Step 2: Agent executes tool loop (used 17 tools: writes `index.html`, `style.css`, `script.js`, `DESIGN_NOTE.md`, `buda.app.json`, commits git tree, starts dev server on `localhost:3000`).
   - Step 3: Click artifact card (`DESIGN_NOTE.md`) in agent chat bubble to inspect markdown in the right drawer.
   - Step 4: Open right pane view switcher, select `Local Browser`, and select open port `http://localhost:3000` to launch interactive iframe.
   - Step 5: Test keyboard controls (`A`/`D`, `Space`/`W`, `R`) directly in the embedded canvas.
   - Step 6: Click header toggle icon `Show bottom panel`, select `Terminal`, and execute shell commands (`curl -I http://localhost:3000`, `ls -la`) to verify backend container state.

### D. Shown on Screen
- **00:00**: Left sidebar navigation showing `Design Studio PRO`, `Skills`, `Automations`, `Agents` (`Arcade Builder Agent`, `Market Research Agent`), active version badge `Buda v1.7.0 released`. Center input placeholder `e.g., Compare two versions of the employee handbook and list the changes...`, model selector `GPT-5.4`.
- **00:06**: User prompt: `Can you make me a simple browser platform game called Mushroom Jump? I want a cute side-scrolling game where a little character can move left and right, jump over blocks, collect coins, and reach a flag at the end. Please make it playable in the browser, save the files in a folder, and write a short game design note so I can understand how it works. When it's ready, send me the design note file so I can open it.`
- **00:12**: Agent tool execution recap: `Used 17 tools`, `Built it in /agent/mushroom-jump.app`, files listed (`index.html`, `style.css`, `script.js`, `DESIGN_NOTE.md`, `buda.app.json`), commit hash `070b353`, dev server script `/buda-web-preview Restart dev server on port 3000`.
- **00:18**: Attachment card: `DESIGN_NOTE.md text/markdown` with download and open icons.
- **00:22**: Markdown viewer in right pane rendering headings: `# Mushroom Jump - Design Note`, `What it is`, `Files`, `How the game works`.
- **00:28**: Right pane dropdown menu listing `Files`, `Local Browser`, `Terminal`, `Cloud Browser`, `Git`.
- **00:32**: Embedded `Local Browser` running Mushroom Jump HUD: `Coins: 0 / 11`, `Goal: Reach the flag`, `Controls: A or D to move, Space / W to jump, R to restart`.
- **00:43**: Bottom drawer toolbar listing tiles: `Files (Browse workspace files)`, `Local Browser (Preview local web apps)`, `Terminal (Run shell commands)`, `Cloud Browser (Use a hosted browser)`, `Git (Review code changes)`.
- **00:49**: Bottom shell terminal prompt: `agent@sandbox-530d7b88:~$ cd /agent/mushroom-jump.app && ls -la && curl -I http://localhost:3000` returning `HTTP/1.1 200 OK`, `Content-Type: text/html; charset=utf-8`.
- **01:06**: End screen: `Buda - Build Your Agent Company. No Mac Mini. No setup. No model keys. Try It Free - buda.im`.

### E. Said vs Shown Mismatches
- *Speaker says*: "Now I can actually move the cat, jump over blocks..." (00:32).
- *Screen shows*: The game character on screen is a small blue/white blob or mushroom-cap sprite jumping over blocks and collecting coins, not explicitly a feline/cat sprite (though stylized). Minor cosmetic speaking colloquialism.

### F. Failures and Recoveries
- *Agent self-correction noted in chat log* (00:14): "Design note: One small note: the preview URL checker script referenced by the sandbox docs wasn't present at `/agent/scripts/check-preview-url.mjs`, so I verified by starting the server and getting the preview URL directly." The agent encountered a missing utility script and recovered autonomously.

### G. Decision Points (IF -> THEN)
- **IF** the user clicks an emitted markdown artifact card in the chat stream: **THEN** open the right-side split pane into the markdown document renderer while retaining chat state.
- **IF** the user wants to test a web port running in the background: **THEN** switch right tab to `Local Browser` and click the enumerated port from `Open Ports`.
- **IF** low-level terminal inspection is needed during chat: **THEN** toggle the bottom panel to dock an interactive bash terminal beneath the chat without covering the conversation or the live preview.

### H. Tools, Repos, MCPs Named
- **Buda Agent Workbench** (`buda.im`): Cloud/hosted AI agent environment with sandboxed Linux runtime (`agent@sandbox-...`).
- **Arcade Builder Agent**: Specialized agent persona within Buda Design Studio.
- **Local Browser**: Built-in workbench webview/iframe previewer for local container ports.
- **Cloud Browser**: Workbench tool option for hosted remote browser automation.
- **Terminal**: Embedded interactive shell interface to sandbox.
- **Git Integration**: Built-in workbench tool for reviewing git diffs and commits.

### I. Challenges & Hype Check
- The claim "No Mac Mini. No setup. No model keys" targets users running local agent hardware (like dedicated Mac Minis). While cloud sandboxes eliminate local hardware config, latency, recurring subscription costs, and vendor lock-in for sandboxes are inherent tradeoffs compared to local bare-metal orchestration.

### J. Use for Jarvis
- **Workbench Docking Architecture for Jarvis Studio**: Evens's Mac operator can adopt this multi-pane pattern for Jarvis's desktop UI: Center pane for conversation/voice transcript, right pane dynamically toggling between HTML live DOM preview / rendered Markdown artifacts, and bottom collapsible drawer for Jarvis's active zsh session or background task logs.

### K. Open Questions
- Does the Local Browser support full DevTools (inspect DOM / network tabs) inside the workbench?
- How does the Buda sandbox handle external traffic egress or authentication if an agent builds an app requiring third-party APIs?
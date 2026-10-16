# LEARNED — 1ILapFgLf2E
Protocol: jarvis-signal-engine

### A. Source Map
- **00:00 - 00:20**: Introduction to JARVIS screen-aware AI assistant running via Claude Code and visual HUD overlay.
- **00:20 - 00:36**: Exploration of AI Workshop OS 3D Knowledge Brain visualization interface.
- **00:38 - 00:44**: Review of the `Jarvis-Screen-Starter-Pack.pdf` prompt pack detailing Python screenshot/pointer scripts and voice setup.
- **01:10 - 02:43**: Screen sharing original resume (Sr. Solutions Engineer at WePay) for live AI evaluation.
- **02:44 - 03:56**: JARVIS live critique and roast of resume formatting, missing impact metrics, and duty descriptions.
- **03:57 - 05:00**: JARVIS automatically rewrites resume into Google Docs and sends notification via Telegram.
- **05:01 - 06:00**: Inspection of newly rewritten resume ("Zubair Trabzada - Resume 2026") inside Google Docs.
- **06:01 - 06:45**: Architecture overview of underlying tools (Claude Code, localhost web server, custom Python screen guide).
- **06:46 - 08:25**: E-commerce style check on AllSaints $649 Luck Leather Jacket via screen share.
- **08:26 - 11:27**: YouTube channel review and roast of channel branding, banner, and bio.
- **11:28 - 13:33**: Automated Meta Ads Manager takeover ("JARVIS IS DRIVING") building a lead campaign from scratch.
- **13:34 - 15:03**: Walkthrough of Skool community (AI Workshop Lite) downloads, install PDFs, and ZIP bundles.

---

### B. Atomic Knowledge
1. **Screen Pointer Visual Feedback**
   - *Claim*: Python + Pillow script draws visible orange arrows with labels on desktop screenshots before displaying via macOS Preview.
   - *Why*: Gives the user clear visual verification of where the AI intends to click.
   - *Conditions*: Requires macOS `screencapture` binary and Python `Pillow` library.
   - *Evidence*: Shown on screen at 00:40 in `Jarvis-Screen-Starter-Pack.pdf` prompt 1.
   - *Label*: SOURCE

2. **Voice Narration via macOS CLI**
   - *Claim*: Spoken AI feedback runs natively using macOS `say` command without third-party cloud TTS API fees.
   - *Why*: Reduces latency and eliminates API cost for local voice narration during computer use driving.
   - *Conditions*: Requires macOS local text-to-speech voices installed.
   - *Evidence*: Shown on screen at 00:42 and 13:14 in PDF Prompt 3.
   - *Label*: SOURCE

3. **Localhost Screen Sharing Pipeline**
   - *Claim*: Real-time vision ingestion runs via local web app served on `http://localhost:4719` using standard Chrome tab/screen share permissions.
   - *Why*: Allows continuous visual input stream into Claude Code context.
   - *Conditions*: Browser tab must be selected via Chrome share picker dialog.
   - *Evidence*: Shown on screen at 02:06, 06:32, and 08:26.
   - *Label*: SOURCE

4. **Computer Use Execution Control & Emergency Stop**
   - *Claim*: Autonomous screen takeover actions (clicks, drags, scrolls, typing) are displayed in an execution feed panel with an immediate red "STOP" kill switch.
   - *Why*: Prevents runaway automated UI actions during Meta Ads Manager or desktop drive operations.
   - *Conditions*: Active computer use agent running via AppleScript / `clickclick` / System Events.
   - *Evidence*: Shown on screen at 12:44.
   - *Label*: SOURCE

---

### C. Procedures as Ordered Steps
#### Implementing Visual Pointer Helper (`screen-guide`)
1. Create local directory `screen-guide`.
2. Write Python script standard library + Pillow with two functions:
   - `shot`: Capture full screen with macOS `screencapture` to `screen-guide/latest.png`.
   - `point`: Accept `x`, `y` percentages + short text label, draw red-orange arrow with white outline pointing at target coordinate, output annotated image, and open in macOS Preview.
3. Add standing rule to project `CLAUDE.md` to trigger `shot` -> inspect -> `point` whenever user asks where to click.

#### Setting Up Native Spoken Feedback
1. Audition installed English voices using macOS `say` command.
2. Configure system prompt to append `say "<short summary>"` to command executions.
3. Implement quiet mode toggle (`quiet` -> silent mode, `narrate` -> voice enabled).

#### Granting Required OS Permissions on macOS
1. Navigate to **System Settings -> Privacy & Security -> Screen Recording**.
2. Enable toggle for the Terminal application running Claude Code (or iTerm / Terminal app).
3. Navigate to **System Settings -> Privacy & Security -> Accessibility**.
4. Enable toggle for the same Terminal application to permit mouse movement and keystroke simulation.

---

### D. Shown on Screen
- **00:00**: Original resume PDF titled "Zubair Trabzada - Sr. Solutions Engineer" next to circular J.A.R.V.I.S. HUD orb.
- **00:20**: AI Workshop OS 3D interactive knowledge graph with category filters (Skill Suites: 230, Local Businesses: 112, AI Workshop: 82, Zubair OS: 51, Claude Code: 48, YouTube Channel: 47, SEO Suite: 28).
- **00:40**: Prompt 1 ("The Pointer") specifications in `Jarvis-Screen-Starter-Pack.pdf` using Python + Pillow + `screencapture`.
- **00:42**: Prompt 3 ("The Narrator") specifications using macOS `say` command.
- **02:06**: Chrome tab selection dialog requesting screen share access for `http://localhost:4719`.
- **04:28**: Google Drive dashboard listing newly created doc `Zubair Trabzada - Resume 2026`.
- **04:54**: Rewritten resume in Google Docs formatted with: *Summary*, *Selected Work / Products* (CiteVue, Claude Code Skill Suites), and *Experience* (Sr. Solutions Engineer at WePay Inc.).
- **06:34**: E-commerce website AllSaints showing "LUCK LEATHER JACKET" ($649.00) black shirt-collar jacket.
- **11:00 - 12:00**: Meta Ads Manager campaign creation UI showing "New Leads Campaign" with $25.00 daily budget and Advantage+ setting.
- **12:44**: AI Workshop OS UI panel titled "JARVIS IS DRIVING" showing step-by-step low-level commands:
  - `type "AI Workshop - Skool Sign Up Campaign"`
  - `scroll down`
  - `left click at (170, 198)`
  - `triple click at (332, 222)`
  - `type "Skool Sign Up - Ad Set"`
  - `left click at (808, 407)`
  - Red button labeled **STOP**.
- **13:18**: PDF page 6/7 listing required macOS permissions: Screen Recording and Accessibility.
- **14:08**: Skool download resources: `JARVIS-V5-INSTALL-GUIDE.pdf`, `brain-jarvis-skill-v5-MAC.zip`, `brain-jarvis-skill-v5-WINDOWS.zip`.

---

### E. Said vs Shown Mismatches
- *Transcript missing*: The video contains no audio transcript text provided in the prompt metadata. All knowledge is extracted directly from visual contact sheets and frame analysis.
- *Tape numbers & prices*: All prices (e.g. $649 jacket, $25 daily ad budget) and system versions are visible on screen but unverified in spoken transcript audio.

---

### F. Failures and Recoveries
- **Permission refusal recovery**: If desktop screenshots return completely black or UI clicks fail to actuate, the system prompt instructs Claude to detect missing permissions and guide the user to macOS System Settings (Screen Recording / Accessibility).
- **Takeover emergency abort**: When autonomous screen driving strays or user wants manual control, user clicks the prominent red "STOP" button in the UI feed to immediately halt keystrokes/clicks.

---

### G. Decision Points (IF -> THEN)
- **IF** user asks "where do I click to...": **THEN** execute `screencapture`, find target UI control coordinates, run `point` helper to draw arrow, and display annotated screenshot in Preview.
- **IF** user says "quiet": **THEN** suppress macOS `say` spoken narration and execute commands silently.
- **IF** user says "narrate": **THEN** re-enable macOS `say` text-to-speech output.
- **IF** document rewriting completes: **THEN** save document to Google Drive, generate shareable link, and push instant notification via Telegram bot.

---

### H. Tools / Repos / MCPs Named
- **Claude Code**: Underlying CLI agent engine driving file operations, code execution, and tool calls.
- **AI Workshop OS**: Web-based 3D knowledge graph and HUD interface served locally.
- **Pillow (Python)**: Image processing library used to draw arrows and labels on screenshots.
- **macOS `screencapture`**: Native macOS command-line utility for capturing desktop screenshots.
- **macOS `say`**: Native macOS text-to-speech CLI binary.
- **AppleScript / System Events / `clickclick`**: OS-level UI automation tools used for mouse clicks and typing simulation.
- **Google Drive / Google Docs**: Document creation and cloud storage target for AI outputs.
- **Telegram API**: Mobile push notification delivery for task completion links.
- **Meta Ads Manager**: Web dashboard automated via computer use to set up ad campaigns.

---

### I. Challenges & Overfitting Risks
- **Screen coordinate drift**: Pixel percentage mapping (`x`, `y` percentages) can miss UI targets if window dimensions change or scaling differs.
- **Fragile web UI automation**: Direct click/type automation on Meta Ads Manager relies on fixed UI layouts, which break frequently when platforms update their web interface.
- **Security & Key safety**: Operating an agent with full mouse/keyboard accessibility requires strict safety boundaries to avoid unintended form submissions or financial commitments.

---

### J. Use for Jarvis
- **Screen Pointer Skill**: Implement `screen-guide` script on Evens's Mac so Jarvis can overlay guidance arrows on any app window.
- **Voice Feedback Integration**: Hook macOS native `say` binary into Jarvis's execution loop for instant spoken confirmation of background tasks.
- **Telegram Notification Bridge**: Configure Jarvis to send push links to Telegram whenever background Google Docs or research reports are generated.
- **Driving Control Panel**: Add an execution feed box with a global emergency stop button when running autonomous browser operations.

---

### K. Open Questions
- How does `localhost:4719` handle continuous frame capture latency during high-speed desktop interaction?
- What specific system prompt guardrails prevent the Meta Ads Manager driving script from accidentally publishing paid campaigns without explicit human review?
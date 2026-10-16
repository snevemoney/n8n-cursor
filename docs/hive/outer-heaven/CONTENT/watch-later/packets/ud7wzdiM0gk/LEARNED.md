# LEARNED — ud7wzdiM0gk
Protocol: jarvis-signal-engine

# Signal Analysis: Real-Life JARVIS Computer Control & Voice AI Assistant

## A. Source Map
- **00:00 - Cold Open: Full Screen Control Demo**: Visual demonstration of JARVIS driving Meta Ads Manager (`adsmanager.facebook.com`), highlighting active mouse navigation to the `+ Create` button while showing a circular status overlay (`J.A.R.V.I.S. DRIVING`).
- **00:23 - Meet JARVIS (Built With Claude Code)**: Introduction to the host platform running locally at `http://localhost:4719` featuring a 3D visual knowledge graph ("AI WORKSHOP OS") with active status indicators (`J.A.R.V.I.S. ONLINE`).
- **00:50 - Screen Starter Pack Walkthrough**: Breakdown of `Jarvis-Screen-Starter-Pack.pdf` detailing setup requirements (Claude Code + macOS), prompt architecture for pointing (`PROMPT 1 - THE EYES`), screen takeover (`PROMPT 2 - THE HANDS`), and voice narration (`PROMPT 3 - THE VOICE`).
- **01:38 - Screen Perception Mechanism**: Chrome screen-sharing dialog (`localhost:4719`) requesting tab, window, or full-screen access to inspect target applications.
- **01:56 - The AI Arrow Pointer**: On-screen visual aid pointing an arrow at specific interface targets (demonstrated on Instagram profile settings).
- **03:14 - Full Computer Takeover: Meta Ad Campaign**: JARVIS autonomously interacts with Meta Ads Manager UI, creating campaigns, configuring traffic ad sets, and filling ad details.
- **05:45 - Voice Narration Feedback**: JARVIS uses native system speech (`say` command on macOS) to report each action mid-execution.
- **07:14 - Safety & Permission Guardrails**: Safety rules enforced in `CLAUDE.md` prevent financial execution, leaving ad campaigns strictly in draft status.
- **08:44 - Second Brain Knowledge Integration**: Interacting with the 3D node graph to pull context from stored notes and local knowledge bases.
- **10:44 - Voice Note to Invoice Workflow**: Telegram voice message processing linked to lead data in Google Sheets (`Leads` sheet), generating invoice PDFs and editable documents.
- **12:46 - Tool Armory Capabilities**: Visual hub showcasing built-in integration cards for Gmail, Google Calendar, Google Drive, Sheets, Docs, Zapier, Canva, Stripe, GitHub, etc.
- **13:35 - Phone Line & Inbound Calls**: Explanation of telephony integration and caller ID whitelisting for voice agent phone access.
- **14:40 - Prompt Pack & Community Resources**: Guided tour of Skool community resources (`aiworkshop-lite` and paid tier), prompt download files, and installation guides.
- **16:19 - Future Roadmap**: Introduction of SPARK (AI Social Media Employee) and community feature voting polls.

---

## B. Atomic Knowledge
1. **Claim**: Claude Code can control macOS mouse and keyboard using simple scripts without complex third-party vision frameworks.
   - **Why**: Uses native macOS `screencapture` CLI combined with AppleScript / System Events or `clickclick` helper tools.
   - **Conditions**: macOS permissions granted for Screen Recording and Accessibility in System Settings.
   - **Evidence**: `Jarvis-Screen-Starter-Pack.pdf` page 3 and 6 (`sheet_001.jpg` [00:52, 00:58], [14:50]).
   - **Label**: SOURCE

2. **Claim**: On-screen guidance can point an arrow at precise pixel locations without modifying target web app code.
   - **Why**: Python helper script (`screen-guide`) captures full screen into `latest.png`, calculates relative coordinates (x, y %), renders a red-orange arrow with label overlay using Pillow, and displays it via macOS Preview.
   - **Conditions**: Python with Pillow installed; screenshot captured before drawing overlay.
   - **Evidence**: `Jarvis-Screen-Starter-Pack.pdf` page 2 ([14:48]).
   - **Label**: SOURCE

3. **Claim**: AI computer agents require explicit draft-only safety rules to prevent unauthorized financial or destructive actions.
   - **Why**: Without hard refusals, agents executing browser actions could trigger payments or publishing buttons.
   - **Conditions**: Safety ground rules specified directly inside `CLAUDE.md` under strict refusal guidelines.
   - **Evidence**: Meta Ads campaign creation left explicitly in "In draft" state ([07:46], [08:44]); prompt safety instructions ([00:52]).
   - **Label**: SOURCE

4. **Claim**: A local web interface on `localhost:4719` can act as an orchestrator control plane for Claude Code skills.
   - **Why**: Provides visual feedback (3D graph, status ring, tool catalog) while connecting backend execution scripts to local storage and APIs.
   - **Conditions**: Browser sharing tab/screen to `localhost:4719` web server.
   - **Evidence**: UI visible at `localhost:4719` across multiple frames ([00:24], [01:42], [12:46], [14:56], [16:04]).
   - **Label**: SOURCE

---

## C. Procedures as Ordered Steps
### Procedure 1: Setting Up Screen Control & Guidance in Claude Code
1. Grant macOS system permissions under `System Settings -> Privacy & Security` for **Screen Recording** and **Accessibility** to Terminal / iTerm / Claude Code.
2. Create a local folder named `screen-guide` and configure a Python helper script with Pillow.
3. Implement a `shot` function to trigger native `screencapture screen-guide/latest.png`.
4. Implement a `point` function accepting `x` and `y` percentage coordinates and label text to draw a red-orange arrow with a white outline landing on the target spot, opening `latest.png` in macOS Preview.
5. Append standing prompt rules into `CLAUDE.md` specifying trigger phrases (e.g., "where do I click to...").

### Procedure 2: Configuring Safety Guardrails (`CLAUDE.md` Hands Rules)
1. Open `CLAUDE.md` in the project root directory.
2. Add rule: Require phrase trigger ("take over and...") before driving UI.
3. Add rule: Require screenshot capture and displaying a 3-4 step plan before touching controls.
4. Add rule: Execute one step at a time (screenshot -> analyze -> act -> speak status line).
5. Add rule: Immediately cease all inputs upon typing or speaking "stop".
6. Add rule: Hard refusal on payments, card details, passwords, file deletions, or sending messages without prior human draft confirmation.

### Procedure 3: Installing JARVIS Skill Pack via Claude Code
1. Download the skill zip archive (`brain-jarvis-skill-v6-MAC.zip`) into `~/Downloads` without unzipping.
2. Open Claude Code terminal interface.
3. Input command: `Install the Jarvis skill from my Downloads (v6 zip)`.
4. Allow Claude Code to unpack dependencies, set up local configuration, and provide localhost dashboard URL (`localhost:4719`).

---

## D. Shown on Screen
- **00:00**: Meta Ads Manager (`adsmanager.facebook.com/adsmanager/manage/campaigns...`), showing campaign list, cursor on `+ Create`, bottom-right widget `J.A.R.V.I.S. DRIVING`.
- **00:24**: AI WORKSHOP OS (`http://localhost:4719`), dark-mode 3D force-directed node graph, left inspector sidebar ("Skill Suites", "Local Businesses", "Claude Code", etc.), bottom bar with prompt shortcuts, right widget `J.A.R.V.I.S. ONLINE`.
- **00:50 - 01:02**: macOS Preview showing `Jarvis-Screen-Starter-Pack.pdf` pages 2 to 6 with text for Pointer script, Careful Driver rules, Narrator prompt, 5 trial commands, and macOS permission switches.
- **01:42**: Chrome tab share popup listing available tabs: Ads Manager, Instagram, Invoice PDF, Google Sheets, Google Calendar.
- **01:52**: Instagram profile view (`instagram.com/zubair_trabzada`), bottom-right voice activity widget `J.A.R.V.I.S. SPEAKING`.
- **04:24**: Meta Ads Manager - Traffic Ad Set setup screen with conversion location set to "Message destinations", daily budget inputs, mouse hovering on bottom-right `Next` button.
- **07:46**: Meta Ads Manager Ads tab showing created ad "New Traffic Ad" with status badge "In draft" and green alert bar "All edits saved."
- **08:44**: AI WORKSHOP OS 3D Brain graph with lower subtitle overlay displaying assistant speech transcript regarding draft safety.
- **12:16**: Google Drive PDF viewer displaying `Invoice INV-2026-005 - AI Reputation Manager Build` addressed to Mike Johnson for $2,500.
- **12:38**: Google Sheets spreadsheet titled `Leads` containing columns: `Date`, `Name`, `Company`, `Service`, `Quoted`, `Status`, `Follow-up`, `Phone`, `Email`.
- **12:46**: "Tool armory" grid view (`localhost:4719`) showing cards for Canva, Gmail, Google Calendar, GitHub, Notion, Google Sheets, Google Drive, Google Docs, Zapier, Figma, Webflow, Wix, Airtable, monday.com, ClickUp, Dropbox, Vercel, Netlify, Cloudinary, Linear, PayPal, Square, Stripe, Hugging Face, Cloudflare docs.
- **14:48 - 14:52**: `Jarvis-Screen-Starter-Pack.pdf` showing code snippets for Python `screen-guide` script and rule listings.
- **15:10 - 16:28**: Skool community interfaces (`skool.com/aiworkshop-lite` and `/aiworkshop`) showing course classrooms, PDF downloads (`Jarvis-Phone-Starter-Pack.pdf`, `JARVIS-Prompt-Pack`, `AI-Debate-Night-Prompt-Pack.pdf`, `Jarvis-V6-Install-Guide.pdf`), posts about SPARK social media employee, and community polls.

---

## E. Said vs Shown Mismatches
- **Audio Transcript Missing**: No verbatim spoken transcript provided in raw text; analysis is grounded directly in on-screen UI text, visible documents, overlays, and description metadata.
- **Draft vs Execution**: The video title claims "I Gave JARVIS Full Control... takes over my computer", but visual evidence at 07:46 and 08:44 shows JARVIS intentionally stops short of publishing or spending money, saving campaigns as draft.

---

## F. Failures and Recoveries
- **Permission Failures (macOS Security)**: Initial screen capture or input simulation fails if macOS permissions are missing. **Recovery**: `Jarvis-Screen-Starter-Pack.pdf` page 6 explicitly guides user to enable Screen Recording and Accessibility under System Settings ([00:58]).

---

## G. Decision Points (IF -> THEN)
- **IF** prompt contains "where do I click to [action]", **THEN** run `screencapture`, analyze layout, calculate x/y coordinates, run `point` script with label pill, and open overlay image in Preview ([00:56], [14:48]).
- **IF** command contains "take over and [task]", **THEN** switch to drive mode, post a 3-4 step plan, and execute one screenshot-action step at a time ([00:52], [14:50]).
- **IF** operator types or says "stop", **THEN** immediately release mouse/keyboard control and return hands to lap ([00:52], [00:56]).
- **IF** an action involves payments, bank details, passwords, deleting files, or publishing live ad campaigns, **THEN** stop at draft state and explicitly prompt human for manual confirmation ([00:52], [08:44]).
- **IF** operator requests voice updates, **THEN** execute system command `say "[short update line]"` during steps ([00:54]).

---

## H. Tools / Repos / MCPs Named
- **Claude Code**: CLI AI coding agent used to run backend scripts, execute AppleScript, and drive browser/computer UI.
- **AI WORKSHOP OS**: Custom web UI dashboard running at `localhost:4719` for visual knowledge node navigation and skill status tracking.
- **Python (`Pillow`)**: Used in `screen-guide` script to draw pointing arrows and pill overlays on desktop screenshots.
- **macOS `screencapture`**: Built-in CLI tool for full-screen image capture.
- **macOS `say`**: Built-in CLI TTS engine for real-time audible narration.
- **AppleScript / System Events / `clickclick`**: OS automation utility for programmatically clicking and typing.
- **Meta Ads Manager**: Web application automated by JARVIS to create traffic ad campaigns.
- **Google Sheets / Drive / Docs**: Cloud office tools used for storing leads and rendering generated invoice documents.
- **Telegram**: Messaging client used for receiving voice notes to trigger automated invoice generation workflows.
- **Skool**: Community platform (`aiworkshop-lite` / `aiworkshop`) hosting downloadable prompt packs, install guides, and skill zips.

---

## I. Challenges & Technical Risks
- **Resolution & Scaling Vulnerability**: Absolute pixel coordinate calculation based on percentages can misalign if desktop display scaling, browser zooming, or window positioning changes between screenshot and click action.
- **OS Dependency**: The pointer and input automation heavily rely on macOS specific utilities (`screencapture`, `say`, AppleScript). Running on Windows requires swapping helpers to PowerShell or Python `pyautogui`.
- **Latency**: Capturing a full-screen screenshot, feeding it back to Claude Code, generating coordinates, drawing an overlay, and opening Preview introduces multi-second delays per interaction step.

---

## J. Use for Jarvis (Mac Operator Application)
- **Local UI Navigation Visualizer**: Implement the Python `screen-guide` script pattern so Jarvis can annotate screenshots with arrows when assisting human operators on complex macOS UI tasks.
- **`CLAUDE.md` Guardrail Pattern**: Adopt explicit hard refusal rules in project root markdown files to ensure automated tasks (browser control, API calls) freeze before triggering destructive or payment actions.
- **Native TTS Feedback Loop**: Integrate `say` CLI calls into Jarvis execution loops for rapid, low-latency audio status updates during long background computer-use tasks.
- **Local Skill Distribution**: Package multi-file agent routines into zip archives that can be installed on local machines with a single plain-English prompt to Claude Code.

---

## K. Open Questions
- What exact coordinate detection model or prompt logic is used inside Claude Code to accurately calculate x/y percentages from the raw desktop screenshot?
- How does the telephony integration route inbound phone calls into the local Claude Code environment while maintaining real-time latency?
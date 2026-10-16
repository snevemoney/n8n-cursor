# LEARNED — Acw0NtkyNtM
Protocol: jarvis-signal-engine

### A. Source map
- **00:00**: Intro demonstration of JARVIS 3D Knowledge Graph visual interface running on `localhost:4719`.
- **00:56**: Overview of the JARVIS architecture and V1 Starter Pack requirements (`Jarvis-V1-Starter-Pack.pdf`).
- **01:21**: Explanation of model brain switching capabilities (Opus, Fable, Grok, GPT).
- **01:42**: Demonstration of hands-free continuous listening mode with wake word detection ("Jarvis").
- **02:28**: Local notes file search demonstration and 3D node highlight.
- **03:07**: Phone call dispatch and restaurant reservation workflow.
- **04:25**: Google Calendar integration and morning schedule briefing.
- **05:25**: Telegram bot voice command trigger for client invoice creation.
- **06:08**: Automated creation of invoice PDF in Google Drive, lead matching in Google Sheets CRM, and draft email creation in Gmail.
- **08:10**: Web screen sharing mode allowing JARVIS to inspect browser tabs visually.
- **09:07**: Walkthrough of downloading the free prompt pack on Skool AI Workshop Lite.
- **09:56**: Paid AI Workshop community tier overview and build conclusion.

### B. Atomic knowledge
- **Claim**: JARVIS V1 voice assistant can be bootstrapped in 20 minutes using 5 sequential prompts pasted into Claude Code.
  - **Why**: Claude Code acts as an agentic compiler, creating local server code, voice loops, and persistent file logging without manual coding.
  - **Conditions**: Requires Claude Code CLI, Google Chrome browser (for Speech Recognition/Synthesis APIs), and an Anthropic API Key.
  - **Evidence**: Shown in `Jarvis-V1-Starter-Pack.pdf` on frames 00:56, 01:00, 10:22.
  - **Label**: SOURCE

- **Claim**: Continuous hands-free listening and wake-word activation can be added to Chrome web apps via Web Speech API integration.
  - **Why**: Google Chrome natively supports continuous speech recognition listening loops.
  - **Conditions**: Requires active browser microphone permission and keyword checking against speech transcripts.
  - **Evidence**: Shown in prompt Step 2 on frame 09:00.
  - **Label**: SOURCE

- **Claim**: Long-term persistent memory can be maintained across sessions using a structured local Markdown file (`jarvis-memory.md`).
  - **Why**: Reading and writing plain text markdown files allows lightweight, transparent, and portable memory persistence.
  - **Conditions**: Explicit memory commands (e.g., "remember...") append entry timestamps and text directly to the file.
  - **Evidence**: Shown in prompt Step 3 on frame 09:00.
  - **Label**: SOURCE

- **Claim**: Telegram voice/text messages can trigger remote Mac workflow automations such as CRM lead lookup and PDF invoice generation.
  - **Why**: Telegram bot webhooks pass user commands to local backend services that query Google Sheets and create PDFs on Google Drive.
  - **Conditions**: Active Telegram Bot token generated via BotFather and local service listening for incoming messages.
  - **Evidence**: Shown on frames 00:24, 06:04, 06:28.
  - **Label**: SOURCE

### C. Procedures as ordered steps
#### Building JARVIS V1 Base Brain
1. **Environment Setup**: Install Claude Code CLI and Google Chrome on Mac. Obtain an Anthropic API key from `console.anthropic.com`.
2. **Step 1 - Base Application**: Open Claude Code in a clean folder and paste Prompt 1 to build the local web UI (`localhost:4719`) and 3D knowledge graph visualizer.
3. **Step 2 - Hands-free Voice Loop**: Paste Prompt 2 into Claude Code to enable continuous speech listening, wake-word activation ("Jarvis"), and Chrome microphone permissions instructions.
4. **Step 3 - Long-term Memory**: Paste Prompt 3 into Claude Code to instruct the system to read and write to `jarvis-memory.md` upon hearing "remember...".
5. **Step 4 - Butler Personality**: Paste Prompt 4 into Claude Code to implement time-aware greetings ("Good morning, sir" or "Burning the midnight oil, sir?") and contextual notes memory checks.
6. **Step 5 - Customization**: Paste Prompt 5 to customize assistant name, add visual theme toggles ("change your look" -> emerald, gold, crimson), and speech voice toggles ("change your voice").

### D. Shown on screen
- **Web UI (`localhost:4719`)**: Named `AI WORKSHOP OS` (built with Claude Code). Features a 3D Force-directed node graph representing notes, tools, and skills.
- **UI Controls**: Category filters (`Router`, `Wiki`, `Concepts`, `Suites`, `Skills`, `Tools`, `Worlds`, `Notes`, `Files`), HUD forces sliders (`Repel`, `Line length`), HUD status orb labeled `J.A.R.V.I.S.` with state indicators (`#LISTENING`, `#SPEAKING`, `#ONLINE`), and model selector badge (`OPUS-5`).
- **Documents Shown**: `Jarvis-V1-Starter-Pack.pdf` (7-page prompt guide), `2026-08-06-INV-2026-006-mike-johnson.pdf` (AI Reputation Manager invoice for $2,500), `Jarvis-Phone-Starter-Pack.pdf`.
- **External Apps**: Telegram Desktop (`@jarvis_bot`), Google Sheets (`Leads` CRM table with columns `Date`, `Name`), Google Drive viewer, Gmail (`in:draft`), Google Chrome browser share modal.
- **Community Pages**: Skool community pages at `skool.com/aiworkshop-lite` and `skool.com/aiworkshop` featuring courses like "AI 2nd Brain", "Claude Code Masterclass", and "AI Assistants & AI Employees".

### E. Said vs shown mismatches
- **Transcript Absence**: No audio transcript provided in source input.
- **Model Nomenclature**: Description and video title refer to "Claude Fable 5", whereas the on-screen UI badge specifically displays `OPUS-5`.
- **Brain Hot-Swapping**: Description claims mid-conversation model hot-swapping to Grok or GPT, but visual frames show a fixed model dropdown and badge UI without demonstrating an active mid-conversation model switch.

### F. Failures and recoveries
- **Failure**: Speech recognition or page functionality breaks due to browser permission blocks or environment variations across operating systems.
- **Recovery**: Prompt pack explicitly includes a conversational recovery rule: instruct users not to debug code manually, but rather paste error symptoms directly back into Claude Code: *"Something's wrong with my Jarvis. Here's what happened: [describe it]. Fix it."*

### G. Decision points (IF -> THEN)
- **IF** speech transcript contains "remember [statement]", **THEN** parse statement, append entry with current timestamp to `jarvis-memory.md`, and confirm action in butler voice.
- **IF** user speaks "change your look", **THEN** cycle the central HUD status orb color through emerald, gold, and crimson.
- **IF** user speaks "change your voice", **THEN** cycle through the top 3 local TTS English voices registered in Google Chrome.
- **IF** Telegram bot receives invoice request for lead name (e.g., "Mike Johnson"), **THEN** query Google Sheets `Leads` table, generate custom PDF invoice on Google Drive, reply in Telegram with download link, and generate draft email in Gmail.

### H. Tools/repos/MCPs named
- **Claude Code**: CLI tool used as the primary software engineer to build and run the assistant backend.
- **Google Chrome**: Web browser providing Speech Recognition and Speech Synthesis Web APIs.
- **Telegram Desktop / BotFather**: Messaging framework for receiving remote voice/text commands.
- **Google Drive / Google Sheets / Gmail / Google Calendar**: Cloud productivity applications integrated for invoice hosting, lead tracking, email drafting, and schedule management.
- **Skool**: Community platform used to distribute prompt starter packs.

### I. Challenges
- **Marketing Hype**: Synthetic model names ("Claude Fable 5") are used in titles and descriptions for engagement.
- **Browser API Dependency**: Dependence on Chrome's Web Speech API means speech recognition behavior varies across browsers and operating systems.

### J. Use for Jarvis
- **Persistent Memory Strategy**: Adopt `jarvis-memory.md` file append architecture for Evens's Mac operator to preserve session context across restarts.
- **Telegram Remote Dispatch**: Implement Telegram bot webhook listeners on Mac to trigger local CLI automations and draft generation while away from desk.
- **3D Graph Dashboard**: Host a local node graph UI (`localhost`) displaying active operator skills, file connections, and visual voice state.

### K. Open questions
- What backend framework (Node.js, Express, or Python) does Claude Code generate by default to host the `localhost:4719` web socket server?
- What exact vision model API endpoint processes live browser tab content during the screen share mode?
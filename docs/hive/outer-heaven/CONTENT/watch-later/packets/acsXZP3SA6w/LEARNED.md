# LEARNED — acsXZP3SA6w
Protocol: jarvis-signal-engine

# Learned Knowledge Map: JARVIS Multilingual Assistant (Claude Code + Web Speech + Retell AI)

## A. Source map
- **00:00 - 00:27**: Teaser & Intro. Demonstration of JARVIS 3D brain UI running on `localhost:4719` responding in multiple languages.
- **00:27 - 00:58**: What's new in update. Voice language switching across 16 languages while keeping user input in English.
- **00:58 - 01:28**: Interface overview and walkthrough of the Multilingual Prompt Pack PDF ("Your JARVIS in Sixteen Languages").
- **01:28 - 03:11**: Spanish Demo. Querying 3D memory node graph (`social-media-automation`), receiving spoken Spanish voice response.
- **03:11 - 04:22**: German Demo (Calendar & Tools). Switching voice target to German ("DEUTSCH"), executing Google Calendar query for October 7, 2026.
- **04:22 - 06:20**: Screen Share Translation (German). Sharing Chrome tab with Berlin tourism brochure in ChatGPT image view; JARVIS translates content into German.
- **06:20 - 08:39**: Live Spanish Brochure Translation. Sharing screen tab of Valencia brochure ("BIENVENIDO A VALENCIA"); extracting historical and travel highlights.
- **08:39 - 09:09**: Value proposition of living in target language with localized TTS voice and global system context.
- **09:09 - 10:39**: Phone Calls and AI Agents. Reviewing Retell AI agent dashboard (`dashboard.retellai.com`) showing `Jarvis - Hotline` with phone number integration (+15105183164).
- **10:39 - 11:27**: Hindi and Arabic live voice switching demos.
- **11:27 - 12:27**: Prompt Pack Architecture breakdown: Prompt 01 (Foundation / Indexer / Server / Brain), Prompt 02 (Speech / Web Speech API + 900ms buffer), Prompt 05/06 (Sight / `/see` endpoint snapshot).
- **12:27 - 13:08**: Community access via Skool (`aiworkshop-lite` and `aiworkshop`).
- **13:08 - 13:30**: Wrap-up and summary.

## B. Atomic knowledge
- **Claim**: Web speech recognition requires a timer-based buffer (`FINISH_MS = 900`) rather than firing immediately on the first final result.
  - **Why**: Users natural pause mid-sentence; immediate dispatch cuts off user input prematurely.
  - **Conditions**: Browser-based speech recognition (`webkitSpeechRecognition`).
  - **Evidence**: Prompt 02 documentation shown at 00:50 and 11:48.
  - **Label**: SOURCE
- **Claim**: Screen vision is efficiently handled by grabbing a single frame snapshot from `getDisplayMedia` to canvas and POSTing to `/see` rather than continuous video streaming.
  - **Why**: Drastically reduces LLM vision API token consumption and request bandwidth while retaining full visual context at query time.
  - **Conditions**: User initiates screen share tab in browser.
  - **Evidence**: Prompt 05/06 documentation shown at 00:54 and 11:52.
  - **Label**: SOURCE
- **Claim**: Video title claims "GPT-6 Astra", but the system actively runs on Claude Opus 3.5.
  - **Why**: UI model badge explicitly displays `OPUS 3.5` and prompt configuration specifies `model: claude-opus-3-5`.
  - **Conditions**: All system executions shown in video.
  - **Evidence**: Frame 00:00, 00:50 (`config.json`), 04:22 UI badge.
  - **Label**: SOURCE
- **Claim**: Retell AI interface hosts single-prompt autonomous phone agents integrated into the JARVIS suite.
  - **Why**: Allows outbound/inbound phone calls (e.g. `Jarvis - Hotline`) tied to dedicated phone numbers.
  - **Conditions**: Retell AI account linked to backend.
  - **Evidence**: Frame 09:50 Retell AI dashboard UI.
  - **Label**: SOURCE

## C. Procedures as ordered steps
1. **Building the 3D Knowledge Galaxy & Brain (Prompt 01)**:
   1. Execute `build.py` (Python 3 standard library) to scan local `.md` files in target notes folder.
   2. Extract node metadata (title, parent folder, wikilinks, 700-char excerpt) and write to `viewer/graph-data.js`.
   3. Launch `server.py` on port 4719 bound to `127.0.0.1` to serve the single-page viewer.
   4. Create `config.json` specifying `anthropic_api_key` and `model: claude-opus-3-5`.
   5. Implement `/chat` POST endpoint to score notes by keyword overlap and pass top excerpts to Anthropic API.

2. **Configuring the Speech Layer (Prompt 02)**:
   1. Bind output voice playback to Web Speech API (`window.speechSynthesis`).
   2. Bind microphone input listening to `webkitSpeechRecognition`.
   3. Set `FINISH_MS = 900` buffer timer. When speech pauses, append text to buffer and restart timer; dispatch to `/chat` only when 900ms elapses without new audio input.
   4. Implement `?mute=1` URL flag check inside the unified `speak()` function to enable silent testing.

3. **Executing Screen Tab Vision Analysis (Prompt 05 / 06)**:
   1. Click browser screen share button to invoke `getDisplayMedia`.
   2. When user speaks a query while screen sharing is active, draw current video frame to an off-screen HTML canvas.
   3. Encode canvas content as JPEG/PNG image data.
   4. POST image data + query text to `/see` server endpoint.
   5. Query Claude Vision API with image payload and stream response back to localized voice TTS.

## D. Shown on screen
- **Local Web App Interface (`localhost:4719`)**: Dark theme 3D interactive force-directed graph (using `3d-force-graph` CDN). Title header "AI WORKSHOP OS - 3D Brain".
  - Left Sidebar: Top Hubs (Skill Suites [239], Local Businesses [123], AI Workshop [62], Zubair OS [51], Claude Code [47], YouTube Channel [41], SEO Suite [39], Build and Sell series [37]).
  - Right HUD: "3.A.R.V.I.S.", status chip ("LISTENING", "SPEAKING"), model selector ("OPUS 3.5"), language selection chip ("ESPAÑOL", "DEUTSCH"), toggle buttons (EYES, WATCH, HOLO, FOCUS, REFLEX).
- **Google Calendar UI (`calendar.google.com`)**: Week view of October 4–10, 2026. Wednesday Oct 7 events: "AI Workshop - Weekly Team Sync" (12:30–1:15pm), "Busy" (3–4pm), "Gym" (5–6pm).
- **ChatGPT Image Previewer**: Displaying trifold PDF brochures for Berlin travel ("BERLIN - EINE STADT VIELE MÖGLICHKEITEN") and Valencia travel ("BIENVENIDO A VALENCIA").
- **Retell AI Dashboard (`dashboard.retellai.com`)**: Agent list showing `Jarvis - General`, `Jarvis - Inquiry`, `Jarvis - Booking`, `Jarvis - SMS`, `Jarvis - Hotline` (+15105183164), `PipePro Plumbing`, `CoolFlow HVAC`.
- **PDF Prompt Pack Document**: "Your-Jarvis-in-Sixteen-Languages-Prompt-Pack" featuring structured system prompts.

## E. Said vs shown mismatches
- **Model Naming Mismatch**: Video title claims "GPT-6 Astra", but the running code, `config.json` snippet (00:50), and UI badges (00:00, 04:22) all show Anthropic `claude-opus-3-5`. "GPT-6 Astra" is purely promotional title text.

## F. Failures and recoveries
- **Speech Truncation Failure**: Default web recognition fires prematurely on short pauses during long thoughts.
- **Recovery**: Implemented a 900ms buffered silence window (`FINISH_MS`) that restarts the timer upon receiving intermediate transcripts, delaying full sentence dispatch until the user completely stops speaking.

## G. Decision points (IF -> THEN)
- **IF** user selects a language chip (e.g. "DEUTSCH") or utters a language switch command -> **THEN** set internal language variable, instruct Claude prompt to respond in that language, and pick the matching Web Speech API native voice.
- **IF** URL includes `?mute=1` -> **THEN** bypass audio output synthesis in `speak()` while continuing to log UI text responses.
- **IF** a question is submitted while screen sharing is active -> **THEN** capture canvas frame snapshot and route payload to `/see` vision endpoint instead of standard text `/chat`.

## H. Tools/repos/MCPs named
- **Claude Code**: CLI tool used to author and iterate system code/prompts.
- **Web Speech API (`window.speechSynthesis`)**: Browser API for localized TTS audio playback.
- **`webkitSpeechRecognition`**: Browser API for microphone speech-to-text input.
- **3d-force-graph**: CDN JavaScript library for 3D force-directed knowledge graph visualization.
- **Retell AI**: Web platform (`dashboard.retellai.com`) for hosting voice call/SMS AI agents.
- **Google Calendar API / MCP**: Calendar integration for reading scheduled events (`gcal_events`).
- **Skool**: Community hosting platform for template distributions (`aiworkshop-lite`, `aiworkshop`).

## I. Challenges (what may be wrong, outdated or hype)
- Title claims of non-existent models ("GPT-6 Astra").
- `webkitSpeechRecognition` is Chrome-specific and lacks full cross-browser support compared to Whisper API.
- Hardcoded `localhost:4719` local server setup requires manual Python setup and API key management.

## J. Use for Jarvis
- Evens can build a native 3D browser interface on Mac (`localhost:4719`) using Python + `3d-force-graph` to visualize memory notes.
- Incorporate canvas snapshotting via Chrome tab share (`getDisplayMedia`) to send low-cost visual frames to vision API.
- Add 900ms speech buffering to browser voice UI to eliminate mid-sentence voice input cutting.

## K. Open questions
- How is tool calling (Google Calendar / web searches) dispatched from the client viewer to local backend execution scripts?
- Does Retell AI bridge directly into the local Python backend or operate as an independent cloud service?
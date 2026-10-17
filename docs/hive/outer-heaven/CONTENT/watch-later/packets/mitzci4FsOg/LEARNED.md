# LEARNED — mitzci4FsOg
Protocol: jarvis-signal-engine

### A. Source Map
- **00:00 - 00:50**: JARVIS vision test roasting Apple's foldable iPhone concept page.
- **00:50 - 01:21**: System overview of JARVIS upgraded with GPT-6 Astra / OpenRouter integration.
- **01:22 - 02:12**: Interactive 3D Second Brain tour (485/522 notes visualized in 3D space at `localhost:4719`).
- **01:08 - 01:16**: Detailed prompt pack walkthrough (`Build-Your-Own-Jarvis-GPT-6-Astra-Prompt-Pack.pdf`).
- **02:13 - 02:46**: Hands-free wake word mode and voice search across local markdown notes.
- **02:47 - 03:28**: Voice-based semantic file search and immediate summarization.
- **03:29 - 05:12**: Live web research by voice with floating JARVIS browser overlay HUD.
- **05:13 - 05:31**: Camera vision mode ("JARVIS Eyes") watching user setup and environment.
- **05:32 - 06:49**: Tool Armory UI tour showing native integrations and MCP endpoint input.
- **06:50 - 08:00**: Focus Lock demo: tab lock, 30-minute target timer, and automated drift callouts.
- **08:01 - 08:52**: Gmail and Google Calendar tool actions executed mid-conversation.
- **08:53 - 09:26**: Telegram bridge demo for remote voice/text assistant control.
- **09:27 - 10:56**: Automated invoice drafting and PDF rendering in Google Drive.
- **10:57 - 11:46**: Step-by-step breakdown of prompt pack prompts 01, 02, 04, and 16.
- **11:47 - 12:36**: Walkthrough of Skool AI Workshop classroom modules and installer.
- **12:37 - 12:50**: Outro and community invite.

### B. Atomic Knowledge
- **Claim**: Core assistant mechanics (Focus Lock, Tab Lock, Camera Vision, Telegram bridge) operate independently of the underlying LLM model.  
  - **Why**: Scripts use standard Web APIs and local Python wrappers rather than model-specific code.  
  - **Conditions**: Browser support for Web Speech API and Web MediaDevices.  
  - **Evidence**: On-screen prompt pack page 3 explicit note stating mechanics work with any brain model.  
  - **Label**: SOURCE

- **Claim**: Web Speech API recognition must use a trailing debounce timer (`FINISH_MS` ~900ms) to avoid mid-sentence cutoffs.  
  - **Why**: Speech recognition dispatches premature final results when users pause mid-thought.  
  - **Conditions**: Browser-native `webkitSpeechRecognition`.  
  - **Evidence**: Prompt 02 code spec shown on screen at 01:12.  
  - **Label**: SOURCE

- **Claim**: Local markdown files can be indexed into an interactive 3D graph visualizer without external build frameworks.  
  - **Why**: Python standard library generates a lightweight JS data object (`graph-data.js`) rendered via `3d-force-graph` CDN.  
  - **Conditions**: Markdown directory structure with `[[wikilinks]]` or parent folder grouping.  
  - **Evidence**: Prompt 01 spec shown on screen at 01:10.  
  - **Label**: SOURCE

### C. Procedures as Ordered Steps
1. **3D Knowledge Galaxy Setup**:
   - Step 1: Place markdown notes inside a `./notes` directory.
   - Step 2: Run `build.py` (Python 3 standard library) to scan notes, extract titles/wikilinks/categories, and output `viewer/graph-data.js` containing `const GRAPH = {nodes: [...], links: [...]}`.
   - Step 3: Launch `server.py` on port 4719 serving `viewer/index.html`.
   - Step 4: Open `http://localhost:4719` in Chrome to render 3D starfield force graph via CDN.

2. **Voice Control & Speech Debounce Configuration**:
   - Step 1: Initialize `webkitSpeechRecognition` on microphone button click.
   - Step 2: Intercept incoming transcript chunks and append to an active speech buffer.
   - Step 3: Set a restartable timer constant `FINISH_MS = 900` on each incoming speech chunk.
   - Step 4: Dispatch full sentence to `/chat` POST endpoint only when `FINISH_MS` expires without new audio.
   - Step 5: Check URL query string for `mute=1`; if present, bypass `speechSynthesis` playback.

### D. Shown on Screen
- **00:00 - 00:04**: Chrome browser at `localhost:4719` displaying dark-mode 3D graph visualizer with category tags (Router, Wiki, Concepts, Suites, Skills, Tools, Worlds, Notes, Files) and JARVIS HUD widget on the right panel.
- **01:08 - 01:14**: PDF document `Build-Your-Own-Jarvis-GPT-6-Astra-Prompt-Pack.pdf` showing Prompt 01 (Foundation), Prompt 02 (Speech), Prompt 04 (Butler character prompt), and model cost comparison table ($10/M input, $50/M output).
- **05:32**: Tool Armory grid interface on `localhost:4719` featuring buttons for Gmail, Google Calendar, GitHub, Notion, Google Sheets, Google Drive, Google Docs, Zapier, Canva, Figma, Webflow, Wix, Airtable, monday.com, ClickUp, Dropbox, Vercel, Netlify, Cloudinary, Linear, PayPal, Square, Stripe, Hugging Face, Cloudflare docs, and custom MCP URL connection box.
- **06:50**: Screen share authorization popup in Chrome selecting screen source for live drift tracking.
- **06:54**: Top-right floating Focus Lock overlay HUD with timer counter (`29:58 FOCUS`), avatar thumbnail, and tab lock controls.
- **07:38**: Upper-right notification panel logging call activity: `Call to Zubair - voicemail left`.
- **09:38 - 09:40**: Google Drive PDF invoice viewer rendering `Invoice INV-2026-007 - AI Reputation Builder Service` totaling $2,500.

### E. Said vs Shown Mismatches
- Model naming: Prompts and UI labels explicitly reference "GPT-6 Astra", but configuration files shown in Prompt 01 reveal backend routing via OpenAI API key or OpenRouter endpoint (`openai/gpt-6-astra`).
- Video transcript is absent; analysis is constructed entirely from high-resolution contact sheets and explicit UI text.

### F. Failures and Recoveries
- **Premature Speech Termination**: Raw speech recognition cuts off user queries mid-pause. **Recovery**: Implemented a 900ms sliding window timer (`FINISH_MS`) to hold dispatch until true conversational pause.

### G. Decision Points (IF -> THEN)
- **IF** URL contains `mute=1` -> **THEN** silence text-to-speech output while preserving visual chat updates.
- **IF** active screen content matches non-work domains during Focus session -> **THEN** increment drift count, lock tab focus, and speak a personalized warning.
- **IF** search query does not match any indexed local notes -> **THEN** return explicit note-absence response without hallucinating facts.

### H. Tools/Repos/MCPs Named
- **Claude Code**: Terminal coding agent used to build and edit Python/JS web server infrastructure.
- **3d-force-graph**: CDN JavaScript library used to render interactive 3D node networks.
- **Web Speech API**: Browser-native API (`webkitSpeechRecognition` & `speechSynthesis`) for voice I/O.
- **OpenRouter**: API gateway used for model routing and brain swapping.
- **Skool (AI Workshop)**: Platform hosting code downloads and course modules.

### I. Challenges
- Model naming hyperbole ("GPT-6 Astra") framing custom prompt/model aliases as unreleased base models.
- Browser security prompts requiring manual confirmation for full-screen capture during Focus Lock setup.

### J. Use for Jarvis
- Integrate Python zero-dependency graph indexer (`build.py`) into Evens's local vault to generate lightweight 3D web visualizations.
- Adopt the 900ms `FINISH_MS` speech buffer pattern for voice interface stability.
- Implement the standard MCP endpoint integration pattern inside Jarvis's tool manager.

### K. Open Questions
- What specific telephony provider or MCP gateway handled the voicemail call event logged at 07:38?
- How is tab-level enforcement implemented inside standard Chrome without a custom extension?
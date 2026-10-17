# LEARNED — K_cha25S4Qo
Protocol: jarvis-signal-engine

### A. Source Map
- **00:00** - Project intro and GitHub repository structure overview (`Mark53` / `Mark-LII`).
- **01:30** - Downloading source zip and setting up project environment across Windows/macOS/Linux.
- **01:52** - Opening repository inside Visual Studio Code and inspecting directory layout.
- **02:22** - Code inspection of `ui.py` detailing PyQt5 GUI HUD rendering and subprocess execution flags.
- **03:00** - Obtaining free Gemini API keys from Google AI Studio.
- **03:32** - Live demonstration of Mark 53 reactive circular HUD, wake-word activation, and system command control.
- **04:12** - GUI HUD terminal logs showing real-time event logging (`[open_app] Microsoft Edge`).
- **05:40** - Overview of running local LLM companion build (Mark 56).
- **07:08** - Overview of remote mobile dashboard control and persistent memory architecture.
- **07:49** - Community & Academy membership details.

---

### B. Atomic Knowledge
- **Claim:** Local wake-word detection prevents unauthorized cloud audio streaming.  
  - **Why:** Audio streaming to Google Gemini Live API only initiates after the local model detects the phrase "Hey Jarvis".  
  - **Conditions:** Requires local audio buffer processing (`sounddevice`/`numpy`).  
  - **Evidence:** Stated in repository release notes and verified by UI status log (`SYS: Microphone active...`).  
  - **Label:** SOURCE  

- **Claim:** Instant voice acknowledgment eliminates perceived agent response latency.  
  - **Why:** The assistant immediately speaks a localized confirmation locally while background actions execute asynchronously.  
  - **Conditions:** Active audio output stream and non-blocking background task threading.  
  - **Evidence:** Repository release notes & UI stream log state.  
  - **Label:** SOURCE  

- **Claim:** Self-describing plugin system eliminates bloated core execution logic.  
  - **Why:** Placing new plugin files into the `plugins/` directory auto-registers tools without modifying `main.py`.  
  - **Conditions:** Files must conform to the project's standard skill contract interface.  
  - **Evidence:** GitHub tree showing dedicated `plugins/` and `actions/` folders.  
  - **Label:** SOURCE  

- **Claim:** Desktop process launches can be hidden using OS platform flags.  
  - **Why:** Passing `subprocess.CREATE_NO_WINDOW` on Windows prevents command-prompt flashing when executing automation tasks.  
  - **Conditions:** `platform.system() == "Windows"`.  
  - **Evidence:** Code visible in `ui.py` at frame 02:22.  
  - **Label:** SOURCE  

---

### C. Procedures as Ordered Steps
#### System Installation & Configuration
1. Download `Mark53-main.zip` from the official GitHub repository.
2. Extract the ZIP contents to your local directory.
3. Open Visual Studio Code, navigate to `File -> Open Folder`, and select `Mark53-main`.
4. Install python dependencies via `pip install -r requirements.txt`.
5. Navigate to `aistudio.google.com/apikey`, generate a free Gemini API key, and insert it into the `config/` setup.
6. Run `python main.py` to start the PyQt5 circular visual HUD.

#### Voice Assistant Interaction
1. Say **"Hey Jarvis"** to activate the local wake-word detector.
2. State your command (e.g., "Open Microsoft Edge").
3. Listen for immediate verbal acknowledgment while the HUD executes `[open_app]` in the background.
4. Click **EMERGENCY STOP** on the visual HUD interface to kill active agent processes if needed.

---

### D. Shown on Screen
- **00:00:** GitHub repository file tree: `actions/`, `config/`, `core/`, `dashboard/`, `memory/`, `plugins/`, `LICENSE`, `main.py`, `readme.md`, `requirements.txt`, `setup.py`, `ui.py`.
- **01:38:** Windows File Explorer in `Downloads` showing `Mark53-main.zip` and extracted folder.
- **01:52 - 02:10:** VS Code interface loading the project folder.
- **02:22 - 02:24:** VS Code displaying `ui.py` imports (`PyQt5.QtCore`, `PyQt5.QtGui`, `PyQt5.QtWidgets`), `APP_VERSION = "MARK LIII"`, and `creationflags: subprocess.CREATE_NO_WINDOW` platform logic.
- **04:10:** Automated launch of Microsoft Edge web browser.
- **04:12:** `JARVIS - MARK 53` dark-mode desktop window featuring central blue circular reactive visualizer, right-hand activity log terminal (`SYS: Microphone active...`, `[open_app] Microsoft Edge`), bottom status buttons (`MICROPHONE ACTIVE`, red `EMERGENCY STOP`).

---

### E. Said vs Shown Mismatches
- Audio transcript was unavailable in source metadata. All details are derived from visual frames and repository documentation.

---

### F. Failures and Recoveries
- **Console Encoding Issues:** `main.py` explicitly handles stdout/stderr re-encoding via `sys.stdout.reconfigure(encoding=...)` with fallback `try/except` blocks to prevent crashes on non-ASCII system locales.

---

### G. Decision Points (IF -> THEN)
- **IF** no audio input is detected for 2 minutes **THEN** automatically trigger sleep mode to halt cloud token usage.
- **IF** operating system is Windows (`platform.system() == "Windows"`) **THEN** set `creationflags = subprocess.CREATE_NO_WINDOW` for subprocess execution.
- **IF** an emergency stop condition occurs **THEN** user clicks the HUD's red `EMERGENCY STOP` GUI button to immediately terminate active tool execution.

---

### H. Tools / Repos / MCPs Named
- **`FatihMakes/Mark-LII` / `Mark53`:** Primary Python personal AI assistant codebase.
- **Google Gemini 3.1 Flash Live API (`google.genai`):** Real-time bidirectional streaming LLM engine.
- **PyQt5:** Used to build the reactive HUD interface (`ui.py`).
- **`sounddevice` & `numpy`:** Local real-time audio sampling and signal processing.

---

### I. Challenges & Hype
- Proprietary API dependency (Google Gemini Live API) requires active internet connection unless using the Mark 56 local LLM fallback.
- Cross-platform system control features (WiFi, brightness, volume) heavily rely on OS-specific subprocess commands.

---

### J. Use for Jarvis
- **Local Wake-Word Listener:** Implement local lightweight audio monitoring so Mac operator voice invocation doesn't stream audio to APIs until explicit trigger.
- **Instant Acoustic Feedback:** Implement non-blocking initial audio feedback prior to starting browser-use or GUI automation to provide responsive UX.
- **Auto-Registering Plugins:** Adopt the `plugins/` self-describing directory model to dynamically load Mac tools without touching core loops.

---

### K. Open Questions
- Which specific local model library powers the wake word engine (openWakeWord vs Porcupine)?
- How is state synchronized between the local desktop app and the remote phone dashboard QR interface?
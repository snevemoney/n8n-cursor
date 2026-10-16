# LEARNED — SEyqYWQbGxc
Protocol: jarvis-signal-engine

# Source Map & Analysis: Build JARVIS 4.0 AI Assistant

### A. Source Map
- **00:00** - Intro & Live Assistant Demo (Cyan HUD core, system telemetry readout, news feed display).
- **00:10** - Creating a free Gemini API Key via Google AI Studio (`aistudio.google.com`).
- **01:03** - Downloading JARVIS Source Code from GitHub (`github.com/FatihMakes/Mark-LIV`).
- **01:48** - Downloading and Installing Python (>3.11) with PATH enabling.
- **02:40** - VS Code Setup: Opening project folder, executing `py setup.py` for dependencies, running `py main.py`.
- **03:45** - Initial GUI Configuration: Entering Gemini API Key and selecting target OS (Windows/macOS/Linux).
- **04:14** - Capability Walkthrough: Holographic 3D Mesh Avatar, Formant Lip Sync, Hardware Telemetry, Recallable Memory, Voice OS Automation.
- **05:42** - Setting up Assistant Auto-Start on System Boot.
- **06:11** - Outro & Credit (@FatihMakes).

---

### B. Atomic Knowledge
- **Gemini API Key Generation**: Gemini API keys are obtainable without cost via Google AI Studio dashboard (`aistudio.google.com`). `[SOURCE: SAID & SHOWN 00:18-00:45]`
- **Python PATH Requirement**: Windows environment execution via terminal `py` requires selecting "Add python.exe to PATH" during Python installation. `[SOURCE: SAID & SHOWN 02:21-02:26]`
- **Software-Rendered 3D Avatar**: `Mark-LIV` utilizes a software-generated wireframe head geometry HUD requiring zero GPU/heavy game engine dependencies while animating at 50 mouth shapes/sec via formant analysis. `[SOURCE: SHOWN 04:16 README]`
- **OS Telemetry Tracking**: Telemetry tracks CPU, RAM, GPU, thermals, and uptime natively to deliver real-time voice status updates. `[SOURCE: SAID & SHOWN 04:46-04:55]`

---

### C. Procedures as Ordered Steps

#### 1. Gemini API Key Acquisition
1. Navigate browser to `aistudio.google.com` and log in.
2. Click **Create API key** on the dashboard.
3. Name the key (e.g., `Jarvis version 4.0`).
4. Copy the key and temporarily save it in a text file.

#### 2. Environment & Code Installation
1. Download Python 3.11+ installer from `python.org`.
2. Run installer, check **Add python.exe to PATH**, and click **Install Now**.
3. Visit `github.com/FatihMakes` and select the `Mark-LIV` repository.
4. Click **Code** -> **Download ZIP** and extract the archive to local disk.

#### 3. Execution & Initialization
1. Open Visual Studio Code, go to **File** -> **Open Folder**, and choose `Mark-LIV-main`.
2. Open VS Code Terminal (**Terminal** -> **New Terminal**).
3. Run `py setup.py` to install required dependencies.
4. Run `py main.py` to launch the assistant GUI.
5. Paste the saved Gemini API key into the key field.
6. Select host operating system (Windows / macOS / Linux) and click **Initialize Systems**.

---

### D. Shown on Screen
- **00:00 - 00:10**: Custom dark cyan HUD with central circle "JARVIS", CPU/RAM telemetry bars on left top, news ticker on bottom panel.
- **00:26 - 00:54**: Bing search pointing to Google AI Studio; API key dialog box in Google AI Studio.
- **01:06 - 01:34**: GitHub user profile `FatihMakes` listing repositories (`Mark-LIV`, `Mark XXXX-OR`, `Mark X`). Downloading `Mark-LIV-main.zip`.
- **02:00 - 02:24**: Download page on `python.org` showing active Python releases chart; Windows installer dialog with "Add python.exe to PATH" checkbox highlighted.
- **02:50 - 03:07**: VS Code file sidebar containing `actions/`, `config/`, `core/`, `dashboard/`, `memory/`, `plugins/`, `api_keys.json`, `main.py`, `setup.py`, `ui.py`.
- **03:52 - 04:06**: Dark GUI popup overlay with title `INITIALISATION REQUIRED`, text box `Gemini API Key`, OS selector buttons (`Windows`, `macOS`, `Linux`), and blue `Initialize` button.
- **04:30**: 3D wireframe head avatar in light cyan mesh with glowing green eyes and status indicator `LISTENING` / `SPEAKING`.
- **04:16, 04:40, 04:58, 05:14, 05:32**: README document scrolling through capabilities table (Holographic Avatar, Real Lip-Sync, Hardware Monitoring, Recallable Memory, System Control, Session Continuity).
- **05:42**: Title slide "HOW TO AUTO-START JARVIS".

---

### E. Said vs Shown Mismatches
- **Repo Name**: Audio says "click on Markel 4", but the screen clearly displays GitHub repository `Mark-LIV` (Roman numeral LIV = 54).
- **Python Version**: Audio claims downloading Python "3.13.14", whereas screen shows generic python.org downloads page.
- **Auto-Start Config**: Audio describes clicking a settings icon in the top left corner of the assistant window to toggle auto-start, but the screen only shows a title graphic card ("HOW TO AUTO-START JARVIS") and never demonstrates the actual UI interaction.

---

### F. Failures and Recoveries
- **Missing PATH Entry**: If terminal fails to recognize `py` commands during `setup.py` execution, re-run Python installer and ensure "Add python.exe to PATH" is explicitly checked.
- **API Key Prompt**: If no API key configuration exists on launch, `main.py` pops up an interactive modal dialog allowing key entry without manually editing source code.

---

### G. Decision Points (IF -> THEN)
- **IF** installing on Windows **THEN** select `Windows` radio button in `main.py` GUI startup wizard.
- **IF** installing on macOS or Linux **THEN** select `macOS` or `Linux` in `main.py` GUI startup wizard to route platform-specific commands.

---

### H. Tools/Repos/MCPs Named
- **Google AI Studio**: Cloud platform for generating Gemini API keys.
- **FatihMakes/Mark-LIV**: Open-source GitHub repository housing the JARVIS assistant codebase.
- **Python 3.11+**: Primary backend execution runtime.
- **Visual Studio Code**: IDE used for dependency setup and launching scripts.
- **Gemini API**: Core language model backend for voice responses and reasoning.

---

### I. Challenges & Hype Analysis
- **Timestamp Hype**: Video title uses "2026 Tutorial" for hype/SEO.
- **Gemini Versioning**: README lists feature descriptions mentioning "Gemini 3.1 Flash Live", which is non-standard naming for current production Gemini API tiers.
- **System Privileges**: Voice OS automation grants direct script control over application execution and file listings, requiring security boundary awareness.

---

### J. Use for Jarvis (Mac Operator Application)
- **Mac Adaptation**: Port `Mark-LIV`'s modular plugin architecture (`plugins/` directory) to macOS by swapping Windows shell calls with native AppleScript/`osascript` commands.
- **Launch Persistence**: Replace Windows Auto-Start registry setting with a custom macOS `launchd` plist / `LaunchAgent` daemon.

---

### K. Open Questions
- What specific local storage engine (SQLite, Chroma, or JSON file) does `Mark-LIV` use to manage recallable conversation memory?
- How does the 50Hz formant lip-sync algorithm convert audio streams to UI mesh deformations in real time without GPU acceleration?
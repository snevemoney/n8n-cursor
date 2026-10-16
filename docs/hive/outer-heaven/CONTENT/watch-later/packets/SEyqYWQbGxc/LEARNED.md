# LEARNED — SEyqYWQbGxc
Protocol: jarvis-signal-engine

# Signal Analysis: JARVIS 4.0 AI Assistant

## A. Source Map
- **00:00 - 00:10**: Introduction & Initial Voice Demo
- **00:10 - 01:03**: Creating a free Gemini API Key via Google AI Studio
- **01:03 - 01:48**: Downloading source code repository from GitHub (FatihMakes/Markel 4)
- **01:48 - 02:40**: Downloading and installing Python (3.13 / >3.11) with PATH configuration
- **02:40 - 04:14**: Setting up environment in VS Code (`py setup.py`) and running `py main.py` with initial configuration
- **04:14 - 05:42**: Overview of capabilities (3D Animated Avatar, Hardware Monitoring, System Control, Recallable Memory)
- **05:42 - 06:11**: Configuring Auto-Start setting and Outro

## B. Atomic Knowledge
- **Claim**: Gemini API keys are free via Google AI Studio.
  - **Why**: Google provides free tier API access for developer evaluation.
  - **Conditions**: Requires a Google account login.
  - **Evidence**: Shown on screen during key creation flow.
  - **Label**: SOURCE
- **Claim**: Python must be added to PATH during installation.
  - **Why**: Allows execution of `py` and `python` commands from any terminal directory.
  - **Conditions**: Checkbox 'Add python.exe to PATH' must be selected during Windows installer setup.
  - **Evidence**: Highlighted explicitly in transcript and video overlay.
  - **Label**: SOURCE

## C. Procedures as Ordered Steps
1. Navigate to Google AI Studio, log in, create a new API key named `Jarvis 4.0`, and copy it.
2. Visit GitHub user `FatihMakes`, navigate to `Markel 4`, click `Code` -> `Download ZIP`, and extract files.
3. Download Python 3.11+ (demonstrated with 3.13) from python.org, run installer, checking `Add python.exe to PATH` before installing.
4. Open VS Code, open the extracted project directory, launch terminal, run `py setup.py` to install dependencies.
5. Launch application via `py main.py`, paste API key, select OS platform, and click initialize.

## D. Shown on Screen
- **00:10 - 01:03**: Browser showing Google AI Studio dashboard and API key creation modal.
- **01:03 - 01:48**: GitHub repository page (`FatihMakes/Markel 4`), ZIP download menu, Windows Explorer extraction.
- **01:48 - 02:40**: Python download page on python.org and Windows installer dialog showing PATH checkbox.
- **02:40 - 04:14**: Visual Studio Code editor, integrated terminal running `py setup.py` and `py main.py`, and the futuristic JARVIS GUI overlay.
- **04:14 - 05:42**: 3D animated blue human avatar head performing lip-sync and Markdown text documentation listing capabilities.

## E. Said vs Shown Mismatches
- Narrator states version downloaded as Python `3.13.14` orally, while screen displays standard release packages around 3.13.
- Project repository name stated as `Markel 4` on screen/GitHub while narrated/marketed primarily as `JARVIS 4.0`.

## F. Failures and Recoveries
- Potential PATH resolution issues prevented by checking `Add python.exe to PATH` during setup.

## G. Decision Points (IF -> THEN)
- **IF** installing on Windows **THEN** select `Windows` option during `main.py` GUI setup prompt.
- **IF** user wants JARVIS to run on startup **THEN** toggle `Auto Start` switch inside UI Settings menu.

## H. Tools / Repos / MCPs Named
- **Google AI Studio / Gemini API**: LLM backbone provider.
- **GitHub (FatihMakes/Markel 4)**: Open-source repository hosting JARVIS codebase.
- **VS Code**: IDE used to manage and launch Python scripts.
- **Python 3.11+**: Runtime environment.

## I. Challenges
- Hardware sensor monitoring (thermals/CPU/RAM) may require platform-specific permissions or drivers that fail silently or return incomplete data.
- Storing API keys directly in local UI dialogs without encryption standard practice checks.

## J. Use for Jarvis
- Serves as a reference implementation for integrating real-time voice UI with local system execution scripts and desktop UI auto-launching.

## K. Open Questions
- Which specific speech synthesis engine and 3D rendering library are utilized for the real-time lip-synced avatar?
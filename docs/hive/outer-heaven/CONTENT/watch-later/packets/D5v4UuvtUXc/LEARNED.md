# LEARNED — D5v4UuvtUXc
Protocol: jarvis-signal-engine

# A. Source map (beats in order, with times)
- **00:00 - 00:29**: Introduction to Jev AI + JARVIS setup; overview of localhost:4719 interface showing the 3D knowledge graph, HUD, and live REFLEX routing panel.
- **00:29 - 01:00**: Explanation of Jev decision layer architecture; operating as a System 1 reflex layer before LLM reasoning begins.
- **01:00 - 02:11**: Email Action Demo; Jev routing to `mail calendar` lane, triggering high-stakes confirmation (91% CONFIRM) and creating a Gmail draft.
- **02:11 - 03:21**: Prompt & Architecture Walkthrough (PDF review of "What Jev is, honestly", Foundation prompt, The Butler character prompt, The Prepass & Strip prompt, and The Judge prompt).
- **03:21 - 04:02**: Enabling Jev Reflex toggle in the UI (`REFLEX` live status indicator on HUD).
- **04:02 - 07:07**: Vault Query Routing Demo; Jev evaluates query relevance (`vault question` lane at 99% ACT, `Vault has it` at 96% FOUND) and pulls notes (`CiteVue`, `platform-playbook`, `brand-voice`, `content-pillars`).
- **07:07 - 09:08**: Email & Calendar Routing Demo; multi-lane evaluations and pre-flight tool execution checks (`gmail_search`, `gmail_read`, `gmail_draft`).
- **09:08 - 10:56**: Agent Task + Invoice Test; Jev routes request to `agent task` lane (98% ACT), detects missing vault notes (`Vault has it` 32% DARK), and requests parameter clarification.
- **10:56 - 11:28**: Wrap Up and Resources; tour of Skool communities (`skool.com/aiworkshop` and `skool.com/aiworkshop-lite`) displaying JARVIS V7 install files (`brain-jarvis-skill-v7-mac.zip`, `brain-jarvis-skill-v7-windows.zip`, `Jarvis-V7-Install-Guide.pdf`).

# B. Atomic knowledge
- **Claim**: Jev is a specialized decision model from TypeSafe AI that outputs probabilities for typed questions rather than generating text.
  - **Why**: Designed for sub-second structured evaluations (lane selection, safety checks, execution verification) at low cost.
  - **Conditions**: Called via API before or after primary LLM execution.
  - **Evidence**: PDF documentation page 3 shows Jev latency of 170–330 ms and cost of $0.042 per million input tokens ($0.00006/call).
  - **Label**: SOURCE

- **Claim**: The Prepass mechanism evaluates input intent and safety before the primary LLM processes the turn.
  - **Why**: Prevents heavy reasoning LLMs from wasting tokens on trivial questions and enforces safety thresholds prior to execution.
  - **Conditions**: Executes one Jev call per user utterance before sending prompt to the chat model.
  - **Evidence**: Prompt 07 PDF details asking lane selection, completeness, addressed check, and stakes score.
  - **Label**: SOURCE

- **Claim**: The Judge mechanism blocks hallucinated execution claims when no tool receipts exist.
  - **Why**: LLMs frequently claim to have sent emails or completed tasks without actually executing tools.
  - **Conditions**: Post-processes LLM text output along with real tool execution receipts.
  - **Evidence**: Prompt 09 PDF specifies blocking output if `CLAIM >= 0.70` and `BACKED < 0.45` with empty receipt list.
  - **Label**: SOURCE

# C. Procedures as ordered steps
1. **3D Knowledge Galaxy Initialization**:
   - Run Python script `build.py` to scan local `.md` files in target directory.
   - Write index output to `viewer/graph-data.js` with node labels, group identifiers, and 700-character note excerpts.
   - Start local Python server `server.py` on port 4719.
   - Open web app viewer at `localhost:4719` using `3d-force-graph` CDN library.

2. **Setting Up Jev Prepass Layer**:
   - Intercept user voice/text input at backend before LLM dispatch.
   - Send parallel Jev API request asking structured questions: `Lane` (vault question / chat / calendar / mail / agent task), `Complete`, `Addressed`, `Stakes`, `Vault coverage`.
   - Parse probability scores (0-100%).
   - Render real-time confidence bars on UI panel ("The Strip").

3. **Executing Action Safety Checks (High Stakes Gatekeeper)**:
   - Evaluate Jev `Stakes` output probability (evaluating if action sends, calls, deletes, or spends).
   - If `Stakes` crosses confirmation threshold (e.g., 91% CONFIRM), halt immediate background execution.
   - Direct assistant to prompt user with draft details and request explicit confirmation.

4. **Enforcing Output Verification (The Judge)**:
   - Receive candidate text response from primary LLM ("The Brain").
   - Collect execution receipt array returned by MCP/tool handlers (`receipts`).
   - Dispatch Jev verification request passing text answer and receipts list.
   - If LLM claims action performed without backing receipt, replace text with polite correction (e.g., "I nearly told you that was done, sir, but there is no receipt for it.").

# D. Shown on screen
- **localhost:4719 Application**: Dark theme UI featuring 3D force-directed node graph ("323 nodes"), left sidebar controls (`Forces`, `Display`, `Theme`), right side JARVIS HUD circle with status toggles (`EYES`, `WATCH`, `HOLD`, `FOCUS`, `REFLEX`), and bottom `REFLEX` decision panel with green visual percentage progress bars.
- **REFLEX Panel Metrics**: Displays `Lane` (`vault question`, `mail calendar`, `agent task`), `Complete` (84-95%), `Addressed` (96-98%), `Stakes` (13-92%), `Vault has it` (32-96%). Action pills indicate `ACT`, `ASK`, `CONFIRM`, `CLEAR`, `FOUND`, `DARK`.
- **PDF Prompt Documentation**: PDF document titled *Give Your Jarvis Reflexes* featuring Prompt 01 (Foundation), Prompt 02 (Speech), Prompt 04 (Character - The Butler), Prompt 07 (The Prepass and the Strip), and Prompt 09 (The Judge).
- **Browser / Community Pages**: Chrome browser viewing `skool.com/aiworkshop` and `skool.com/aiworkshop-lite` showing classroom download links for `brain-jarvis-skill-v7-mac.zip`, `brain-jarvis-skill-v7-windows.zip`, and `Jarvis-V7-Install-Guide.pdf`.

# E. Said vs shown mismatches
- Audio transcript was absent in source material; all analytical findings, prompt rules, UI values, and model specifications are extracted strictly from visual screen evidence, on-screen text, PDF prompt guides, and UI labels.

# F. Failures and recoveries
- **Failure**: Primary chat LLM claims an email was sent when no Gmail API action actually fired.
- **Recovery**: The Judge Jev post-pass compares LLM output against the empty tool receipts array, intercepts the message before voice synthesis, and rewrites the response asking for user confirmation.

# G. Decision points (IF -> THEN)
- **IF** `Stakes` score > threshold (e.g. 91% CONFIRM) **THEN** suspend automated execution and ask user for confirmation.
- **IF** `Vault has it` score >= 86% **THEN** route query context to local Markdown notes (`vault question` lane).
- **IF** `Vault has it` score <= 32% (marked `DARK`) **THEN** identify missing information in vault and prompt user for missing parameters.
- **IF** LLM output claims action complete AND `receipts` list is empty **THEN** block message output and trigger fallback response.

# H. Tools/repos/MCPs named
- **Jev AI / TypeSafe AI**: Fast probability decision model (`jev-1.13.0`) used for prepass routing, stake checks, and verification.
- **Claude Code / Claude Fable 5.1 / Claude Opus**: High-reasoning chat model ("The Brain") handling primary conversational generation.
- **3d-force-graph**: Javascript library loaded via CDN for rendering interactive 3D knowledge nodes in `viewer/index.html`.
- **Python 3 `http.server` / `server.py`**: Lightweight web backend running on `localhost:4719` serving graph data and API endpoints.
- **Gmail MCP / Tools**: `gmail_search`, `gmail_read`, `gmail_draft` tools integrated into JARVIS tool pipeline.

# I. Challenges (what may be wrong, outdated or hype)
- Dependency on third-party Jev API endpoints for real-time streaming prepass classification.
- Threshold hardcoding (e.g. 91% CONFIRM) may require fine-tuning across different user command styles to prevent over-triggering confirmation prompts.

# J. Use for Jarvis
- Evens's Mac assistant can implement a lightweight local prepass (or fast API call) to classify user voice commands before routing to heavy reasoning LLMs.
- Implement "The Judge" validation pattern in Claude Code workflows to ensure file edits, terminal operations, or git commits produce verifiable system receipts before reporting task completion to the operator.

# K. Open questions
- Can local small models (e.g., Llama 3 8B or Phi-3 via Ollama) match Jev's 170-330 ms latency and reliability for probability scoring on Apple Silicon?
- How does Jev handle complex multi-intent utterances where a single sentence contains both vault lookup and action requests?
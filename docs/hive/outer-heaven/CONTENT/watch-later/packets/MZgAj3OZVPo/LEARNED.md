# LEARNED — MZgAj3OZVPo
Protocol: jarvis-signal-engine
Watched: whole video by Gemini (gemini-3.8-flash, Google AI Studio free tier) from the YouTube link, 1 frame/s + audio, learn lens, no download

# A. Source Map
- **00:00 - 00:35**: Introduction of TypeSafe AI's Jev model inside Agent Zero. Split view shows Agent Zero chat/terminal on the left (`Built: JFK Tower`) and the interactive JFK Tower radar canvas on the right with dark airport layout, runways (22L, 22R, 13L, etc.), and dynamic aircraft icons.
- **00:35 - 00:58**: Inspecting the underlying structured state. The presenter navigates to the `State` tab below the radar display to show the raw JSON state vector (`K3FK-STATE-V1.0 - JSON EXPORT`) containing airport meta info, tick counters, weather, runways, taxiways, and detailed aircraft properties passed to Jev.
- **00:58 - 01:24**: Running the live simulation with audio. Clicks `Enable radio` (initiating OpenAI Realtime sessions for controllers and pilots) and `Run sector`. Flight DAL204 receives clearance for runway 22R. The `Decisions` pane opens showing Jev evaluating options and outputting `Clear for takeoff` with a 73% confidence score.
- **01:24 - 01:45**: Ongoing live loop decisions and ATC radio exchanges. Bravo Alpha Whiskey 117 is cleared to land runway 22L. November 42 Sierra Romeo (N42SR) receives `Continue route` at 96% confidence.
- **01:45 - 02:24**: Fullscreen deep dive into Jev's output analytics. Presenter disables radio and expands the JFK Tower canvas to fullscreen modal. Shows decision tracking history (`N780LX Continue route 98%`, `N5725P Continue route 91%`, `280A18 Taxi to hold 87%`, `N42SR Continue route 96%`) and verifies collision-free autonomous airport operations.
- **02:24 - 02:40**: Agent Zero plugin integration. Exits the canvas modal back to Agent Zero chat `#225`, demonstrating the custom `typesafe_query` plugin invoked on unstructured text queries.
- **02:40 - 03:26**: Customer support triage benchmark. Evaluates a refund request string (`'I was charged twice. Please refund the duplicate today.'`) against three structured judgments: department choice (`billing` 100%), refund probability (`99.0%`), and urgency score (`2/2` 100% immediate). Presenter highlights Jev's high throughput (~4 decisions/second / 4 Hz, ~730ms response for batch judgments).

# B. Atomic Knowledge
- **Jev is a typed judgment model, not an LLM**: It does not generate conversational prose or chat; it accepts a structured or semi-structured state vector and outputs strict typed judgments (choices from discrete sets, boolean probabilities, and ordinal/scale scores) with explicit confidence distributions [SOURCE: video description & 00:00-00:30, 02:40-03:26].
- **Live-Loop Execution Speed (4 Hz)**: Jev runs at approximately 4 decisions per second (4 Hz) or ~730ms for 3 concurrent typed judgments (70 output tokens / 408 input tokens), fast enough to sit inside reactive real-time control loops like air traffic control [SOURCE: 02:41, 03:12-03:19].
- **Visible Uncertainty Distribution**: Unlike typical LLMs that emit uncalibrated logits or arbitrary text tokens, Jev provides calibrated probability distributions across discrete alternatives (e.g., DAL204: Clear for takeoff 73%, Taxi to hold 15%, Abort 12%; N42SR: Continue route 96%, Reduce speed 3%, Ground hold 1%) [SOURCE: 01:24, 01:37, 01:57].
- **Decoupling Cognition from Voice Synthesis**: The architecture separates decision-making (handled deterministically and safely by Jev) from communication/voice synthesis (handled by OpenAI Realtime voice sessions representing controllers and pilots) [SOURCE: 00:20-00:30, 01:00-01:45].
- **State-Vector-Based Decision Triage**: Jev can consume full world state JSON objects (containing aircraft positions, speed, altitude, runway occupancy, target heading, and conflict warnings) and map them directly into operational tactical directives without chain-of-thought hallucination [SOURCE: 00:35-00:58, 01:57-02:05].

# C. Procedures as Ordered Steps
### Procedure 1: Setting up and Running the JFK Tower Simulation in Agent Zero
1. Ensure the JFK Tower canvas plugin is installed within Agent Zero's right canvas container.
2. Open the split-screen view: Agent Zero agent chat on the left, JFK Tower canvas on the right [00:00].
3. Click the `State` tab to inspect the JSON state vector (`K3FK-STATE-V1.0`) ensuring tick, aircraft, and runway tables are active [00:35].
4. Click `Enable radio` in the bottom-right corner to connect OpenAI Realtime voice channels [01:00].
5. Click `Run sector` at top-left to start the real-time simulation clock [01:03].
6. Monitor the `Decisions` panel on the bottom left and the radar tracking overlays as Jev issues clearances at each waypoint or conflict point [01:07 - 01:45].

### Procedure 2: Running a Multi-Judgment Query via Agent Zero Plugin
1. Open an Agent Zero chat session (`#225`) [02:38].
2. Call the tool `typesafe_query` providing:
   - Input state text (e.g., customer complaint).
   - Structured questions: choice (categorical options), probability (null/boolean likelihood), and urgency/ordinal scoring [02:38].
3. Agent Zero executes the tool call against the Jev API endpoint (`model: jev-1.13.0`) [02:41].
4. Inspect the resulting structured cards displaying chosen labels, expected scores, token counts (input/output), latency (ms), and percentage confidence scores [02:42 - 03:00].

# D. Shown on Screen
- **00:00**: Agent Zero workspace. Left: Chat/Terminal with markdown table summarizing JFK Tower specs (Dark airport view, Mixed traffic: B777, B737, A320, Citation Longitude, C172, Cirrus SR22; 4 controllers: Ground, Tower, Approach, Departure; Real Jev decisions; OpenAI Realtime radio). Right: JFK Tower radar canvas.
- **00:40**: Code viewer in JFK Tower displaying JSON object: `{"meta": {"tick": 48, "airport": "KJFK", "phase": "day"}, "runways": [...], "aircraft": [{"callsign": "DAL204", "type": "B738", "phase": "taxi", ...}]}`.
- **01:00 - 01:24**: Radar canvas with green runway outlines, aircraft blips with labels (`DAL204`, `BAW117`, `N42SR`). Bottom panel tabs: `Traffic`, `Decisions`, `Radio`, `State`, `Profiles`. Button `Enable radio` toggles to `Radio on`.
- **01:22**: Active decision card for `DAL204`: `Clear for takeoff 73%`, breakdown: `Clear for takeoff 73%`, `Taxi to hold 15%`, `Abort 12%`. Model verification text: `Simulated phase, occupancy and conflict checks applied; not operational clearance`.
- **01:37**: Active decision card for `N42SR`: `Continue route 96%`, breakdown: `Continue route 96%`, `Reduce speed 3%`, `Ground hold 1%`. Distance to conflict: `0.15 NM`, Predicted conflicts: `0`.
- **01:54 - 02:24**: Fullscreen radar and event injection bar (`Close 22L`, `Close 13L crossing`, `+ Traffic conflict`, `Taxi obstruction`). Counters: `4 AIRBORNE`, `4 ON SURFACE`, `0 CONFLICTS`, `1 COMPLETED`, `11 MATCHES`.
- **02:36 - 03:26**: Agent Zero prompt and results for `typesafe_query`: input `I was charged twice. Please refund the duplicate today.`; output showing: `Department: billing (100.0%)`, `Refund_requested: 99.0%`, `Urgency: 2/2 (100.0%)`, latency `730 ms`, tokens `408 input • 70 output`, model string `jev-1.13.0`.

# E. Said vs Shown Mismatches
- **Presenter claims GPT-6**: At 00:16, the presenter says *'I asked GPT-6 yesterday night to create this depiction of the JFK airport'*. This is clearly hyperbolic speech or an inside joke; the UI displays standard GPT/Claude code generation in Agent Zero, and GPT-6 does not publicly exist.
- **Latency / Hz claim**: Presenter claims at 03:13 that Jev can do *'like four decisions per second... works like at 4 Hz'*. The screen at 02:41 displays a batch call of 3 judgments taking `730 ms` (~4.1 judgments/second aggregated, or ~1.37 batch calls/sec), matching his throughput claim when measured across parallel/multi-judgment evaluations.

# F. Failures and Recoveries
- No software crash or runtime error occurred during the demo.
- The audio channel was deliberately muted (`Radio off` at 01:46) to suppress overlapping voice chatter from OpenAI Realtime while explaining the decision analytics in fullscreen mode.

# G. Decision Points (IF -> THEN)
- **IF** aircraft is approaching runway threshold and runway is clear of conflicting traffic **THEN** Jev outputs `Clear for takeoff` or `Cleared to land` with high confidence (>70%) [01:22, 01:30].
- **IF** aircraft is following an assigned departure or taxiway routing without immediate spatial conflict (<0.15 NM) **THEN** Jev outputs `Continue route` (>90% confidence) rather than speed reduction or ground hold [01:37, 02:00].
- **IF** an incoming customer message requests repayment of duplicate charges **THEN** classify `department` to `billing` (100%), set `refund_requested` probability to `99.0%`, and set `urgency` to maximum scale `2/2` (immediate) [02:41-03:00].

# H. Tools, Repos, and MCPs
- **TypeSafe AI Jev (`jev-1.13.0`)**: Specialized non-LLM neural model designed for fast, typed structured judgments, discrete classification, probability scoring, and calibrated confidence outputs.
- **Agent Zero (`agent0ai/agent-zero`)**: Open-source agent framework supporting multi-agent collaboration, customizable tools, web UI, dynamic canvas sidecar, and containerized runtime.
- **OpenAI Realtime API**: Powers separate real-time bidirectional voice sessions for virtual air traffic controllers and simulated pilots.
- **`typesafe_query` Plugin**: Custom Agent Zero tool interface used to dispatch state payloads and multiple judgment schemas to the Jev model API.

# I. Challenges (Hype vs Reality)
- **Not an operational ATC system**: As explicitly noted in the UI disclaimer (`Simulated phase, occupancy and conflict checks applied; not operational clearance`), this is an experimental simulation environment, not an FAA-certified avionics control system.
- **Deterministic constraints**: While Jev yields structured confidence, critical safety workflows still require deterministic runtime guardrails, collision cones, and envelope limits rather than relying solely on model probabilities.
- **State formatting overhead**: Jev requires strictly structured state schemas and predefined decision categories, meaning it cannot dynamically invent novel unmodeled courses of action outside its schema.

# J. Use for Jarvis
- **Sub-Second Intent & Routing Triage**: Jarvis can replace slow LLM routing steps (which take 1.5–3.0s with tool-calling overhead) with a Jev-style typed judgment call (~200–300ms per decision) to route incoming voice commands immediately to computer-use, browser automation, or bash execution.
- **High-Frequency Computer-Use Policy Checks**: During automated desktop interaction, Jarvis can query a judgment model at 4 Hz with UI state representations to decide whether to `proceed`, `wait_for_render`, or `abort_on_anomaly`.
- **Deterministic Risk Scoring**: Score dangerous actions (e.g. paying invoices, deleting files, sending emails) on a 0–2 scale with calibrated confidence before triggering human approval stops.

# K. Open Questions
- What is the exact model architecture of Jev (is it a fine-tuned encoder-only model, a distilled causal decoder with constrained head classification, or an energy-based model)?
- How does Jev pricing compare to small frontier models (e.g., Claude 3.5 Haiku, GPT-4o-mini) when running continuous 4 Hz loops?
- Does TypeSafe AI support local weights deployment via ONNX/vLLM, or is it strictly hosted API-based?
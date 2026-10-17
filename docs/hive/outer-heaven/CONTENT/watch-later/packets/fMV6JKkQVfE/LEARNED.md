# LEARNED — fMV6JKkQVfE
Protocol: jarvis-signal-engine

### A. Source map
- **00:00**: Overview of TypeSafe AI Jev announcement website (`typesafe.ai`) titled "The first System... Model".
- **00:14**: Jev cost comparison table ($0.00/FREE vs unverified models: GPT-6 Astra, Claude Fable 5.1, Opus 5, Sonnet 5, Haiku 4.5, GPT-5.6 Luna).
- **00:18**: Intelligence vs Cost scatter plot analysis.
- **00:28**: Jev speed and cost claims (0.2s per decision, $0.04/M tokens) along with "honest read" limitations.
- **00:38**: Introduction to Rush Hour Lab (`127.0.0.1:4173`) traffic control simulation app.
- **00:48**: "The Jev Guide: TypeSafe AI in Plain English" document walkthrough detailing 5 core properties of System One models.
- **01:02**: Safety guardrail and agent tool check code configuration.
- **01:04**: Enterprise use cases: lead routing, agent safety checks (Vercel/LangChain), model router, real-time system reflexes.
- **01:14**: "The Reflex" concept: decision-only AI that never outputs prose.
- **01:40**: Interactive decision formats demo: Yes/No percentages, Pick One multi-class, and Rate It numeric scales.
- **02:56**: "The Traffic Cop" pattern for inbox filtering, customer support, and Jarvis assistant reflex integration.
- **03:02**: Live traffic simulation benchmark comparing Fixed timer vs Jev decision driver.
- **06:24**: AI Workshop OS / Jarvis command interface (`localhost:4719`) featuring GPT-6 Astra option.
- **06:36**: TypeSafe AI Console key management dashboard (`console.typesafe.ai/keys`).
- **08:02**: 3D Knowledge Graph UI in AI Workshop OS / JARVIS with node diagnostics and voice/text interaction.
- **09:24**: End card.

### B. Atomic knowledge
- **Claim**: Jev is a System One decision model that returns confidence distributions across options instead of generating text.
  - **Why**: It contains no output box for prose; it evaluates input state and outputs probability percentages.
  - **Conditions**: Input must be provided as text, JSON, or message thread; choice categories must be predefined.
  - **Evidence**: Shown on Jev Guide document (00:52) and web UI (01:40).
  - **Label**: SOURCE (Shown on screen).
- **Claim**: Jev completes decisions in ~0.2s at ~$0.04 per million input tokens with zero off-script responses.
  - **Why**: It functions as a constrained classification reflex rather than a generative autoregressive LLM.
  - **Conditions**: Single-pass decision call.
  - **Evidence**: Shown on presentation app (00:28, 00:52, 02:22).
  - **Label**: SOURCE (Shown on screen).
- **Claim**: Jev cannot write text, parse tricky math/dates, or process vision/audio inputs.
  - **Why**: It is designed as a fast reflex layer rather than a general-purpose reasoning model.
  - **Conditions**: Tasks requiring text synthesis or multi-step logic.
  - **Evidence**: Explicitly stated under "The honest read" on localhost app (00:28) and Jev Guide (00:52).
  - **Label**: SOURCE (Shown on screen).
- **Claim**: Vercel replaced its safety classifier with Jev for 5x to 18x faster reviews; LangChain shipped it as agent middleware at a 0.5 threshold.
  - **Why**: Sub-second decision latency prevents tool execution bottlenecks.
  - **Conditions**: Intercepting agent tool calls prior to execution.
  - **Evidence**: Documented on page 9 of Jev Guide (01:04).
  - **Label**: SOURCE (Shown on screen).
- **Claim**: Jev acts as a front-line "Reflex Layer" in front of frontier models like Claude Code and GPT-6 Astra.
  - **Why**: It handles thousand quick classification and routing calls cheaply, preserving frontier LLMs for heavy reasoning.
  - **Conditions**: Hybrid multi-tier architecture.
  - **Evidence**: Documented in guide (01:04) and Traffic Cop section (02:56).
  - **Label**: INFERENCE (Derived from architecture diagrams).

### C. Procedures as ordered steps
1. **Provisioning TypeSafe Jev API Keys**:
   - Step 1: Navigate to `console.typesafe.ai/keys` in browser.
   - Step 2: Click black **+ Create key** button in upper right corner.
   - Step 3: Name the key (e.g., "Claude Code Jev" or "Codex Jev").
   - Step 4: Copy secret key token (`apikey_2389...`).
   - Step 5: Inject key into agent environment configuration.
2. **Implementing Jev as Agent Safety Middleware**:
   - Step 1: Intercept proposed agent tool call before execution.
   - Step 2: Pass state context and tool call action into Jev API request.
   - Step 3: Query Jev with binary guardrail question (e.g., "Does this write, delete, publish, pay, or change access?").
   - Step 4: Evaluate Jev's output confidence score.
   - Step 5: If risk probability exceeds threshold (e.g. 0.5), abort execution or flag for human review.
3. **Wiring Jev as a Multi-tier Model Router**:
   - Step 1: Ingest incoming user query or system event.
   - Step 2: Query Jev: "How much reasoning does this need?" with options [Chit-chat / Local model, Fast tier, Frontier model].
   - Step 3: Inspect probability percentage distribution.
   - Step 4: Dispatch payload to assigned model tier based on winning percentage.

### D. Shown on screen
- **00:00**: `typesafe.ai` homepage featuring launch modal video titled "The first System...".
- **00:14**: Model cost table comparing Jev ($0.00/FREE) against GPT-6 Astra, Claude Fable 5.1, Opus 5, Sonnet 5, Haiku 4.5, GPT-5.6 Luna (*UNVERIFIED*).
- **00:28**: `localhost:4961` dashboard displaying metrics (0.2s per decision, $0.04/M tokens, 18c per 1,700 emails) and "The honest read" callout.
- **00:38 - 03:02**: `127.0.0.1:4173` Rush Hour Lab simulation showing 3D city grid and driver mode toggles ([Fixed], [Jev], [You]).
- **00:48 - 01:04**: PDF document "THE JEV GUIDE TYPESAFE AI PLAIN ENGLISH" detailing 5 core properties, guardrail code block, and 5 use cases.
- **01:40 - 02:20**: `localhost:4961` sorter widgets showing Yes/No (94%), Pick One (Billing 88%, Tech 11%, Sales 1%), and Rate It (2.1 / 3).
- **02:56**: `localhost:4961` "THE TRAFFIC COP" diagram outlining inbox, customer service, and assistant routing.
- **06:24**: `localhost:4719` AI Workshop OS search bar with "GPT-6 Astra Extra High" selector.
- **06:36**: `console.typesafe.ai/keys` showing active API key list.
- **08:02**: `localhost:4719` 3D JARVIS graph visualization showing connected nodes and speech box.

### E. Said vs shown mismatches
- No spoken transcript provided in source. All content is derived strictly from visible on-screen text, PDF documents, web apps, and chapter metadata. No audio-visual discrepancies observed.

### F. Failures and recoveries
- **Failure**: Jev cannot perform complex calculations, handle tricky wording/dates, or generate prose.
- **Recovery**: Delegate reasoning, math, and text generation tasks to Claude Code or GPT-6 Astra while using Jev strictly for decision/classification steps.

### G. Decision points (IF -> THEN)
- **IF** task requires prose generation or creative writing -> **THEN** route to Claude Code / GPT-6 Astra (Jev outputs zero prose).
- **IF** proposed agent tool call involves destructive operations (delete, write, pay) AND Jev safety score > 0.5 -> **THEN** block tool call.
- **IF** query is simple chit-chat -> **THEN** route to local model; **IF** hard problem -> **THEN** route to frontier model via Jev router.
- **IF** Jev decision confidence is low (e.g. <60%) -> **THEN** hand off decision to human operator.

### H. Tools/repos/MCPs named, with what they were used for
- **Jev / TypeSafe AI**: Fast System One decision model used for reflex classification, safety checks, and routing.
- **Claude Code**: Frontier AI agent used for code generation and heavy reasoning.
- **GPT-6 Astra**: Frontier LLM option inside AI Workshop OS (`localhost:4719`).
- **LangChain**: Framework referenced as shipping Jev safety check middleware.
- **Vercel**: Noted as adopting Jev to accelerate code and action safety reviews.
- **Rush Hour Lab (`127.0.0.1:4173`)**: Web simulation tool for benchmarking real-time traffic decisions.
- **AI Workshop OS / JARVIS (`localhost:4719`)**: Custom assistant UI featuring 3D knowledge graph and multi-model execution.

### I. Challenges (what may be wrong, outdated or hype)
- Model names (e.g., "GPT-6 Astra", "Claude Fable 5.1") and pricing figures ($18/$58) shown on screen are hypothetical placeholder names or unreleased benchmarks (*UNVERIFIED*).
- Hype claims of "200x speedup" are offset by real-world benchmarks showing everyday speedups of 5x to 25x.

### J. Use for Jarvis (how Evens's Mac operator could apply it)
- **Reflex Layer for Jarvis**: Deploy Jev ahead of main LLM loops to triage notifications, emails, and incoming webhooks in <300ms for ~1 cent/day.
- **Tool Execution Guardrail**: Place Jev middleware in front of Jarvis computer-use tools to evaluate safety risk scores before executing shell scripts or file deletions.
- **Smart Model Routing**: Use Jev to automatically route incoming user prompts between local Ollama models and frontier models.

### K. Open questions
- What is the precise API payload specification (REST/gRPC) for submitting state to TypeSafe Jev?
- Can Jev decision models be fine-tuned on local private datasets, or is configuration limited to standard prompts?
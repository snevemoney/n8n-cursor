# LEARNED — _0RRAUw-mT0
Protocol: jarvis-signal-engine

# A. Source map

**Coverage and evidence limits.** Source: *Opus 5.5 + Jev Might Be the Ultimate AI Combo*, Zubair Trabzada | AI Workshop, listed duration 17:30. The supplied transcript is explicitly absent. Consequently, no spoken statements can be verified. The available evidence is the description, chapter titles, and 41 supplied frames spanning 00:00–17:26. The index says frames were sampled every two seconds and then filtered for screen changes; this is not a complete visual record. All performance, pricing, model-identity, and installation-duration claims are UNVERIFIED.

| Time | Beat and evidence |
|---|---|
| 00:00–00:32 | Preview of a local AI Support Desk comparing an Opus-only lane with a Jev-plus-Opus lane. A checkout example and completed 12-message results appear. |
| 00:44–00:48 | Local PDF prompt pack preview: overview, two-lane construction prompt, dashboard styling prompt. |
| 00:50–02:08 | Setup/test-plan chapter; the supplied 00:50 frame shows the checkout comparison already completed. No continuous setup sequence is available. |
| 02:08–02:52 | Single-request speed-demo chapter. At 02:52 an expanded checkout trace shows the same expected follow-up decision in both lanes. |
| 02:52–04:20 | Description/chapter attributes Jev's speed to structured decision-making rather than long-form generation. No model internals are shown. |
| 04:20–05:45 | Twelve-message stress-test chapter. At 04:36 the pointer is over the batch selector; at 05:00 that selector is selected but the counters still show the previous single-message result. These frames do not establish an actual click or completed new run. |
| 05:45–06:39 | Speed/cost-results chapter. Completed results are visible at 06:44: 33.9 s and 12 Opus calls versus 19.7 s and four Opus calls. |
| 06:39–08:54 | Writing-versus-routing chapter. At 07:54, an expanded website-price enquiry shows Jev deciding and Opus writing in the combined lane. |
| 08:54–09:43 | Claude Code build chapter, known only from chapter metadata; no supplied frame shows the editor, terminal, or build commands. |
| 09:43–11:54 | Zapier connection chapter. At 11:10 a Claude MCP Server configuration contains TypeSafe Jev and other apps. |
| 11:54–13:54 | Add-Jev-API chapter, known from metadata. Actual API-key entry, endpoint, request schema, and implementation are not visible. |
| 13:54–15:43 | Jarvis workflow chapter. At 13:58 a local Jarvis graph/dashboard is visible; at 15:16 a separate Jarvis Server in Zapier is visible; at 15:28 Claude's Zapier connector reads Connected. |
| 15:43–16:02 | Prompt-pack tour: cover, scope, benchmark caveats, foundation prompt, policy/test inbox, dashboard prompt, test material, and six implementation lessons. |
| 16:04–16:20 | AI Workshop Lite community/classroom and a Jarvis-with-Opus lesson with a downloadable PDF. |
| 16:24–16:28 | Return to the support-desk PDF's testing/foundation material and completed comparison dashboard. |
| 16:36–16:48 | Community course navigation, installation instructions, and the JARVIS V7.1–JEV lesson. |
| 16:52–17:26 | Return to the Jarvis graph, then closing graphic. The final-results chapter starts at 16:57 according to metadata. |

# B. Atomic knowledge

Labels distinguish **SOURCE** content from analyst **INFERENCE**. SOURCE does not mean independently verified.

1. **Claim:** Separate structured routing from prose generation. **Why:** Avoid invoking an expensive writer for messages needing only a disposition. **Conditions:** The disposition can be expressed as a bounded decision. **Evidence:** Description; lane subtitles; expanded traces at 02:52 and 07:54. **Label:** SOURCE.
2. **Claim:** Jev is presented as a decision model, not a general conversational writer. **Why:** Its intended output is labels and confidence values rather than paragraphs. **Conditions:** Application supplies the decision task and interprets its result. **Evidence:** Description's System One explanation; PDF lesson “Jev never talks,” 16:00. **Label:** SOURCE.
3. **Claim:** The desk uses Filed, Follow-up, Draft reply, and Needs review as dispositions. **Why:** Separate archiving, internal action, customer-facing composition, and uncertainty handling. **Conditions:** The support policy determines the correct disposition. **Evidence:** PDF overview at 15:46 and dashboard result labels. **Label:** SOURCE.
4. **Claim:** The checkout example becomes a P1 follow-up without an Opus call in the combined lane. **Why:** Saving an urgent internal task need not require drafting a response. **Conditions:** This particular synthetic message and policy. **Evidence:** 00:14–00:24 and 02:52. **Label:** SOURCE.
5. **Claim:** A message needing a written reply still invokes Opus after Jev. **Why:** A routing label is not a customer response. **Conditions:** Draft-reply disposition. **Evidence:** 07:54 shows separate Jev-decided and Opus-wrote-the-draft stages. **Label:** SOURCE.
6. **Claim:** The UI reports about 1.9 s versus 0.3 s for the checkout example, with one versus zero Opus calls. **Why:** Illustrates the benefit of bypassing generation. **Conditions:** One displayed local run; unknown instrumentation and infrastructure. **Evidence:** 00:14, 00:50, 02:52. **Label:** SOURCE; numbers UNVERIFIED.
7. **Claim:** The UI reports 33.9 s/12 Opus calls versus 19.7 s/four Opus calls for 12 messages. **Why:** Illustrates savings across a mixed inbox. **Conditions:** This dataset and run only. **Evidence:** 00:32, 06:44, 16:28. **Label:** SOURCE; numbers UNVERIFIED.
8. **Claim:** Those displayed totals imply approximately 42% less elapsed time, 1.72× overall speed, and 67% fewer Opus calls—not a demonstrated 10× batch speedup. **Why:** End-to-end work still includes writing and tool overhead. **Conditions:** Arithmetic assumes the displayed totals are comparable. **Evidence:** Calculation from the displayed totals. **Label:** INFERENCE; inputs UNVERIFIED.
9. **Claim:** Both lanes should use the same writer and effort setting. **Why:** Otherwise model configuration confounds the routing comparison. **Conditions:** All other relevant variables also need control. **Evidence:** “Same brain, same settings, or it means nothing,” PDF at 16:00. **Label:** SOURCE.
10. **Claim:** The TypeSafe API key and MCP connection credential have different destinations. **Why:** Substitution causes authentication failures. **Conditions:** The demonstrated Zapier-mediated architecture. **Evidence:** PDF's “Two keys, two homes,” 16:00. **Label:** SOURCE.
11. **Claim:** A newly managed server can expose only `get_configuration` until actions are added. **Why:** Tool access is explicitly provisioned. **Conditions:** The server arrangement described by the PDF; current platform behavior is not independently checked. **Evidence:** “A new managed server starts empty on purpose,” 16:00. **Label:** SOURCE.
12. **Claim:** A confidence value sent as text caused rejection and fallback to Opus. **Why:** Tool schemas enforce types even when values look numerically meaningful. **Conditions:** The implementation recounted in the PDF. **Evidence:** “One wrong type sent every message to Opus,” 16:00. **Label:** SOURCE; failure is reported in documentation, not reproduced on screen.
13. **Claim:** Smooth fallback can conceal a completely ineffective routing layer. **Why:** Users still receive successful results while every request takes the expensive path. **Conditions:** Fallback is automatic and its cause is not inspected. **Evidence:** Same PDF lesson. **Label:** SOURCE.
14. **Claim:** Replies can dominate total runtime even if decisions become very fast. **Why:** Routing does not eliminate required writing. **Conditions:** Reply-heavy message mix. **Evidence:** “The replies decide the total,” 16:00; draft trace at 07:54. **Label:** SOURCE.
15. **Claim:** Jev output and human-readable explanations should remain distinct. **Why:** A prose explanation generated elsewhere must not be represented as Jev's own response. **Conditions:** Any interface presenting decision traces. **Evidence:** “Jev never talks,” 16:00. **Label:** SOURCE.
16. **Claim:** The support desk is a controlled demonstration, not an autonomous customer-mail sender. **Why:** Avoid real customer actions and uncontrolled costs during evaluation. **Conditions:** Prompt-pack implementation follows its stated boundaries. **Evidence:** Overview at 15:46 says nothing is sent to a customer and rounds of account changes are not made. **Label:** SOURCE.
17. **Claim:** Jarvis is presented as using Jev as a small reflex layer before its larger reasoning system. **Why:** Make quick decisions about questions, speech completion, and listening state. **Conditions:** The promotional V7.1 implementation; actual routing code is not supplied. **Evidence:** JARVIS V7.1–JEV course text at 16:48. **Label:** SOURCE, implementation claim unverified.
18. **Claim:** The course states the local reflex sends short excerpts of notes rather than all stored material. **Why:** Limit transferred context. **Conditions:** Trust in the uninspected implementation. **Evidence:** Course instructions at 16:44. **Label:** SOURCE, privacy claim unverified.

# C. Procedures as ordered steps

## 1. Build a controlled two-lane desk
1. Establish a support policy and a test inbox before benchmarking; the PDF separates these from the foundation prompt.
2. Define the four dispositions and internal priority handling.
3. Implement a baseline that sends every message to the same named Opus writer/decider.
4. Implement a second lane that obtains Jev's structured decision first and invokes Opus for drafts only.
5. Keep model, effort, policy, and input messages equivalent between lanes.
6. Save simulated filing, tasks, review items, and drafts; do not send customer messages during the experiment.
7. Display completed-message count, elapsed time, writer-call count, per-message outcomes, and inspectable stage traces.

The supplied material shows the finished app and PDF instructions, not the coding session or exact source code.

## 2. Connect the decision tool through Zapier
1. Prepare a Zapier MCP server for the relevant client. A Claude MCP Server is visible at 11:10.
2. Add the TypeSafe Jev app/action to the server's exposed tools; merely creating the server is insufficient according to the PDF.
3. Put the provider API key in the TypeSafe Jev connection.
4. Put the MCP connection credential in the application's MCP configuration; the PDF identifies an `.env` destination for its build.
5. Verify that the client is connected and can discover the intended action.
6. Exercise a typed decision request and inspect actual returned labels, confidence, and errors.

Exact action names, URLs, authentication commands, environment-variable names, and request schema are UNKNOWN.

## 3. Evaluate routing benefit
1. Start with a single non-writing case such as the supplied checkout problem.
2. Inspect whether both lanes produce the expected disposition and priority.
3. Inspect the combined lane's trace to confirm that an Opus call was actually avoided.
4. Run the same 12-message batch in each lane.
5. Compare completed outputs as well as elapsed time and writer-call count.
6. Open a draft-reply case to confirm that the writer still runs when needed.
7. Inspect fallback causes and repeat after changes. The PDF explicitly recommends rerunning its test prompt after big changes.
8. Treat displayed timings as local observations, not universal benchmarks.

## 4. Recover from integration problems
1. For an invalid OAuth-token error, check that the provider key and MCP credential have not been swapped.
2. If only configuration discovery is available, verify that the Jev action has actually been added.
3. If every message falls through to Opus, inspect the underlying managed-tool error rather than assuming Jev is merely slow.
4. Correct schema types, including numeric confidence versus text.
5. Rerun the same test suite and verify route counts, not just successful final output.

## 5. Adapt the documented Jarvis installation
1. Obtain the course's versioned Jarvis ZIP and place it in Downloads, as the page instructs.
2. Ask Claude Code to install it, or upgrade an existing installation while preserving the user's brain, notes, and settings.
3. For optional reflexes, obtain a TypeSafe API key and have the local configuration use it. Do not copy secrets into research notes or shared prompt packs.
4. Open the local Jarvis application and check its status and decision telemetry.

The course displays a localhost address in its instructions, while the demonstrated dashboard is at `localhost:4719`; do not assume a universal fixed port. Installation and upgrading are instructions on a page, not observed execution.

# D. Shown on screen

- **00:00, 00:14, 00:24, 00:32, 00:50:** Browser-based AI Support Desk at `localhost:4870`. Lanes are labeled “Opus 5.5 alone” and “Jev + Opus 5.5.” Presets include “URGENT! Last chance,” “Checkout problem,” “Website for our bakery,” “All 3,” and “12-message set.” “Write your own” and “Run comparison” controls are visible. Their activation sequences are not established.
- **00:12:** Stylized transition showing tilted comparison screens; not independent benchmarking evidence.
- **00:44, 00:46, 00:48:** Browser PDF viewer for a local AI Support Desk prompt pack. Visible headings include “What you are building,” “Build the two-lane desk,” and “Make it look like a product.” Prompt text blocks exist, but a reliable verbatim transcription of the small text is unavailable.
- **02:52:** Checkout detail overlay. Both lanes show Follow-up–P1 and an expected-match indicator. Baseline shows Opus deciding; combined lane shows Jev deciding and a task saved. Raw details beyond the readable labels are UNKNOWN.
- **04:36:** Pointer over “12-message set”; no proven click.
- **05:00:** Batch selector is selected, but single-message counters remain. This is a setup state, not a demonstrated completed batch run.
- **06:44:** Completed 12-message comparison. Examples visible include “Quick one,” “Price for a small site?”, “Maintenance after launch?”, and “Adding an online store.” Dispositions include review and saved drafts. Bottom areas expose results/tasks/drafts/review groupings.
- **07:54:** “Price for a small site?” detail overlay. The message asks about a simple five-page business site, cost, and duration. Both lanes show a draft reply. Combined-lane stages visibly distinguish Jev deciding from Opus writing. The draft contains business prices and delivery estimates; these are demonstration policy content, not verified quotations or market rates.
- **11:10:** Zapier “Claude MCP Server,” connected client Claude. Apps tab lists TypeSafe Jev, Google Calendar, Google Sheets, Gmail, Slack, AI By Zapier, Skool, and Canva. Tabs include Apps, Skills, Connect, History, Settings. Listed apps do not prove they were invoked.
- **13:58, 16:52:** Jarvis at `localhost:4719`: dark node-link graph, category legend, left-side filters and sliders, circular Jarvis emblem, lower activity/timeline region, and controls including WATCH/FOCUS/REFLEX. Their behavior is not demonstrated by these stills.
- **15:16:** Separate Zapier “Jarvis Server,” listing Google Calendar, Gmail, Google Drive, Google Sheets, Google Docs, and Slack. Presence is visible; action execution is not.
- **15:28:** Claude settings window on Connectors → Zapier with Connected status. This establishes a displayed connection state, not a successful particular tool call.
- **15:44–15:48:** Fourteen-page PDF cover, scope, and “What to expect, honestly” measurement/caveat table. Cover advertises nine copy-paste prompts. PDF text dates measurements to September 2026; that date is a source assertion, not external validation. Exact token-price entries are not reliably readable and remain UNKNOWN/UNVERIFIED.
- **15:50–15:54:** Foundation prompt; “The policy and the test inbox”; continuation of integration instructions. At 15:54 a visible customization note discusses replacing the Zapier MCP server and matching managed tools to configured names/operations.
- **15:56–16:02:** Dashboard prompt, test-prompt continuation, “Six lessons from building it,” then test-prompt page again. The PDF advises rerunning the test prompt after big changes.
- **16:04:** AI Workshop Lite community feed.
- **16:16–16:20:** Classroom lesson titled “JARVIS with Claude Opus 5.5,” an embedded video, and a PDF resource link. This is not clearly the same support-desk PDF shown earlier.
- **16:24, 16:26:** Support-desk PDF revisited, including “Test it and lock it down” and the foundation section.
- **16:28:** Completed comparison dashboard again; no new run is established.
- **16:36, 16:42:** Community lesson list and course cards, including AI Assistants & AI Employees, Claude Code Masterclass, Second Brain, and Voice AI.
- **16:44:** Course installation/upgrade instructions, optional TypeSafe reflex setup, and claims about local handling and note excerpts.
- **16:48:** Selected “JARVIS (V7.1) – JEV” lesson and promotional description of reflex behavior.
- **17:26:** Closing graphic.

**Not visible:** Actual Claude Code build session; repository; source files; executable API integration; exact Jev schema; MCP connection token; provider key; complete benchmark logs; model API response metadata; successful real-world tool actions; verified per-request billing.

# E. Said vs shown mismatches

- **Spoken evidence:** UNKNOWN because no transcript or audio is supplied. Description and chapter headings must not be relabeled as things the presenter was heard saying.
- **“10× faster” framing:** The UI asks whether Jev can make Opus 10× faster. Displayed batch results instead imply about 1.72×, and the rounded checkout totals imply about 6.3×. These are local demo numbers, not validated benchmarks.
- **“Build in Claude Code”:** Metadata promises this chapter, but no supplied frame shows commands, edits, or a completed coding interaction.
- **“Add Jev API”:** The chapter exists; actual key entry and a successful API response are not visible.
- **“9,000 apps”:** Description and connector copy advertise ecosystem reach. Screens show a small configured subset, not tested access to 9,000 services.
- **Model identity:** “Claude Opus 5.5” appears in titles and app labels, but no API model identifier or provider response proves the backend. The claimed model release status and comparison to Opus 5 remain unverified.
- **Final results versus testing process:** Completed summaries appear repeatedly; repeated display is not evidence of repeated independent trials.
- **Jarvis workflow:** Graphs and course descriptions are visible. Speech-turn decisions, note-excerpt transmission, and real tool execution are not directly demonstrated in the supplied stills.

# F. Failures and recoveries

1. **Wrong credential in the wrong place.** PDF reports an “Invalid OAuth token” failure. Recovery: keep the TypeSafe key in its Zapier connection and the MCP credential in the application's MCP configuration.
2. **Empty managed server.** PDF says a new server exposes configuration discovery until actions are explicitly added. Recovery: provision the intended Jev action and verify availability.
3. **Confidence serialized as text.** PDF reports tool rejection on every request, followed by smooth Opus fallback. Recovery: correct the type and inspect fallback errors and route counts.
4. **Silent performance regression.** Final answers may stay correct while the router is never used successfully. Recovery: test routing invariants after large changes, not merely answer quality.
5. **Writing dominates elapsed time.** Not a malfunction: a reply-heavy workload reduces the value of fast decisions. Recovery: assess workload composition and separate decision latency from drafting latency.
6. **Observational gap.** None of the above integration failures is replayed in the supplied frames. They are documented lessons, not observed live incidents.

# G. Decision points

- IF a message only needs filing, THEN save the disposition without invoking the prose writer.
- IF the policy requires an internal follow-up, THEN create the task and priority; the checkout example is P1.
- IF a customer-facing response is required, THEN let Jev route and Opus draft.
- IF the result requires review, THEN surface it for review rather than treating it as an approved reply.
- IF the managed server exposes only configuration discovery, THEN add/check the intended action before debugging model quality.
- IF authentication reports an invalid OAuth token, THEN inspect credential placement before replacing unrelated components.
- IF every request invokes Opus, THEN inspect router errors and fallback causes before claiming Jev is slow.
- IF confidence arrives with the wrong type, THEN fix serialization and rerun the test set.
- IF comparing architectures, THEN hold writer model, effort, policy, and input constant.
- IF presenting Jev traces, THEN show actual structured outputs and separately label any generated explanation.
- IF most messages need long drafts, THEN expect a smaller end-to-end speed benefit.
- IF adapting Jarvis, THEN treat voice-reflex and privacy claims as hypotheses to test, not established behavior.

# H. Tools/repos/MCPs named

- **Claude / claimed Opus 5.5:** Baseline decision-maker and writer; conditional writer in the combined lane. Backend identity unverified.
- **Claude Code:** Claimed build/install/upgrade agent; no coding session supplied.
- **TypeSafe AI Jev / TypeSafe Jev:** Structured decision layer; connected through Zapier in the demonstrated support-desk architecture.
- **Zapier MCP:** Tool bridge and action provisioning. Separate Claude MCP Server and Jarvis Server configurations are visible.
- **Claude Zapier connector:** Connected status visible in desktop settings.
- **Jarvis:** Local assistant interface and advertised optional reflex integration; distinguish the source's Jarvis build from Evens's operator implementation.
- **Google Calendar, Gmail, Google Sheets, Slack:** Listed in both visible server configurations.
- **Google Drive, Google Docs:** Listed in Jarvis Server.
- **AI By Zapier, Skool, Canva:** Listed in Claude MCP Server.
- **Skool / AI Workshop Lite / AI Workshop:** Community, lessons, downloadable prompt packs, and paid-build promotion.
- **Browser PDF viewer:** Used to display the support-desk prompt pack and its implementation lessons.
- **Repositories:** NONE supplied. No GitHub URL, package repository, or inspectable implementation is established.

# I. Challenges

- This is a promotional demonstration with community/build offers and a Zapier link, not an independent benchmark.
- The absent transcript and sparse frames prevent verification of explanations and intermediate operations.
- Model release claims, provider pricing, advertised install times, privacy assertions, and the September 2026 PDF date require external checking.
- One batch cannot establish latency distributions, accuracy, stability, or production economics. No repeated trials, cold/warm separation, concurrency specification, or workload randomization are supplied.
- Fewer Opus calls do not directly establish total monetary savings: Jev, Zapier/MCP, token lengths, retries, and fallbacks also cost resources.
- Expected-match indicators could reflect a small hand-authored fixture. No independent labeling process or error analysis is visible.
- Schema failures demonstrate that a fast decision model is only useful if its surrounding integration is correct and observable.
- The “System One” framing describes a product role, not evidence of particular underlying architecture or guaranteed reasoning quality.
- Full prompt text and exact API parameters cannot responsibly be reconstructed from small screenshots.

# J. Use for Jarvis

Evens's Mac operator could reproduce the **separation of duties**, not blindly clone the promoted build. Start with a dry-run inbox/task router: deterministic policy and typed dispositions in front, a stronger model only for composition or difficult cases, and human approval before external writes. Use the Mac browser to inspect the actual MCP server's exposed actions and connector state; do not invent navigation beyond what is visible in the current UI.

Instrument each request with decision outcome, schema-validation status, fallback cause, writer-call count, and end-to-end latency. Keep raw classifier output separate from the assistant's explanation. Build a small labeled fixture covering filing, urgent follow-up, drafting, and review, then rerun it after configuration changes. If voice reflexes are explored, first test interruption and end-of-turn decisions in a non-actuating sandbox. Preserve existing notes/settings during upgrades and verify what context leaves the Mac. These are analyst applications, not operations observed in the video.

# K. Open questions

1. What exact provider model IDs and effort settings powered each lane?
2. What Jev endpoint/action, schema, labels, confidence type, and thresholds were used?
3. Were the lanes run sequentially, concurrently, or under different cache/network conditions?
4. What are the complete 12 messages, expected labels, and policy text?
5. How many repeats were run, and what are the error rates and latency percentiles?
6. What does the timer include: tool discovery, Zapier overhead, retries, writes, and rendering?
7. What is the actual total cost including Jev, Zapier, token usage, and fallback?
8. Which tool errors trigger fallback, and are they exposed to the operator?
9. Does review mean low confidence, policy ambiguity, missing data, or another condition?
10. Is the advertised Jarvis reflex using direct API access or the same MCP route?
11. What data actually leaves the local Jarvis installation, and how are keys stored?
12. Where is the inspectable source, and can the benchmark be reproduced without joining the community?
13. Is the visible Jarvis lesson's downloadable PDF the support-desk pack or a separate installation pack?

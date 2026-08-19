# Big Boss — jBanaNBY-sM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jBanaNBY-sM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jBanaNBY-sM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 29:37, 7382 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Telegram stills, Drive `media` / `media analysis` folders, three preview stills, JBL VFX clip, text-to-video B-roll, Dexter email, Google Doc, TikTok post, Sheets logger, n8n canvas, FAL poll, Blotato nodes, Apify actors, cost slide, Skool zip of nine workflows. Jets / air-show aside is on tape.

This is the setup tape. Sibling short `IlNwjnIzrOo` is the magnet (same ingest → name → three previews → pick → JBL VFX). The short stops before send / scrape / post / logger / prompts / costs. This long reconstructs the full system.

Beats, in order:

1. Claim: “ultimate media agent.” Personal-assistant tools (email, Drive, calendar) + creative (create/edit image, create video, image→video) + post X / TikTok / Instagram + log everything including errors.
2. CTA: entire system “for free”; stick to the end for setup.
3. Operator surface is Telegram. He sends an image. Agent lands it in Drive, then asks name + sharing.
4. Human: name it “speaker.” Sharing untouched. Drive specialist runs `change name`. Telegram returns a link. File sits in folder `media`, named `speaker`.
5. Human: edit into a studio look — energetic, colorful, “feeling of listening to music on a speaker.” “Whatever that means. The media team will figure it out.”
6. Main brain: GPT-5 Mini (Open Router) routes to creative specialist (`edit image`). Think tool used because many actions.
7. Creative returns **three** 1024×1024 proofs. Agent asks confirm before 2048 finals. Human likes #1. Files named `speaker studio vibrant`.
8. Human: take the first preview → VFX ad with music and lights synced to the beat, JBL speaker advertisement. Image-1 / V3 Fast named on tape.
9. Creative has “full autonomy.” Starts requested image→video **and** a text-only video he did not ask for. He is “not too confident” about the unsupervised one.
10. Image→video: “very, very impressed.” Text-to-video: no JBL branding / speaker; he still calls it possible B-roll. Both V3 Fast. Agent: “two files… what next?”
11. Human: send the JBL VFX to Dexter Morgan. Contact agent finds email. File set “anyone with the link.” Email sent. Sign-off is “best your name” placeholders — he blames his prompt. Dextermiami.com joke. Link downloads the ad.
12. Human: find two high-performing n8n videos on TikTok, Instagram, YouTube. Social specialist scrapes all three via Apify in parallel (30% off code on tape). Results: titles, URLs, creators, stats. Human: put insights in a Google Doc. Main agent owns `create doc` (not a specialist). Doc lands in `media analysis`. Earlier test file: “don’t forget to make your bed.”
13. Calendar and web skipped (“you’ve seen that before”).
14. Human: post the JBL VFX to TikTok, caption “music to my ears.” Five-window memory; must re-find file ID. File must be public for Blotato. Submission ID returned. He opens TikTok: posted 1 minute ago.
15. Architecture: Telegram in → switch (photo vs text) → photo path downloads to Drive and normalizes `message.text` → manager agent + specialists → clean intermediate steps → Sheets logger → Telegram out. Logger columns: timestamp, workflow, input, output, actions, tokens, total tokens, model per object. Return intermediate steps. Success **and** error branch (`continue on error`) so a fail still logs.
16. Manager system prompt: “ultimate manager.” Do **not** write emails or summaries. Sole job: call the correct tool. Specialists: Drive, email, calendar, contact, social, creative, posting, web, create-doc, think. Tool descriptions stay high-level; detail lives on the specialist (token cost). Seven notes: photo → ask name then rename; some actions need contact first; media lives in Drive; think before follow-up questions; **before posting, file must be shared to anyone**; video length — don’t ask (V3 ≈ 8s); always output a message.
17. Fallback model: GPT-5 Mini via OpenAI if Open Router dies. He notes both die if OpenAI is down.
18. Custom tools are sub-workflows (binary). Create image / edit image (OpenAI); create video / image→video (FAL → V3 Fast + poll). Chat ID from Telegram trigger. Binary can Telegram-reply **before** the manager’s text reply.
19. Insert: no AI inside the video subflow. Prompting lives on the creative specialist. He tried a JSON prompt-agent in the subflow; inconsistent; ripped it out; happier with autonomy. History shows the agent ~20 minutes earlier.
20. Posting tools: file ID + caption → Blotato → X / TikTok / IG (platform switch only). Create-doc: title + content → create then update → link.
21. Social specialist: three Apify actors (YouTube / IG / TikTok). Search term + count. Swap scrapers as needed.
22. Cost slide (all **UNVERIFIED**): GPT-5 Mini main; some subs still on 4.1; image ~1¢ / 4¢ / 17¢ (he used medium ~5¢); V3 Fast text-to-video 25¢/s, 40¢/s with audio; image-to-video audio-on same, silent more; “experimental.” Blotato $29/mo + Nate30 30% off 6 months. Apify tiers + 30 Nate Herk 30% first 3 months. Web: Perplexity, Tavily, Open Weather.
23. Setup: free Skool zip = **nine** workflows (4 creative + 3 post + create-doc + main). Click tool → must open the named workflow. Folders: `media`, `media analysis`. Sheets logger template. Plus: courses, weekly call, monthly hackathons “over $6,000” prizes. **$ UNVERIFIED.**
24. Close: like + jets.

Off-topic / not skipped: Dexter return joke; Network Chuck local-n8n hits; “don’t forget to make your bed”; air-show jets; affiliate codes.

## B. Atomic Knowledge

### Telegram is the CEO seat; specialists own tools
- **Claim:** The human talks in one Telegram chat. A manager agent fans out to Drive, email, calendar, contact, social, creative, posting, web, create-doc, think.
- **Reasoning:** One surface is enough if each bucket owns tools. The human never opens Drive to rename.
- **Mechanism:** Photo/text switch → normalize `message.text` → manager → specialists / sub-workflows → log → Telegram reply.
- **Evidence:** Image in → `media/speaker` → Telegram link. Later prompts refer to that handle.
- **Conditions:** Human stays in the loop for name, share, which preview, motion brief, send, and post.
- **Exceptions:** Calendar and web exist and are skipped on tape.
- **Action:** Map “one chat → named specialists” to 17 desks, not a nameless army.
- **Confidence:** high for the demo shape; low for “ultimate / anything.”
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “we talked to our agent through Telegram”
- **Epistemic:** SOURCE

### Human names the artifact before the team edits
- **Claim:** After ingest, the agent asks what to call the file (and about sharing) before creative work.
- **Reasoning:** A named file in a known folder is the handle later messages use (“edit that image,” “first preview file,” “that JBL VFX”).
- **Mechanism:** Drive specialist `change name`. Manager note: “if the user submits a photo, ask them what to call the photo, then change the name.”
- **Evidence:** “just name it speaker”; link opens that upload in `media`.
- **Conditions:** Next prompt refers to the named file, not a new upload.
- **Exceptions:** Share-settings asked, then skipped on this ingest (used later for email + post).
- **Action:** Definition of done includes a named artifact in a known folder before style work.
- **Confidence:** high
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “name it speaker” / “folder called media”
- **Epistemic:** SOURCE

### Vague brief, three proofs, confirm before final render
- **Claim:** A mushy taste brief is acceptable if the team returns multiple styles and asks before burning the final render.
- **Reasoning:** He shrugs “whatever that means.” Taste is downstream of options. 1024 proofs are cheap; 2048 is the spend.
- **Mechanism:** Creative `edit image` → three stills → “confirm before I render final 2048 deliverables.”
- **Evidence:** Three styles shown; he picks #1; only then video.
- **Conditions:** Human still chooses. Three is the option count on tape, not a law.
- **Exceptions:** Tape does not show a rewrite if all three miss.
- **Action:** “N previews, human picks” is the checkable stop — not auto-post the first still, not auto-render 2048.
- **Confidence:** high for the demo; medium as a general creative rule
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “three different images” / “confirm before I render final 2048”
- **Epistemic:** SOURCE

### Manager must not do the work
- **Claim:** The lead’s sole job is to call the correct tool. It must not write emails or create summaries.
- **Reasoning:** If the lead does specialist work, the bucket model collapses and tokens bloat.
- **Mechanism:** System prompt: “ultimate manager… sole responsibility is just to call the correct tool.” Detail lives on specialists so the lead’s tool list stays thin.
- **Evidence:** Drive owns rename; creative owns edit/video; contact owns Dexter; posting owns TikTok; create-doc is the one tool he left on the lead.
- **Conditions:** Works when specialists exist and descriptions are enough to route.
- **Exceptions:** `create doc` sits on the lead because “it didn’t really make sense” in another bucket. Think tool is on the lead.
- **Action:** I define done and route. Desks execute. I do not write the email.
- **Confidence:** high
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “You yourself should not be writing emails or creating summaries”
- **Epistemic:** SOURCE

### Specialist autonomy includes unsupervised extra work
- **Claim:** Given “full autonomy,” creative starts the requested image→video **and** a text-to-video he did not ask for.
- **Reasoning:** Autonomy = tool use without a new human click per tool. Side-quest is the cost.
- **Mechanism:** Parallel jobs: (1) image → VFX with beat-sync, (2) text-only video. Both V3 Fast.
- **Evidence:** He narrates both; “not too confident” on (2); reviews (1) as impressed; (2) as B-roll without branding.
- **Conditions:** Useful when the requested job is clear. Extra jobs need a later human reject.
- **Exceptions:** He does not kill the extra job; he reviews it and keeps it as optional B-roll.
- **Action:** Extra unsupervised video stays operate-never as ship. Volunteer must be labeled and excluded from done.
- **Confidence:** high that it happened; medium that extra work is net-positive
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “full autonomy” / “also wanted to try out creating its own video with just text”
- **Epistemic:** SOURCE

### Prompt-in-the-subflow lost to autonomy
- **Claim:** He first put a JSON prompt-agent inside the video sub-workflow. Inconsistent. He ripped it out. Happier with the creative specialist writing prompts.
- **Reasoning:** A second prompted brain in the tool path was “very specific to one use case” and threw the reference image in randomly.
- **Mechanism:** Subflow has **no** AI step — variables in, FAL poll, file out. Prompting stays on the creative specialist (detailed image prompts; concise one-shot video prompts with sound).
- **Evidence:** Workflow history ~20 minutes earlier still has the prompt agent. He shows the delete.
- **Conditions:** Autonomy won **this** demo. He says a locked use-case can put an agent back in the subflow.
- **Exceptions:** “Maybe I’m not the best at JSON prompting.”
- **Action:** Do not add a second brain in the tool path until the first pick gate is proven. Locked recipes stay optional, not default.
- **Confidence:** high for what he did; medium that autonomy always beats a recipe
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “I ended up taking it away and I was happier with those results”
- **Epistemic:** SOURCE

### Send and post are hard steps the demo treats as easy
- **Claim:** After the ad exists, he emails Dexter and posts TikTok from the same chat, no second human gate.
- **Reasoning:** The army’s job, on his tape, includes delivery. Placeholders shipped. File must be public before Blotato.
- **Mechanism:** Contact lookup → share anyone-with-link **or** specific email → Gmail. Post: re-find file ID (5-window memory) → share public → Blotato TikTok + caption.
- **Evidence:** Email sent with “best your name.” TikTok live “1 minute ago,” caption “music to my ears,” submission ID.
- **Conditions:** Demo account, fictional Dexter, his TikTok. Not a client send.
- **Exceptions:** He dislikes the placeholder sign-off and owns the prompt miss. He does not unsend.
- **Action:** Steal the **lookup → share → draft** wire. Operate-never the send and the auto-post.
- **Confidence:** high that it posted; high that hive will not operate it
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “it posted the ad to Tik Tok” / “sent the email”
- **Epistemic:** SOURCE

### Log success and failure or you are flying blind
- **Claim:** Every run writes timestamp, input, output, actions, tokens, model — including errors.
- **Reasoning:** Without the error branch, a fail stops the flow and you get no log and no Telegram ping.
- **Mechanism:** Return intermediate steps → clean → Sheets. Agent setting: continue on error → success **and** error branch.
- **Evidence:** He opens the row for the TikTok post: tools called, prompt/completion tokens, model per object.
- **Conditions:** Logger is useful when a human reads it and changes prompts / routing.
- **Exceptions:** He promises visibility; he does not show a real error row on tape.
- **Action:** Watchdog reads a log. A run that cannot fail-loud is not done.
- **Confidence:** high for the wire; medium for the hygiene in production
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “logs everything it does, even if there are errors”
- **Epistemic:** SOURCE

### Thin lead descriptions, fat specialist descriptions
- **Claim:** Manager tool blurbs stay high-level so the lead does not pay tokens to re-read specialist SOPs every turn.
- **Reasoning:** “If you make this really chunky, you’re just going to be using more tokens.”
- **Mechanism:** Lead list = bucket names. When-to-use detail lives on the sub-agent / tool.
- **Evidence:** He reads the manager prompt and the seven notes; he does not paste creative’s full prompt into the lead.
- **Conditions:** Routing still works if the bucket name + one line is enough.
- **Exceptions:** Seven hard notes **are** on the lead (name photo, contact-first, Drive for media, think first, share-before-post, don’t ask video length, always reply).
- **Action:** Job cards stay thin at the router; owns/never lives on the desk.
- **Confidence:** high
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “descriptions of these tools are very, very high level”
- **Epistemic:** SOURCE

### Share-to-anyone is a pre-condition, not a nicety
- **Claim:** Before email-with-link or Blotato post, the Drive file must be shared to anyone (or a specific email).
- **Reasoning:** Downstream tools fetch a public URL. Private file = silent fail.
- **Mechanism:** Manager note: “Before posting anything, that file must be shared to anyone in Google Drive.” Email path may share-to-email **or** anyone-viewer.
- **Evidence:** Dexter path: “set the video to anyone with the link.” TikTok path: “making sure the file is actually public because… potato.”
- **Conditions:** Only if the delivery tool needs a public URL.
- **Exceptions:** Ingest-time sharing question was skipped; later steps forced the share.
- **Action:** Permissions checklist before any delivery. Public-to-the-web is a Watchdog smell, not a default.
- **Confidence:** high for his stack; hive will not public-share to auto-post
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “Before posting anything, that file must be shared to anyone”
- **Epistemic:** SOURCE

### Memory is short; the folder is the memory
- **Claim:** Five-window chat memory is not enough to post a file discussed earlier. The agent must search `media` for the file ID.
- **Reasoning:** Chat is a surface, not a database. Drive is the handle store.
- **Mechanism:** Search-media tool scoped to the `media` folder; search-docs scoped to `media analysis`.
- **Evidence:** He says they “weren’t most recently talking about this ad” so it must look up the ID.
- **Conditions:** Works if naming + folder discipline held.
- **Exceptions:** If two JBL files exist, tape does not show disambiguation.
- **Action:** Named folder + named file is the memory. Do not trust a five-turn window.
- **Confidence:** high
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “five window context length” / “search through the actual media folder”
- **Epistemic:** SOURCE

### Binary subflows reply before the manager
- **Claim:** Creative/post tools are separate workflows because binary is annoying across flows. Telegram can get the file **before** the manager’s text.
- **Reasoning:** He split tools to isolate binary, not to add intelligence.
- **Mechanism:** `When executed by another workflow` + typed inputs (name, prompt, chat ID, file ID). Chat ID copied from the Telegram trigger, not from the model.
- **Evidence:** He warns viewers they may see a media ping before the manager sentence.
- **Conditions:** Chat ID must be a variable, not an AI-defined field, or replies go to the wrong chat.
- **Exceptions:** Create-doc is not binary; still a subflow.
- **Action:** Pass small typed variables. Do not let the model invent the operator’s chat ID.
- **Confidence:** high for the pattern; operate-never his n8n/FAL/Blotato
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “we have to handle binary data”
- **Epistemic:** SOURCE

### Cost slide and Plus hackathons are the close, not the machine
- **Claim:** After the demo he prices tokens, images, V3 seconds, Blotato $29, Apify, and Plus monthly hackathons “over $6,000.”
- **Reasoning:** Free Skool zip hooks; Plus is the paid room.
- **Mechanism:** Nine-workflow zip + folder names + Sheets template. Affiliate codes on tape.
- **Evidence:** Closing minutes. **$ UNVERIFIED.**
- **Conditions:** Only relevant as his funnel, not ours.
- **Exceptions:** He says setup is “not a super simple two-minute setup.”
- **Action:** Do not quote tape $ as FACT. Do not join Skool / install the zip as hive OS.
- **Confidence:** high that he said the numbers; zero as our prices
- **Source:** `jBanaNBY-sM` @ UNKNOWN — “hackathons with over $6,000 of prizes”
- **Epistemic:** SOURCE (he said it) / UNVERIFIED ($)

## C. Mental Models

- **One chat, many specialists.** Telegram is the CEO seat. Drive / creative / social / posting are workers with tools. **SOURCE**
- **Manager manages.** Lead calls tools. Lead does not write the email. **SOURCE**
- **Taste is a pick among options, not a perfect brief.** Shrug brief + three proofs + human pick. **SOURCE**
- **Autonomy is allowed to surprise him.** Extra text-to-video runs; he discounts it to B-roll. **SOURCE**
- **A second brain in the tool path is optional, not default.** JSON prompt-agent lost to specialist autonomy. **SOURCE**
- **Logging = later trust.** Intermediate steps + error branch. Trust is a sheet a human reads. **SOURCE**
- **Chat is short; the folder is long.** Five-window memory loses the file; Drive search finds it. **SOURCE**
- **Share-before-deliver.** Public URL is a precondition for his post/email tools. **SOURCE**
- **“Ultimate / anything” is marketing.** The prompt is seven notes and a router. **INFERENCE**
- **Impressed result + free zip + Plus $ = the funnel.** **INFERENCE**

## D. Procedures

1. **Ingest:** human drops media on the chat surface (Telegram).
2. **Switch:** photo → download to Drive + set text; text → straight to manager.
3. **Place:** file in known folder (`media`). Ask **name** and **sharing**.
4. **Name:** human returns a single token (“speaker”). Drive specialist `change name`. Chat returns a link. Checkable stop: open the link, confirm folder + name.
5. **Brief:** human sends a taste sentence. Does not specify tool or model.
6. **Think:** manager uses think before extra questions.
7. **Options:** creative returns N styled stills (here, three 1024 proofs). Ask before 2048.
8. **Pick:** human names the winner (“first preview file”).
9. **Escalate:** human asks for motion on **that** file and names the product (JBL).
10. **Watch autonomy:** specialist may start extra jobs. Human keeps a reject for unsupervised output.
11. **Review requested job.** Volunteer clip is not the ship artifact unless picked.
12. **Delivery (his tape):** lookup contact / file ID → share → email or Blotato post. **Hive stops at draft.**
13. **Log:** success **and** error rows. Human reads actions + tokens.
14. **CTA:** short magnet (`IlNwjnIzrOo`) points here; this tape points at Skool zip + Plus.

**Qualify / frame:** content-ops demo, not a client delivery. JBL is a prop. Dexter is a joke contact.
**Objections:** “It can do anything” — answer with the pick gate, the placeholder email, and the unreviewed-as-ship extra video. “Just let it post” — post is a hard step.
**Avoid:** treating Telegram, Drive, FAL, Blotato, Apify, n8n, Vapi as the hive stack. On-tape tools stay on tape.
**When to change:** if the human cannot point at a named file, stop. If a specialist starts a volunteer job, label it. If the next step is send/post, HITL.

## E. Examples

**Situation:** Image dropped in Telegram with no name.  
**Action:** Agent asks name + sharing; human says “speaker”; Drive specialist renames; Telegram returns a link.  
**Reasoning:** Later prompts need a stable handle.  
**Outcome:** File exists in `media` as `speaker`.  
**Lesson:** Name-and-folder is the first checkable stop. Implicit rule: do not creative-edit an unnamed blob.

**Situation:** Taste brief is vague (“studio… energetic, colorful… feeling of listening to music”).  
**Action:** Creative returns three 1024 proofs and asks before 2048; human picks the first.  
**Reasoning:** Options beat a perfect prompt when taste is the product. Final render is a spend.  
**Outcome:** One still becomes the video source.  
**Lesson:** N previews + human pick is the machine. Implicit rule: the brief can be mushy if the pick is sharp.

**Situation:** Human asks for image→VFX ad for a JBL speaker.  
**Action:** Creative starts that job and a text-only video he did not request.  
**Reasoning:** “Full autonomy” includes extra tool use.  
**Outcome:** Requested video praised; text-only kept as possible B-roll, no JBL brand.  
**Lesson:** Autonomy without a reject list produces side-quests. Implicit rule: ship the asked artifact; park the volunteer.

**Situation:** He put a JSON prompt-agent inside the video subflow.  
**Action:** Output inconsistent; reference image thrown in randomly; he deletes the agent; prompting stays on the creative specialist.  
**Reasoning:** Second brain in the tool path was brittle and use-case-locked.  
**Outcome:** Happier with autonomy. History still shows the old graph.  
**Lesson:** Recipe-in-the-tool is optional. Implicit rule: do not add a second prompted step until the first pick gate works.

**Situation:** “Send the JBL speaker VFX to Dexter Morgan.”  
**Action:** Contact lookup → share anyone-with-link → email. Sign-off is placeholders.  
**Reasoning:** Manager must not write the email; email specialist does. Prompt omitted the sign-off.  
**Outcome:** Mail sent. He dislikes the footer, does not unsend.  
**Lesson:** Send is a hard step. Implicit rule: placeholders shipping is a prompt miss **and** a missing HITL read.

**Situation:** “Post that JBL VFX on TikTok, caption music to my ears.”  
**Action:** Re-find file ID in `media` (memory too short) → make public → Blotato TikTok. Live in one minute.  
**Reasoning:** Post tool needs a public URL. Chat window is not the database.  
**Outcome:** Real post on his account.  
**Lesson:** Auto-post works on tape. Operate-never for the hive. Implicit rule: folder search ≠ permission to publish.

## F. Decision Rules

- If the file is unnamed → ask name (and sharing) before edit.
- If the brief is taste → return multiple stills; ask before final render; do not jump to video.
- If the human names a preview → that file is the only source for motion.
- If a specialist starts an extra job → do not treat it as the deliverable until a human reviews it.
- If the lead starts writing the email or the summary → the manager prompt has failed.
- If the next step is email or post → hive drafts only; Evens sends / publishes.
- If the file must leave the building → check share settings on purpose (not “anyone” by default).
- If the run errors → still log and ping. A silent fail is not done.
- If chat memory cannot see the file → search the named folder; do not invent an ID.
- If a JSON recipe in the tool path fights the specialist → rip the second brain (his move) or lock the recipe (his exception). Do not do both.
- Optimize: speed of “image in chat → named file → options → pick → requested motion.”
- Refuse (on this desk): auto-post, unsupervised extra video as ship, Telegram/Drive/n8n/FAL/Blotato/Apify army as hive OS.

## G. Contrarian

- Against “one perfect prompt”: shrug brief + pick.
- Against “human must drive every tool”: specialists own `change name` / `edit image` / FAL.
- Against “autonomy means unsupervised ship”: he still picks the still; extra video is B-roll, not the ad.
- Against “put a prompt agent in every subflow”: he tried JSON V3 prompting and deleted it.
- Against “the short is the system”: the short is the magnet; this long is the recipe — and the recipe includes send/post we will not operate.
- Field assumes a media army. He built a **router + named buckets**. The army is a costume.

## H. Assumptions

**His:** Telegram + Drive + n8n specialists is the right OS; three styles are enough; JBL VFX is impressive enough to CTA; extra text-to-video is worth the tokens; Blotato + Apify + public Drive is an acceptable post path; “for free” zip + Plus $6k hackathons convert; GPT-5 Mini can run the lead.

**Ours:** Captions are complete enough (7382 words). Visual quality of stills / VFX / TikTok is **UNVERIFIED** (not seen). “Ultimate / anything” is survivorship + edit. Domain-specific: creator media ops, not a plumber book-flow. Sibling short `IlNwjnIzrOo` is the same demo truncated — **SYSTEM SYNTHESIS** (PACKET titles + overlapping beats). Tape $ / 30% codes / $6k prizes = **UNVERIFIED**.

**Falsifiers:** Extra unsupervised video is worse than useless (cost, brand miss). Three previews all miss and there is no rewrite loop. Link-back to Drive fails. Public-share leaks a client file. Auto-post ships a wrong file because two JBL names collide. Long does not match the short.

**Disagreement (keep labeled):** Hive will not operate a Telegram media army, Apify scrape, Blotato auto-post, or Dexter-class send. The **name → N previews → human pick → requested motion only** machine is still stolen. Manager-does-not-do-the-work and log-on-error are stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Who reads the action log, and what change did a row ever cause?
- Sharing-settings: when would he **not** make the file public?
- Is “three” a default, a model quirk, or a prompt?
- Did the 2048 confirm ever fire, or did he skip finals?
- Five-window memory: what happens with two files named similarly?
- Cost per full run (ingest + 3 stills + 2 videos + scrape + doc + post) — slide is **UNVERIFIED**, not a full receipt.
- Error-branch: what does a real fail look like in the sheet?

## J. Connections

- **SYSTEM SYNTHESIS** → `IlNwjnIzrOo` (same demo, short magnet). This id is the setup tape.
- **SYSTEM SYNTHESIS** → `clip-factory` + `one-channel-deep`: stills → pick → motion → **human** ships.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: three proofs are the cheap check; human pick is the keep.
- **SYSTEM SYNTHESIS** → `interview-to-desk` / `agent-job-card`: Drive vs creative vs posting = named jobs, not “media army.”
- **SYSTEM SYNTHESIS** → `ask-principal` + `send-removed`: Dexter email and TikTok post stay HITL.
- **SYSTEM SYNTHESIS** → `motion-pipeline`: still → clip; 1024 proof before 2048 / long render.
- **SYSTEM SYNTHESIS** → `wiki-ingest`: Sheets logger analog is a review surface, not a vanity dashboard.
- **SYSTEM SYNTHESIS** → `e18sdZLwP7o`: one lead, specialists, no mesh — same physics, different vendor.
- Do not force a Path A client out of a JBL prop.

## K. Future-Use

- Action-log as a Watchdog review surface (unassigned).
- Share-settings as a permissions checklist (unassigned).
- “Eager helper” as a tone default vs a refusal list (unassigned).
- Volunteer job label (`volunteer`) excluded from done — Forge test (unassigned).
- Thin router / fat desk cards — Librarian (unassigned).
- Short-as-magnet + long-as-recipe — Publishing Engine (learn only; no publish).
- Create-doc-on-the-lead as the exception that proves buckets need a triangle (`interview-to-desk`).

## Steal / Operate-never

### Machine: Name → N previews → human pick → requested motion only
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (media on one chat) → place in a known folder → ask name (+ sharing) → human names → specialist renames → link-back checkable stop → taste brief → N styled stills (cheap proof size) → confirm before final render → human picks one → motion brief on **that** file → review **requested** output → reject or park volunteer jobs → **human** ships (HITL). Log success and error.
- **Questions / signals:** “What do we name this?” “Change sharing?” “Which preview?” “Render finals?” “Is the extra job requested?” “Is the next step send or post?”
- **Qualify / frame / objections:** Content ops, not a client SKU. “Can do anything” is the magnet, not done. Objection: autonomy wasted tokens — volunteer reject. Objection: “just post it” — post is a hard step.
- **Procedure:** D steps 1–11, 13. Checkable stops: (1) named file in known folder, (2) human-picked still, (3) requested video reviewed, (4) extra jobs not in the ship set, (5) log row exists.
- **Example that proves it:** Vague studio brief → three 1024 proofs → “first preview file” → JBL VFX from that still → impressed on the requested clip; text-only volunteer unbranded. Lesson: mushy brief is fine; pick and ship-set are not.
- **Why it works:** Later prompts need a handle. Taste needs options. Autonomy is fast only if the human still defines the artifact set. Chat memory is short; the folder is the memory. Conditions: one operator, named specialists, a pick gate. Exceptions: no rewrite loop on tape if all three miss; share-settings unused at ingest; extra job judged as B-roll not killed; he then sends and posts (do not copy).
- **Conditions / exceptions:** Cursor + Grok only (Telegram / Drive / n8n / FAL / Blotato / Apify / Vapi / Skool stay on tape). No auto-post. No Dexter send. Clients parked. JBL is a prop, not an ICP.
- **Operate-never payload:** Unsupervised extra video as ship; auto-post X/TikTok/IG; Telegram media army as a hive SKU; “can do anything” as done; public-share-to-post; install his stack; new hunt.
- **Hive run (existing skills only):** `interview-to-desk` (one job per specialist) · `agent-job-card` (owns/never, including “no volunteer ship”) · `golden-test-loop` (keep only the picked still) · `clip-factory` / `motion-pipeline` (still → clip) · `one-channel-deep` (human ships) · `ask-principal` (publish) · `send-removed` (Dexter) · `wiki-ingest` (log) · `slice-build` (one edit loop, not “do everything”).
- **Source:** `jBanaNBY-sM` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-post / unsupervised army / unsupervised extra video as ship
- Telegram + Drive + his n8n / FAL / Blotato / Apify / Vapi media army as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any implied $ / 5¢ image / V3 per-second / Blotato $29 / $6k hackathons / “free system” as FACT
- New `icp_id` / unpark Normand / JBL or “media army” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat the army into existence.

- **Done** on a media slice: named file in a known folder + N options + Evens picks + requested motion only + a log row. Volunteer jobs are not done. A TikTok submission ID is not done.
- **Delegate without being asked:** Creative Studio packages stills; Publishing Engine does not ship; Watchdog checks the link-back and the share settings; Forge treats extra jobs as a fail if they land in the ship set; Communications Manager never gets a send because a demo emailed Dexter.
- **Skeptical review:** “Ultimate / anything” is the title, not ours. I will not approve a nameless media-agent farm because a Telegram demo posted in one minute. The army is a costume. The 17 desks already are the named buckets.
- **One system this take:** one edit loop with a pick gate. Not “do everything.” Not X/IG/TikTok. Not Blotato.
- Live hunt stays parked. I do not rotate to creator-media because a JBL ad slapped.

# LEARNED — qfpD1FWdyTs
Protocol: jarvis-signal-engine

# Signal Analysis: SPARK AI Social Media Employee

## A. Source Map
- **00:00** - Introduction to SPARK: AI Social Media Employee running locally on `localhost:4777`, handling Instagram/Facebook Auto DMs, content generation, and deal tracking.
- **01:10** - AI Content Generation Overview: Generating Carousels, Images, and Reels via local SPARK dashboard using Blotato and Higgsfield integrations.
- **02:06** - Full Carousel Generation Demo: Single-prompt generation of social media carousels with automated visual assets and slide generation reports.
- **03:54** - Instagram Auto DM Live Demo: Demonstrating automated direct messaging triggered by keyword comments on Instagram posts and reels.
- **04:36** - Auto DM Step-by-Step Setup: Configuring trigger keywords, custom DM text with call-to-action buttons, and randomized comment replies.
- **06:45** - Dashboard, Deals Board, Calendar & Reports: Reviewing SPARK's CRM/Deals room, content calendar scheduling, and approval queue.
- **07:15** - Social Account API Setup (Blotato & Higgsfield): Connecting social profiles via Blotato API key and Higgsfield AI studio credentials.
- **10:11** - Free Prompt Pack Overview: Reviewing the 5-step prompt starter pack PDF used to build SPARK from scratch using Claude Code.
- **12:30** - Finished SPARK & Community Resources: Demonstrating pre-packaged 5-minute install zip files (`mac` and `windows`) inside the AI Workshop Skool community.
- **13:45** - Outro & Summary.

## B. Atomic Knowledge
1. **Claim:** SPARK can run a complete social media management desk locally using Python's standard library on port 4777.
   - **Why:** Built via Claude Code with a single Python script server and Anthropic API integration stored in `config.json`.
   - **Conditions:** Requires a Python runtime environment and Anthropic API key (`claude-3-5-sonnet`).
   - **Evidence:** Shown on screen (`localhost:4777` dashboard and `SPARK-Starter-Pack.pdf` Step 1 prompt at 00:24, 11:04).
   - **Label:** SOURCE.
2. **Claim:** Social media publishing and Auto DMs across 9+ platforms can be managed without ManyChat or complex monthly SaaS stacks.
   - **Why:** Blotato acts as a unified posting & DM API/MCP bridge connecting local AI agents directly to Instagram, LinkedIn, TikTok, Twitter, Facebook, YouTube, Threads, Pinterest, and Bluesky.
   - **Conditions:** Requires a Blotato account and API key.
   - **Evidence:** Shown on screen (`my.blotato.com/settings` and `my.blotato.com/dm-automations` at 07:46, 08:00, 09:26).
   - **Label:** SOURCE.
3. **Claim:** Non-developers can fix bugs in Claude Code applications without manual code debugging.
   - **Why:** Claude Code can analyze runtime errors and self-correct when prompted with plain text descriptions of the breakdown.
   - **Conditions:** Feeding exact error output back into the active Claude Code CLI session.
   - **Evidence:** Shown in `SPARK-Starter-Pack.pdf` page 5 instruction: "don't debug. Just tell Claude: 'Something's wrong with my SPARK... Fix it.'" (00:28, 11:14).
   - **Label:** SOURCE.
4. **Claim:** Varying comment responses reduces automated spam detection risk on social platforms.
   - **Why:** Randomizing or rotating between multiple automated reply templates prevents algorithmic flags caused by identical bot responses.
   - **Conditions:** Configuring multiple comment reply strings in the Auto DM settings.
   - **Evidence:** Shown in Comment Reply configuration box on Auto DM desk at 04:14.
   - **Label:** SOURCE.
5. **Claim:** AI visual generation for carousels and reels can be fully integrated into local agent workflows via Higgsfield API.
   - **Why:** Higgsfield provides an AI studio API that generates custom background slides and promotional media directly linked into the draft approval queue.
   - **Conditions:** Requires Higgsfield API Key and Secret configured in SPARK settings.
   - **Evidence:** Shown in Settings panel under "STUDIO, HIGGSFIELD" at 00:38, 07:16.
   - **Label:** SOURCE.

## C. Procedures as Ordered Steps
1. **Building SPARK from Scratch with Claude Code Prompt Pack:**
   - Step 1: Open Claude Code CLI inside a new project directory (`spark-v1`).
   - Step 2: Paste Step 1 Prompt ("The Office") to create a single-file Python web server on port 4777 serving the custom UI and Anthropic API `config.json`.
   - Step 3: Paste Step 2 & 3 Prompts ("Your Voice & Approve Desk") to add the voice tuning module (`VOICE FILE`) and approval queue UI (`APPROVE` tab with APPROVE, EDIT, REJECT, REDO IT buttons).
   - Step 4: Paste Step 4 Prompt ("The Weekly Pitch") to enable weekly content plan generation (3 educational, 1 promotional, 1 behind the scenes, 1 engagement question).
   - Step 5: Paste Step 5 Prompt ("Make Him Yours") to personalize branding, set creator niche, and add the HYPE slider (0-100) for tone control.
2. **Setting Up Instagram Auto-DMs via Blotato API:**
   - Step 1: Sign up at `blotato.com` and navigate to Settings -> API.
   - Step 2: Copy Blotato API key and paste into SPARK Settings page under "POSTING, BLOTATO".
   - Step 3: Connect social profiles (Instagram, Facebook, LinkedIn, TikTok, Twitter) inside Blotato account settings.
   - Step 4: Open SPARK `AUTO DMS` desk and fill out "NEW AUTO-DM" form: select channel (Instagram), specify trigger keyword (e.g., `JARVIS` or `GUIDE`), set DM text and CTA button text/URL.
   - Step 5: Configure 3 randomized comment reply variations (e.g., "Just sent you a DM with the link!").
   - Step 6: Click "CREATE, GOES LIVE" to sync the automation directly to Blotato's cloud runner.

## D. Shown on Screen
- **00:00 - 00:06:** Chrome browser displaying `localhost:4777` with SPARK web interface. Dark navy header with light cream background panels, tabs for DASHBOARD, APPROVE, AUTO DMS, DEALS, CALENDAR, REPORTS, SETTINGS.
- **00:24 & 11:04 - 11:16:** macOS Preview viewing `SPARK-Starter-Pack.pdf` containing copy-paste system prompts for Claude Code.
- **00:38 & 07:16:** SPARK Settings UI showing "THE DIALS" (HYPE slider, SPICE slider, NICHE text field), "VOICE FILE" text area, "POSTING, BLOTATO" API key form, and "STUDIO, HIGGSFIELD" API credentials form.
- **00:50:** Chrome displaying `manychat.com` landing page.
- **01:26 - 01:34:** LinkedIn interface displaying Zubair Trabzada's carousel post titled "I GAVE MY AI A PHONE NUMBER. MEET JARVIS." and slide detailing `rules.md` guidelines.
- **02:02:** SPARK Deals room Kanban board with columns: NEW, TALKING, QUOTED, WON, and controls for DM WATCH and AUTOPILOT.
- **03:02 - 03:38:** SPARK Approve desk displaying generated content cards for LinkedIn and SPARK Image drafts with action buttons (APPROVE, EDIT, REJECT, REDO IT) and "THE REPORT" modal showing asset paths and generation credits.
- **03:54 - 05:20:** SPARK Auto DM desk showing active keyword triggers (JARVIS, TARS, GUIDE), edit modal for trigger words/DM copy/CTA links, and comment reply templates.
- **04:22 - 04:28, 06:00 - 06:10:** Instagram web client (`instagram.com/zubair_trabzada`) showing published reels, user comments with trigger word "Guide" / "Jarvis", and automated replies from `@zubair_trabzada`.
- **06:58:** SPARK Calendar page displaying weekly post schedules and scheduled auto-posting times (e.g., Monday 9:00 AM).
- **07:46 - 08:00:** `my.blotato.com/settings/api` and account connection page showing social channel logins (Twitter, LinkedIn, Facebook, TikTok, Instagram, Threads, Pinterest, Bluesky, YouTube).
- **09:20:** `blotato.com` landing page showing API + MCP capabilities for social media automation.
- **09:26 & 11:46 - 12:04:** `my.blotato.com/dm-automations` showing synced automation rules status (LIVE) across keywords HELLO, JARVIS, TARS, GUIDE.
- **10:40 - 10:54, 12:42 - 13:30:** Skool community interface (`skool.com/aiworkshop-lite`) showing Classroom courses and download links for `SPARK-V1-Install-Guide.pdf`, `spark-skill-v1-mac.zip`, and `spark-skill-v1-windows.zip`.

## E. Said vs Shown Mismatches**
- **Description claim vs Screen:** Description claims automation works "without ManyChat or a stack of monthly subscription tools", but the video explicitly demonstrates requiring Blotato API integration (`blotato.com`), which is a third-party paid API subscription platform shown at 09:20.

## F. Failures and Recoveries
- **Failure:** Code exceptions or broken features occurring during Claude Code generation or script execution.
- **Recovery:** Prompt Claude Code directly with "Something's wrong with my SPARK. Here's what happened: [describe issue]. Fix it." rather than attempting manual debugging.

## G. Decision Points (IF -> THEN)
- **IF** creating an Instagram lead magnet offer -> **THEN** set up an Auto DM keyword trigger in SPARK with a CTA button containing the landing page link and omit URLs from the main DM text to maintain high deliverability.
- **IF** generating weekly content -> **THEN** click "PITCH ME THE WEEK" to let SPARK draft 6 tailored posts (3 educational, 1 promotional, 1 behind-the-scenes, 1 engagement) based on creator voice files and niche settings.
- **IF** a generated draft requires adjustments -> **THEN** click "REDO IT" on the Approve card with feedback instructions, or click "EDIT" to modify text directly prior to publishing.
- **IF** social platform connections expire -> **THEN** refresh Blotato API keys in SPARK Settings (`POSTING, BLOTATO`) to re-establish synchronization.

## H. Tools/Repos/MCPs Named
- **Claude Code (CLI Coding Agent):** Used to build and iteratively modify SPARK's local Python web server and UI from natural language prompts.
- **SPARK (Local Python AI Employee App):** Custom web application running on port 4777 for social media content creation, approval, CRM deal tracking, and Auto DM setup.
- **Blotato (Social Media Unified API / MCP):** Cloud backend service connecting SPARK to 9+ social networks (Instagram, Facebook, LinkedIn, Twitter, TikTok, etc.) for automated posting and Auto-DM dispatch.
- **Higgsfield AI (AI Studio):** API service used by SPARK for generating images, carousels, and AI video reels.
- **ManyChat:** SaaS platform mentioned as replaced alternative.
- **Skool (`skool.com/aiworkshop-lite`):** Community platform hosting SPARK starter prompt packs, install zip files, and classroom guides.
- **Retell AI:** Mentioned in LinkedIn post screenshot (01:26) for voice AI call automation in Jarvis V6.

## I. Challenges
- **"No Monthly Subscription Tools" Hype:** While ManyChat is eliminated, Blotato is a subscription API service required for multi-channel social posting and DM webhooks.
- **Process Execution:** Running a local Python web app on `localhost:4777` requires background process management or daemon setups to ensure uninterrupted 24/7 automation.
- **Platform Limits:** High-volume DM automation and comment monitoring via third-party wrappers like Blotato carry inherent account ban risks if rate limits are exceeded.

## J. Use for Jarvis
- **Unified Social MCP:** Integrate Blotato's API / MCP into Jarvis to allow Jarvis to publish posts and respond to direct messages across Instagram, LinkedIn, X, and Facebook.
- **Human-in-the-Loop Approval Desk:** Implement the `APPROVE` card queue pattern (APPROVE / REDO / REJECT / EDIT buttons) in Jarvis's UI for operator sign-off before executing public actions.
- **Self-Healing Script Maintenance:** Adopt the prompt pattern ("Something's wrong... fix it") for maintaining local helper scripts via Claude Code CLI.
- **Visual Asset Studio Integration:** Wire Higgsfield AI API calls into Jarvis content generation workflows for automatic slide and image creation.

## K. Open Questions
- How does Blotato handle webhook deliverability and queueing under sudden spikes in Instagram comment activity?
- Can SPARK's local Python server (`localhost:4777`) be containerized with Docker or hosted on a VPS to maintain 24/7 uptime without keeping a Mac workstation powered on?
- What are the operational cost differences between direct Anthropic API + Blotato API usage versus standard ManyChat plans?
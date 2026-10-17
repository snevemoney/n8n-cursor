# LEARNED — 9dgBRv6bTkw
Protocol: jarvis-signal-engine

### A. Source map
- **00:00** - Higgsfield web pricing tier overview showing Starter ($19/mo), Plus ($59/mo), and Ultra ($129/mo) plans.
- **00:12** - Higgsfield pricing comparison table showing API pay-as-you-go credit discounts versus third-party model providers.
- **00:36** - Overview of the "Build Your Own Higgsfield Studio" Prompt Pack PDF, outlining requirements (Claude Code, Higgsfield API key, Anthropic API key).
- **00:42** - Claude Code workspace showing model selection drop-down displaying Sonnet 5.5, Opus 5.5, Fable 5.1, Haiku 4.5.
- **03:46** - SPARK Studio Web App demonstration on `localhost:4777` showing Carousel, Image, and Video creation UI with live cost estimation.
- **05:20** - Breakdown of the Free Studio Prompt Pack contents for automated generation using Claude Code.
- **06:02** - Overview of the AI Workshop Lite Skool community classroom resources and JARVIS / TARS AI Employee modules.
- **06:22** - SPARK Auto DMs desk dashboard managing automated Instagram and Facebook direct messages based on keyword triggers.
- **07:18** - Claude Code workspace execution showing Seedance 2.5 video generation integration via `@higgsfield/client` npm package.
- **09:38** - Walkthrough of SPARK Carousel Generator selecting presets (Big Number, Editorial, Cinematic) and engines (Ideogram 4.0, GPT Image 2.5, Grok Imagine 2.0).
- **12:16** - SPARK Settings desk configuring Higgsfield API key, API Secret, OpenAI API key, and social posting integration (Blotato, Zernio).
- **13:20** - Generated AI video clip preview inside SPARK Studio with prompt input and live caption generation.
- **14:00** - Full resolution video playback of Cloudfront-hosted AI generated video asset (woman at sunset).

### B. Atomic knowledge
- **Claim**: Higgsfield subscription plans can become expensive quickly for high-volume content creators compared to direct API usage.
  - **Why**: Fixed monthly subscriptions restrict generation credits, whereas pay-as-you-go API keys provide up to 45% lower per-second cost on models like Kling 3.0 and Seedance 2.5.
  - **Conditions**: Requires API credentials and a local script runner or custom UI dashboard.
  - **Evidence**: Web comparison table shown at 00:12 showing per-second prices ($0.0924/s for Kling 3.0 Pro on Higgsfield vs $0.168/s on Fal).
  - **SOURCE/INFERENCE**: SOURCE
- **Claim**: Claude Code can generate full-stack content generation web interfaces without manual coding by executing multi-stage prompt packs.
  - **Why**: Claude Code processes step-by-step prompt blocks to create local web servers (`localhost:4777`), integrate API clients (`@higgsfield/client`), and render visual selection controls.
  - **Conditions**: User pastes structured prompts sequentially into Claude Code CLI tool.
  - **Evidence**: Prompt pack structure displayed at 00:36 and active terminal running `npm start` at 07:18.
  - **SOURCE/INFERENCE**: SOURCE
- **Claim**: Image/video generation costs can be calculated and displayed dynamically on buttons before executing API requests.
  - **Why**: Mapping credit costs per engine (e.g., Ideogram 4.0 at $0.06/img, Seedance 2.5 at $2.31/clip) allows users to verify budget before hitting API endpoints.
  - **Conditions**: Real-time price mapping logic configured inside the UI frontend.
  - **Evidence**: Action buttons shown with live dynamic costs (e.g., "MAKE THE CAROUSEL $0.24" at 00:26, "MAKE THE CLIP $2.31" at 05:12).
  - **SOURCE/INFERENCE**: SOURCE

### C. Procedures as ordered steps
1. **Obtain API Credentials**:
   - Go to `cloud.higgsfield.ai`, generate an API Key ID and Key Secret, and deposit initial pay-as-you-go credit.
   - (Optional) Obtain Anthropic API key from `console.anthropic.com` for automated slide text generation.
2. **Initialize Claude Code Project**:
   - Create an empty project folder on your local machine.
   - Open terminal, start Claude Code, and select model (e.g., Sonnet 5.5).
   - Sequentially paste the system build prompts from the Prompt Pack document into Claude Code.
3. **Configure Environment Variables**:
   - Paste `HF_CREDENTIALS` in `key-id:key-secret` format into `.env.local` without quotes.
   - Verify `.env.local` is included in `.gitignore` to prevent credential exposure.
4. **Launch SPARK Content Studio**:
   - Run project execution command (`npm start`).
   - Open web browser to `localhost:4777` to view SPARK Studio.
5. **Generate AI Content via SPARK Studio**:
   - Select content type: Carousel, Image, or Video.
   - Input custom description prompt or select auto-suggested content ideas.
   - Select visual preset style (Big Number, Editorial, Cinematic, Photo).
   - Choose engine (e.g., Ideogram 4.0, GPT Image 2.5, Kling 3.0, Seedance 2.5, Wan 2.7).
   - Confirm slide count or clip duration (5s or 10s) and inspect calculated cost on the submit button.
   - Click "MAKE THE CAROUSEL" / "MAKE THE CLIP" to trigger backend execution.
6. **Configure Auto DMs and Social Integration**:
   - Access SPARK Settings (`localhost:4777/settings`).
   - Enter API credentials for posting services (Blotato or Zernio).
   - Set keyword trigger rules under Auto DMs desk (e.g., keyword "JARVIS" triggers direct link DM reply).

### D. Shown on screen
- **Tools/Screens**:
  - Higgsfield Web Pricing & Comparison Table (00:00, 00:12)
  - Claude Code CLI / UI displaying model selector with Sonnet 5.5, Opus 5.5, Fable 5.1, Haiku 4.5 (00:42, 07:18)
  - SPARK Studio UI running on `localhost:4777` with navigation options: Studio, Dashboard, Approve, Auto DMs, Deals, Calendar, Reports, Settings (03:46, 06:22, 12:16)
  - Instagram post UI showing comment section and automated response messages (06:38, 09:48, 09:52)
  - PDF document "Build Your Own Higgsfield Studio Prompt Pack" (00:36, 05:20)
  - Skool platform classroom "AI Workshop Lite" (06:02, 06:06)
- **Code/Settings**:
  - File path: `projects/2026-09-higgsfield-seedance-api/.env.local` with environment variable `HF_CREDENTIALS` (07:18)
  - Execution command: `cd "/Users/zubair/Documents/Claude Code/projects/2026-09-higgsfield-seedance-api" && npm start` (07:18)
  - Model options visible: Ideogram 4.0 ($0.06/img), GPT Image 2.5 ($0.05/img), Grok Imagine 2.0 ($0.08/img), Qwen Image 3 ($0.04/img), Seedance 2.5 ($2.31/clip), Kling 3.0 ($0.35/clip), Kling 3.0 Pro ($0.46/clip), Wan 2.7 ($0.25/clip) (00:26, 04:44, 05:12).

### E. Said vs shown mismatches
- Video description lists "Claude Opus 5.5, Sonnet 5.5", but terminal screen at 07:18 shows Claude Code active session running `Sonnet 5.5 Extra`.
- Video title and description emphasize "Higgsfield API", but SPARK Studio UI displays multi-model options (Ideogram, OpenAI GPT Image, Kling, Seedance, Wan, Grok) routed inside the studio framework.

### F. Failures and recoveries
- **Failure**: Claude Code script exited during test execution because `HF_CREDENTIALS` in `.env.local` was empty (07:18).
  - **Recovery**: Claude Code provided exact remediation steps: save key in `key-id:key-secret` format in `.env.local` and re-run `npm start`.
- **Safety Handling**: Claude Code script configures `maxRetries = 0` to prevent duplicate billing on network timeouts.

### G. Decision points (IF -> THEN)
- **IF** subscription costs for Higgsfield or Fal are prohibitive -> **THEN** switch to pay-as-you-go Higgsfield API via custom Claude Code wrapper to access direct rates.
- **IF** text spelling accuracy is critical for carousel graphics -> **THEN** select Ideogram 4.0 ($0.06/img) or GPT Image 2.5 ($0.05/img) in SPARK engine selection.
- **IF** minimal cost video rendering is required -> **THEN** choose Wan 2.7 ($0.25/clip) instead of Seedance 2.5 ($2.31/clip).
- **IF** testing billable API scripts -> **THEN** enforce `maxRetries = 0` to prevent double charges on connection failures.

### H. Tools/repos/MCPs named
- **Claude Code**: CLI utility used to assemble the web application and run TypeScript API scripts.
- **Higgsfield API** (`@higgsfield/client` v0.2.6): Client package for invoking video generation endpoints.
- **SPARK (SPARK Studio)**: Custom full-stack web app running on `localhost:4777` for AI content creation.
- **Blotato / Zernio**: Social media scheduling and multi-platform posting API integrations.
- **Ideogram 4.0 / GPT Image 2.5 / Grok Imagine 2.0 / Qwen Image 3**: Image generation model engines.
- **Seedance 2.5 / Kling 3.0 / Kling 3.0 Pro / Wan 2.7**: Video generation model engines.
- **Skool (AI Workshop Lite)**: Online community host for asset PDF downloads.

### I. Challenges
- Model names and date stamps (e.g., `2026-09-higgsfield-seedance-api` at 07:18 and names like `Sonnet 5.5 / Opus 5.5`) reflect custom interface labels or futuristic naming conventions in the project setup.
- Pay-as-you-go API calls can quickly accumulate cost if strict front-end budget checks and dynamic cost previews are bypassed.

### J. Use for Jarvis
- Evens's Mac operator can replicate the SPARK Studio architecture pattern to provide Jarvis with a local media desk (`localhost:4777`) for zero-subscription carousel and video generation.
- Jarvis can automate local credential injection (`.env.local`), handle dependency installation (`npm i @higgsfield/client`), and calculate price limits before triggering external AI generations.

### K. Open questions
- What specific SDK methods are available in `@higgsfield/client` beyond `Higgsfield.subscribe()`?
- How does SPARK persist generated video files locally after receiving the Cloudfront output URL?
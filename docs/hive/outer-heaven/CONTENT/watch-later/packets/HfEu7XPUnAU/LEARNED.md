# LEARNED — HfEu7XPUnAU
Protocol: jarvis-signal-engine

# Signal Analysis: AI Trading Analyst Team with Claude Code

## A. Source Map
- **00:00 - 00:22**: **Problem Overview** — Retail traders lose money by trading on social media hype/gut feeling without a structured research process.
- **00:23 - 01:17**: **System Architecture Overview** — Introduces the AI Trading Analyst built inside Claude Code featuring 16 skills and 5 parallel agents analyzing technical, fundamental, sentiment, risk, and thesis dimensions.
- **01:18 - 02:25**: **NVDA PDF Report Walkthrough** — Examines pre-generated NVDA investment thesis report showing composite score (78/100), key financial metrics, bull/bear cases, entry/exit zones, position sizing, and risk matrix.
- **02:26 - 04:31**: **Live Execution on Tesla (TSLA)** — Demonstrates running `/trade-analyze TSLA` in VS Code / Claude Code interface; shows phase 1 web discovery followed by phase 2 launching 5 parallel agents.
- **04:32 - 06:07**: **Tesla Results Breakdown** — Reviews TSLA generated analysis (Composite score 43/100, Caution signal), key price levels, indicator readings, valuation assessment, and risk scenario analysis.
- **06:08 - 07:58**: **Command Architecture & GitHub Skill Structure** — Walks through `SKILL.md` structure and the 16 slash commands (analysis, thesis, options, screening, earnings, portfolio).
- **07:59 - 11:03**: **Step-by-Step Installation Guide** — Details how to set up VS Code + Claude Code Extension, download/unzip `trading-skills.zip` into local `.claude/skills` directory, or execute the one-line `curl` installer script for paid members.
- **11:04 - 11:52**: **Live Execution on Rivian (RIVN)** — Runs `/trade-quick RIVN` for a fast 60-second snapshot without subagents; examines instant terminal output.
- **11:53 - 12:48**: **Monetization & AI Agency Framework** — Explains how to package Claude Code skills into commercial business tools for clients via Skool community program.
- **12:49 - 14:38**: **Rivian Output & Use Cases** — Analyzes RIVN snapshot results (HOLD signal, gross profit inflection vs cash burn) and outlines target user profiles (day traders, swing traders, portfolio managers).
- **14:39 - 14:59**: **Conclusion & Future Roadmaps** — Wrap-up and call to action for Claude Code skill building.

## B. Atomic Knowledge
- **Claim**: Slash-command skills in Claude Code can coordinate 5 parallel subagents for multi-dimensional financial analysis.
  - **Why**: `SKILL.md` prompts instruct Claude Code to gather web search data first (Discovery phase) and then spawn parallel worker agents for technical, fundamental, sentiment, risk, and thesis evaluation.
  - **Conditions**: Requires VS Code, Anthropic Claude Code extension with active subscription, and configured internet web search access.
  - **Evidence**: On-screen terminal logs at `03:52` showing `Discovery data compiled. Now launching all 5 analysis agents in parallel` and subsequent agent logs.
  - **Label**: SOURCE
- **Claim**: Claude Code can generate standalone structured PDF financial reports directly from CLI skills.
  - **Why**: Python scripts referenced in `requirements.txt` and repository files compile markdown findings into formatted PDF documents.
  - **Conditions**: Requires Python environment and report generation dependencies installed.
  - **Evidence**: Shown on screen at `01:20` and `04:16` (`TRADE-REPORT-TSLA.pdf` displayed side-by-side in VS Code editor).
  - **Label**: SOURCE
- **Claim**: AI stock analyst teams completely eliminate human research error and guarantee profitable trades.
  - **Why**: AI models still rely on third-party web search snippets, historical public data, and LLM inference which can hallucinate or fail during black swan market events.
  - **Conditions**: All market scenarios.
  - **Evidence**: Video disclaimer at `00:46` and `13:25` explicitly stating this is a research tool, not financial advice, and does not execute automated trades.
  - **Label**: INFERENCE

## C. Procedures as Ordered Steps
### Installing AI Trading Analyst Skills in Claude Code (Free Zip Method)
1. Install Visual Studio Code and the official Anthropic Claude Code extension.
2. Open VS Code and open or create your working project folder.
3. Download `trading-skills.zip` from the community resource classroom.
4. Unzip `trading-skills.zip` on your local system.
5. Copy the skill directories into your local folder's `.claude/skills/` directory (or workspace skill path).
6. Open Claude Code panel in VS Code (`Ctrl+Shift+P` / click Claude Code icon).
7. Type `/` in the prompt input to verify that slash commands (e.g., `/trade-analyze`, `/trade-quick`) are populated.

### Running Full Multi-Agent Stock Analysis
1. In Claude Code prompt bar, type `/trade-analyze <TICKER>` (e.g., `/trade-analyze TSLA`).
2. Wait for Phase 1 (Discovery) to complete web searches for news, financial metrics, short interest, and S&P 500 benchmark performance.
3. Allow Phase 2 parallel agent execution (Technical, Fundamental, Sentiment, Risk, Thesis Synthesis).
4. Review composite trade score, signal, and summary markdown generated in terminal.
5. Open the corresponding auto-generated PDF report in VS Code (e.g., `TRADE-REPORT-<TICKER>.pdf`).

## D. Shown on Screen
- **Tools/IDEs**: VS Code with dark theme, Anthropic Claude Code Extension panel, Chrome Browser.
- **GitHub Repo**: `zubair-trabzada/ai-trading-claude` showing repository tree: `.github`, `agents`, `scripts`, `skills`, `trade`, `.gitignore`, `LICENSE`, `README.md`, `install.sh`, `requirements.txt`, `uninstall.sh` (`03:20`).
- **Skill Files**: `skills/trade-analyze/SKILL.md` containing prompt template for output structure (Trade Score, Key Takeaway, Bull vs Bear table, Catalyst Calendar, Entry/Exit levels) (`06:14`).
- **Terminal Logs**: `trade-analyze TSLA` showing search queries: Yahoo Finance TSLA, Macrotrends PE ratio, MarketBeat TSLA short interest, Slickcharts S&P 500 returns (`03:52`).
- **PDF Viewer / Interface**: `INVESTMENT-THESIS-NVDA.pdf` dated April 8, 2026 (`01:20`), displaying circular trade score gauge (78/100) and metric tables.

## E. Said vs Shown Mismatches
- **Composite Score Discrepancy (NVDA)**: At `01:20`, the terminal window on the left side of the split screen shows `Composite Trade Score: 69/100 | Grade: B | Signal: Hold/Accumulate`, whereas the generated PDF document displayed on the right side shows a large gauge reading `78 / 100` with `Thesis: Strong`. The speaker verbally cites `78 out of 100` (`01:30`) without acknowledging that the terminal output composite calculation was 69.

## F. Failures and Recoveries
- **Incorrect Ticker Input**: Speaker initially begins typing `trade-quick` for Rivian and notes ticker syntax, explicitly correcting himself that Rivian's ticker is `RIVN` rather than spelling out the name (`11:28`).

## G. Decision Points (IF -> THEN)
- **IF** deep comprehensive research with PDF output is required **THEN** use `/trade-analyze <TICKER>`.
- **IF** immediate pre-market scan or 60-second summary is required without launching subagents **THEN** use `/trade-quick <TICKER>`.
- **IF** paid GitHub access is available **THEN** install via one-line terminal command `curl -fsSL https://raw.githubusercontent.com/zubair-trabzada/ai-trading-claude/main/install.sh` **ELSE** manually download and unzip `trading-skills.zip` into `.claude/skills` folder.

## H. Tools/Repos/MCPs Named
- **Claude Code**: Anthropic CLI/IDE extension used as the core agent execution environment.
- **VS Code**: IDE housing the Claude Code interface and PDF previewer.
- **GitHub Repository (`zubair-trabzada/ai-trading-claude`)**: Contains prompt skill definitions, shell scripts (`install.sh`), and Python PDF reporting scripts.
- **Skool (AI Workshop / AI Workshop Lite)**: Platform host for downloading free skill zip files and accessing agency tutorials.

## I. Challenges
- **Dated/Future Timestamps**: The generated reports display future dates (`April 8, 2026`), indicating fixed mock date prompts in `SKILL.md` or synthetic test runs.
- **Web Search Dependency & Rate Limits**: Unconstrained live web searches by 5 parallel agents can run into API rate limits or inconsistent web scrapers.
- **Unverified Accuracy**: Financial metrics generated by LLM web search aggregation must be validated against official SEC filings before capital allocation.

## J. Use for Jarvis
- **Local Skill Folder Ingestion**: Jarvis can adopt the standard `.claude/skills/<skill-name>/SKILL.md` format to modularize system capabilities (e.g., system monitoring, repository audits, log parsing).
- **Parallel Execution Routing**: Pattern of running discovery first, then spawning parallel domain-specific subagents can be applied to complex technical analysis workflows on Mac OS.
- **Report Generation Pipeline**: Combining markdown synthesis with CLI automated PDF compilation for immediate executive review.

## K. Open Questions
- What specific Python library is used inside `scripts/` to generate the PDF charts and gauge UI?
- How does `SKILL.md` pass state and structured JSON context to the 5 parallel subagents inside Claude Code without context window decay?
# Template notes — patterns adapted, not vendored

This engine keeps the existing personal wealth-terminal identity (Instrument Serif + Inter + JetBrains Mono, gold/long/short). We reused motion/layout *ideas* only. No Locomotion, RVE, or Finance Brief logos, palettes, or demo copy were pasted.

## Official Remotion

- **One idea per scene, safe area, large type** — [video-layout](https://github.com/remotion-dev/skills/blob/main/skills/remotion-best-practices/remotion-create/video-layout.md). 80px side margins, chrome + ticker reserved, headlines 52–128px at 1920×1080 (scaled from their 1080-wide minima rather than copied as-is).
- **Frame-driven motion only** — [Remotion skill](https://github.com/remotion-dev/skills/blob/main/skills/remotion/SKILL.md). `spring` / `interpolate` / `useCurrentFrame`. No CSS or Tailwind animations.
- **Charts** — [charts rule](https://github.com/remotion-dev/skills/blob/41a3b0685bc648c5f66b3c81d67c61589875eefb/skills/remotion/rules/charts.md): staggered bar growth, no third-party chart timers. Streak columns and comparison bars follow this.
- **Dynamic duration** — [`calculateMetadata`](https://www.remotion.dev/docs/calculate-metadata) so `selectScenes(report, {cut})` sizes `DailyShow` and `Morning60`. Short opacity fades between sequences plus a 4-frame gold chapter tick (not wipes).

## Locomotion (idea only — closed/paid, not copied)

Public catalog names we adapted as *jobs*, not files: Stock Ticker → bottom tape crawl; Portfolio Breakdown / Leaderboard → ranked holdings rows; Stats Dashboard / Day Summary / Metric Card → tape + bento metrics; Bento Grid → fundamentals grid; Concept Breakdown → causal node graph; Intro/Outro → kinetic thesis + command center. No Locomotion branding or stock color system.

## RVE Remotion Templates (81; Charts & Data)

Source: [reactvideoeditor/remotion-templates](https://github.com/reactvideoeditor/remotion-templates) and [RVE catalog](https://www.reactvideoeditor.com/remotion-templates). Adapted ideas: staggered bar growth, stat counters, comparison bars, progress fills. Did not vendor their components.

## Finance Brief (agent-friendly set)

[instavar/remotion-templates](https://github.com/instavar/remotion-templates) `finance-brief`: comparisons, numeric highlights, caveats, recommendation. Mapped to split narrative + capital-plan decision screen. Own type, own copy.

## Other open examples (licensing-safe ideas)

- [josebarnetche/remotion-trading](https://github.com/josebarnetche/remotion-trading) — real numbers only; Bloomberg-terminal density as a *mood*, not their reel layout.
- [remocn staggered bento](https://www.remocn.dev/docs/ui-blocks/staggered-bento-grid) — spring + stagger into a CSS grid.
- Mux Remotion stats write-up ([blog](https://www.mux.com/blog/visualize-mux-data-with-remotion)) — composition = sequences driven by data files.

## Deliberately not used

Composite “NVDA 73/100” scores, scenario probabilities, and Next-NVDA names unless they exist in the episode JSON. Probability bars render only when `scenarios[].probability` is present.

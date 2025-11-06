# Scorpion OS Design System

## Overview

Scorpion OS uses a unified operations console design system - dark, tactical, grid-based, with lots of telemetry and agent visualization.

## Design Tokens

### Colors
- **Background**: `#0a0d10` (page)
- **Surface**: `#0f1318` (panels)
- **Surface Alt**: `#111820` (alternate panels)
- **Border**: `rgba(255,255,255,0.04)` (subtle borders)
- **Text Primary**: `#e4e8ee`
- **Text Muted**: `rgba(228,232,238,0.55)`
- **Accent**: `#13c6a8` (emerald - success)
- **Warn**: `#f4c95d` (yellow)
- **Danger**: `#ff5f5f` (red)

### Typography
- **Headings**: 10px, uppercase, 0.3em letter-spacing
- **Body**: 13-14px
- **Telemetry**: Monospace font (SF Mono, Menlo, Consolas)

### Layout
- **Grid Background**: 32px grid pattern
- **Panels**: 1px borders, 6px border-radius
- **Spacing**: Consistent 4px grid

## Components

All components are in `components/scorpion/`:
- `Panel` - Base container with optional title
- `Metric` - Key-value metric display
- `DataTable` - Structured data table
- `LogRow` - Log entry row
- `Radar` - Agent position visualization
- `ASCIILogo` - Boot screen logo

## Pages

All pages use the `(scorpion)` route group and inherit the global layout:
- `/ops` - Operations monitoring & radar
- `/workflows` - Visual workflow canvas
- `/build` - Mission planner
- `/knowledge` - Data vault browser
- `/council` - Council deliberation
- `/agents` - Agent overview
- `/agents/[id]` - Individual agent details
- `/chat` - Chat interface
- `/logs` - System logs
- `/settings` - Settings panel

## Usage

```tsx
import { Panel, Metric } from '@/components/scorpion';

<Panel title="Section Title">
  <Metric label="Agents" value="19" />
</Panel>
```

## Consistency Rules

1. All pages use left rail + top bar layout
2. All section titles: 10px caps + 0.3em tracking
3. All interactive boxes: bg-white/0 → hover:bg-white/5
4. All data visualizations: dark surface with 1px border
5. All statuses use: emerald (success), yellow (warn), red (error)

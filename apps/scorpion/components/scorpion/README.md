# Scorpion OS Components

Shared components for the Scorpion Operations Console design system.

## Components

- **Panel** - Base panel with optional title
- **Metric** - Display metric with label and value
- **DataTable** - Table for displaying structured data
- **LogRow** - Single log entry row
- **Radar** - Radar visualization for agent positions
- **ASCIILogo** - ASCII art logo component

## Usage

```tsx
import { Panel, Metric } from '@/components/scorpion';

<Panel title="Section Title">
  <Metric label="Agents" value="19" />
</Panel>
```

## Design Tokens

All components use the Scorpion design system:
- Background: `#0a0d10`
- Surface: `#0f1318`
- Border: `rgba(255,255,255,0.04)`
- Text: `#e4e8ee`
- Accent: `#13c6a8` (emerald)

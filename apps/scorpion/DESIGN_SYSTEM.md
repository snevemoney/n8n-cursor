# Scorpion OS Design System

## Overview

Scorpion OS uses a unified operations console design system - dark, tactical, grid-based, with lots of telemetry and agent visualization.

## Design Tokens

### Colors

#### Core Colors
- **Background**: `#0a0d10` (`--sc-bg`) - Page background
- **Surface**: `#0f1318` (`--sc-surface`) - Panels and cards
- **Surface Alt**: `#111820` (`--sc-surface-alt`) - Alternate panels
- **Border**: `rgba(255,255,255,0.04)` (`--sc-border`) - Subtle borders
- **Border Strong**: `rgba(255,255,255,0.08)` (`--sc-border-strong`) - Stronger borders
- **Text Primary**: `#e4e8ee` (`--sc-text`) - Primary text
- **Text Muted**: `rgba(228,232,238,0.55)` (`--sc-text-muted`) - Muted text

#### Semantic Colors
- **Accent/Success**: `#13c6a8` (emerald) - Success states, primary actions
- **Warning**: `#f4c95d` (yellow) - Warning states
- **Danger**: `#ff5f5f` (red) - Error states, destructive actions
- **Info**: `#3b82f6` (blue) - Informational states

### Typography Scale

- **H1**: 24px (text-2xl), font-semibold
- **H2**: 20px (text-xl), font-semibold
- **H3**: 18px (text-lg), font-semibold
- **H4**: 16px (text-base), font-semibold
- **H5**: 14px (text-sm), font-semibold
- **H6**: 12px (text-xs), font-semibold
- **Body**: 14px (text-sm) - Default body text
- **Caption**: 12px (text-xs) - Small text, captions
- **Title** (sc-title): 10px, uppercase, 0.3em letter-spacing - Section titles
- **Telemetry** (sc-mono): Monospace font (SF Mono, Menlo, Consolas) - Code, IDs, telemetry

### Spacing Scale (4px base grid)

- **xs**: 4px (1) - Tight spacing
- **sm**: 8px (2) - Small spacing
- **md**: 12px (3) - Medium spacing
- **lg**: 16px (4) - Large spacing
- **xl**: 20px (5) - Extra large spacing
- **2xl**: 24px (6) - 2x large spacing
- **3xl**: 32px (8) - 3x large spacing

### Border Radius

- **sm**: 4px (`rounded-sm`) - Badges, small elements
- **md**: 6px (`rounded-md`) - Panels, cards (PRIMARY)
- **lg**: 8px (`rounded-lg`) - Buttons, inputs
- **xl**: 12px (`rounded-xl`) - Modals, large cards

### Shadows

- **sm**: `shadow-sm` - Subtle elevation
- **md**: `shadow-md` - Cards
- **lg**: `shadow-lg` - Modals
- **xl**: `shadow-xl` - Prominent elements

### Layout

- **Grid Background**: 32px grid pattern (`.sc-grid-bg`)
- **Panels**: 1px borders, 6px border-radius
- **Spacing**: Consistent 4px grid system

## Components

All components are in `components/scorpion/` and can be imported from `@/components/scorpion`:

### Form Components

#### Button
```tsx
import { Button } from '@/components/scorpion';

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" loading={isLoading}>
  Save
</Button>

<Button variant="danger" size="sm">
  Delete
</Button>
```

#### Input
```tsx
import { Input } from '@/components/scorpion';

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={hasError}
  monospace={false}
/>

<Input
  type="password"
  icon={<LockIcon />}
  monospace
/>
```

#### Textarea
```tsx
import { Textarea } from '@/components/scorpion';

<Textarea
  placeholder="Enter message..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
  error={hasError}
/>
```

#### Select
```tsx
import { Select } from '@/components/scorpion';

<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  error={hasError}
/>
```

### Layout Components

#### Card
```tsx
import { Card } from '@/components/scorpion';

<Card title="Section Title" hover padding="md">
  Content here
</Card>

// Padding options: none, sm, md, lg
```

#### Panel (Legacy - use Card instead)
```tsx
import { Panel } from '@/components/scorpion';

<Panel title="Section Title">
  Content here
</Panel>
```

### Feedback Components

#### Badge
```tsx
import { Badge } from '@/components/scorpion';

// Variants: default, success, warning, danger, info
// Sizes: sm, md
<Badge variant="success" size="md">
  Active
</Badge>

<Badge variant="danger" size="sm">
  Error
</Badge>
```

#### Tag
```tsx
import { Tag } from '@/components/scorpion';

<Tag variant="default" onRemove={() => removeTag()}>
  Tag Label
</Tag>
```

#### Alert
```tsx
import { Alert } from '@/components/scorpion';

<Alert
  variant="success"
  title="Success"
  message="Operation completed successfully"
  onClose={() => setShow(false)}
/>

<Alert variant="danger" title="Error">
  Something went wrong
</Alert>
```

#### Modal
```tsx
import { Modal } from '@/components/scorpion';

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  Modal content here
</Modal>
```

### Display Components

#### Metric
```tsx
import { Metric } from '@/components/scorpion';

<Metric label="Agents" value="19" valueColor="text-emerald-400" />
```

#### DataTable
```tsx
import { DataTable } from '@/components/scorpion';

<DataTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ]}
  data={[
    { name: 'Agent 1', status: 'Active' },
    { name: 'Agent 2', status: 'Inactive' },
  ]}
/>
```

#### Skeleton
```tsx
import { Skeleton } from '@/components/scorpion';

<Skeleton width="100%" height="20px" rounded="md" />
<Skeleton width={200} height={200} rounded="lg" />
```

### Specialized Components

- `LogRow` - Log entry row
- `Radar` - Agent position visualization
- `ASCIILogo` - Boot screen logo
- `NotificationBadge` - Notification display
- `SSDPowerBadge` - SSD indicator
- `Toast` - Toast notifications (via `useToast` hook)
- `WorkflowViewer` - Visual workflow canvas
- `MissionControl` - Mission control interface

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

## Usage Examples

### Complete Form Example
```tsx
import { Card, Input, Select, Button } from '@/components/scorpion';

<Card title="User Settings">
  <div className="space-y-4">
    <div>
      <label className="sc-title block mb-1">Username</label>
      <Input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>
    <div>
      <label className="sc-title block mb-1">Role</label>
      <Select
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ]}
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
    </div>
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={onSave}>Save</Button>
    </div>
  </div>
</Card>
```

### Status Display Example
```tsx
import { Card, Badge, Metric } from '@/components/scorpion';

<Card title="System Status">
  <div className="space-y-4">
    <Metric label="Active Agents" value="19" valueColor="text-emerald-400" />
    <div className="flex gap-2">
      <Badge variant="success">Healthy</Badge>
      <Badge variant="warning">2 Warnings</Badge>
    </div>
  </div>
</Card>
```

## Consistency Rules

1. **Layout**: All pages use left rail + top bar layout
2. **Titles**: All section titles use `sc-title` class (10px caps + 0.3em tracking)
3. **Interactive Elements**: All interactive boxes use `bg-white/5` → `hover:bg-white/10`
4. **Data Visualizations**: All data visualizations use dark surface with 1px border
5. **Status Colors**: 
   - Emerald (`#13c6a8`) for success
   - Yellow (`#f4c95d`) for warnings
   - Red (`#ff5f5f`) for errors
   - Blue (`#3b82f6`) for info
6. **Border Radius**: 
   - 6px (`rounded-md`) for panels/cards
   - 8px (`rounded-lg`) for buttons/inputs
7. **Spacing**: Use 4px grid system consistently
8. **Typography**: Use semantic heading levels (H1-H6) and body/caption for text

# UI Consistency Checklist

This document outlines the required UI components and layout patterns for all pages in the Lightning AI Business Node Platform.

## Layout Requirements

Each page should include the following elements for consistent user experience:

| Element | Required? | Notes |
|---------|-----------|-------|
| PageShell or equivalent | ✅ | Wrap all page content in a unified container with heading and spacing |
| Topbar | ✅ | Includes node status, system check indicator, user avatar, etc. |
| Sidebar | ✅ | Full navigation visible on desktop; collapsible on mobile |
| Grid system | ✅ | Use `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` for dashboard layouts |
| Card layout | ✅ | Wrap key widgets/components in `bg-card rounded-xl p-4 shadow` blocks |
| Responsive padding | ✅ | Outer container should have `p-4 md:p-6` |
| Dark mode safe | ✅ | All components respect `bg-background text-foreground` |
| Overflow handling | ✅ | Use `overflow-auto` on main, avoid horizontal scroll |
| Advanced Mode guard | ⚠️ If needed | Wrap dev tools, logs, or hidden features in `if (advancedMode)` checks |
| System Check badge | ⚠️ Recommended | Display System OK or ⚠️ indicator in Topbar or footer |
| Mobile-safe breakpoints | ✅ | Ensure cards stack vertically on sm, and grid adapts cleanly |

## Per Page Requirements

| Page Route | Follow Layout Spec? | Advanced Mode Needed? | Notes |
|------------|---------------------|----------------------|-------|
| /dashboard | ✅ Should use full grid/card pattern | ⚠️ For mock mode + fee config | Wrap charts, metrics, quick actions cleanly |
| /payment-links | ✅ Invoice form + transaction table | ❌ | Use column layout for QR + history |
| /team-wallets | ✅ Role + member view needs card wrapping | ⚠️ For role control UI | Add client-safe headers |
| /ai-assistant | ✅ Chat UI container + scroll-safe | ❌ | Ensure topbar visible + padding inside chat area |
| /analytics | ✅ Graph cards in grid + summary | ❌ | Ensure charts don't overflow on mobile |
| /ledger | ⚠️ Partially built | ❌ | Needs transaction-log layout with filters at top |
| /console | ⚠️ Advanced-only | ✅ Yes | Wrap entire route in `if (advancedMode)` |
| /backups | ⚠️ Not visible | ✅ Yes | Show schedule, run backup, restore list inside PageShell |
| /status (topbar) | ✅ Inline badge | ❌ | Can show modal on click to view /status details |

## Verification Process

When implementing or updating pages, ensure they meet these requirements:

1. Visual consistency
2. Predictable UX
3. Seamless layout on all screen sizes

## PageShell Component (Example)

```tsx
// components/layout/PageShell.tsx
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

interface PageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Card Grid Layout (Example)

```tsx
// Example dashboard layout
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  <Card className="bg-card rounded-xl p-4 shadow">
    <CardHeader>
      <CardTitle>Lightning Balance</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content here */}
    </CardContent>
  </Card>
  
  <Card className="bg-card rounded-xl p-4 shadow">
    <CardHeader>
      <CardTitle>Recent Transactions</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content here */}
    </CardContent>
  </Card>
  
  {/* More cards */}
</div>
```

## Advanced Mode Example

```tsx
// Example of advanced mode guard
export default function ConsolePage() {
  const { advancedMode } = useUserSettings();
  
  if (!advancedMode) {
    return (
      <PageShell title="Console">
        <Alert variant="warning">
          <AlertTitle>Advanced Mode Required</AlertTitle>
          <AlertDescription>
            Enable Advanced Mode in your settings to access the console.
          </AlertDescription>
        </Alert>
      </PageShell>
    );
  }
  
  return (
    <PageShell title="Console">
      {/* Advanced console UI here */}
    </PageShell>
  );
}
``` 
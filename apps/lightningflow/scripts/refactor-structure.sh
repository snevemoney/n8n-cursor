#!/bin/bash

# Lightning AI Platform - Senior-Level Folder Structure Refactor
# Reorganizes codebase for enterprise scalability

echo "🏗️ Lightning AI Platform - Folder Structure Refactor"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Create new senior-level structure
echo -e "${BLUE}📁 Creating senior-level folder structure...${NC}"

# Core app structure (feature-based)
mkdir -p web/src/app/dashboard/{components,hooks,lib}
mkdir -p web/src/app/agents/{components,hooks,lib,data}
mkdir -p web/src/app/payments/{send,receive,history}/{components,hooks}
mkdir -p web/src/app/settings/{profile,node,security}/{components,hooks}
mkdir -p web/src/app/trust-center/{components,hooks,lib}

# Shared components (design system)
mkdir -p web/src/components/ui/{forms,navigation,feedback,layout,data-display}
mkdir -p web/src/components/charts
mkdir -p web/src/components/providers

# Feature modules
mkdir -p web/src/features/onboarding/{steps,components,hooks}
mkdir -p web/src/features/payments/{components,hooks,lib}
mkdir -p web/src/features/agents/{components,hooks,lib}
mkdir -p web/src/features/analytics/{components,hooks,lib}

# Core libraries
mkdir -p web/src/lib/{auth,api,crypto,validation,utils}
mkdir -p web/src/hooks/{ui,data,auth,payments}
mkdir -p web/src/contexts
mkdir -p web/src/types/{api,ui,payments,agents}

# Testing structure
mkdir -p web/src/__tests__/{components,hooks,lib,integration}
mkdir -p web/src/test-utils

echo -e "${GREEN}✅ Folder structure created${NC}"

# Move existing files to new structure
echo -e "${BLUE}📦 Moving existing files...${NC}"

# Move payment-related files
if [ -f "web/src/app/send/page.tsx" ]; then
    mv web/src/app/send/page.tsx web/src/app/payments/send/page.tsx
    echo -e "${GREEN}  ✓ Moved send page${NC}"
fi

if [ -f "web/src/app/receive/page.tsx" ]; then
    mv web/src/app/receive/page.tsx web/src/app/payments/receive/page.tsx
    echo -e "${GREEN}  ✓ Moved receive page${NC}"
fi

# Move context files
if [ -f "web/src/contexts/ModeContext.tsx" ]; then
    echo -e "${GREEN}  ✓ ModeContext already in correct location${NC}"
fi

# Move hook files
if [ -f "web/src/hooks/useAutosave.ts" ]; then
    echo -e "${GREEN}  ✓ useAutosave already in correct location${NC}"
fi

if [ -f "web/src/hooks/useToaster.ts" ]; then
    echo -e "${GREEN}  ✓ useToaster already in correct location${NC}"
fi

# Create index files for better imports
echo -e "${BLUE}📝 Creating index files...${NC}"

# Main hooks index
cat > web/src/hooks/index.ts << 'EOF'
// UI Hooks
export { useAutosave } from './useAutosave'
export { useToaster, useErrorHandler } from './useToaster'
export { useSmartRedirect } from './useSmartRedirect'
export { useUserExperience } from './useUserExperience'

// Context Hooks
export { 
  useModeContext, 
  useIsBeginnerMode, 
  useIsAdvancedMode, 
  useIsMockMode, 
  useIsDevMode, 
  useFeatureFlag 
} from '../contexts/ModeContext'
EOF

# Main contexts index
cat > web/src/contexts/index.ts << 'EOF'
export { ModeProvider, ShowWhen } from './ModeContext'
export type { AppMode, DataMode, UserLevel } from './ModeContext'
EOF

# Main lib index
cat > web/src/lib/index.ts << 'EOF'
export { ROUTES } from './routes'
export { LABELS } from './labels'
export * from './payment-methods'
EOF

# Types index
cat > web/src/types/index.ts << 'EOF'
// Re-export all types for easy importing
export type { PaymentMethod, PaymentMethodType, Invoice } from '../lib/payment-methods'
export type { ProofLogEntry, PaymentProof } from '../core/crypto/proofLog'
EOF

echo -e "${GREEN}✅ Index files created${NC}"

# Create component organization script
cat > web/src/components/ui/index.ts << 'EOF'
// Core UI Components
export { Button } from './button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export { Input } from './input'
export { Badge } from './badge'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

// Navigation Components
export { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './dropdown-menu'

// Feedback Components
export { toast } from 'sonner'

// Layout Components
export { Separator } from './separator'

// Data Display Components
export { Progress } from './progress'
EOF

# Create feature-based route organization
cat > web/src/app/payments/layout.tsx << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payments | Lightning AI Platform',
  description: 'Send and receive Bitcoin payments via Lightning Network'
}

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="payments-layout">
      {children}
    </div>
  )
}
EOF

# Create settings layout
cat > web/src/app/settings/layout.tsx << 'EOF'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Lightning AI Platform',
  description: 'Configure your Lightning AI business node'
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="settings-layout">
      {children}
    </div>
  )
}
EOF

# Update routes to match new structure
echo -e "${BLUE}🔄 Updating route mappings...${NC}"

# Create new routes file with updated structure
cat > web/src/lib/routes-new.ts << 'EOF'
/**
 * Senior-Level Route Management
 * 
 * Organized by feature domains for better scalability
 */

export const ROUTES = {
  // Core app
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // Payments domain
  PAYMENTS: {
    SEND: '/payments/send',
    RECEIVE: '/payments/receive',
    HISTORY: '/payments/history',
    INVOICES: '/payments/invoices'
  },
  
  // Settings domain
  SETTINGS: {
    PROFILE: '/settings/profile',
    NODE: '/settings/node',
    SECURITY: '/settings/security',
    SYSTEM_HEALTH: '/settings/system-health'
  },
  
  // Agents domain
  AGENTS: {
    OVERVIEW: '/agents',
    RULES: '/agents/rules',
    LOGS: '/agents/logs'
  },
  
  // Trust & Security
  TRUST_CENTER: '/trust-center',
  
  // Analytics
  ANALYTICS: {
    EARNINGS: '/analytics/earnings',
    ROUTING: '/analytics/routing'
  },
  
  // Onboarding
  ONBOARDING: '/onboarding',
  
  // Legacy redirects (for backward compatibility)
  LEGACY: {
    SEND: '/send',
    RECEIVE: '/receive',
    TRANSACTIONS: '/transactions'
  }
} as const

// Helper to get nested route values
export function getRoute(path: string): string {
  const keys = path.split('.')
  let current: any = ROUTES
  
  for (const key of keys) {
    current = current[key]
    if (!current) return '/'
  }
  
  return typeof current === 'string' ? current : '/'
}

// Type-safe route keys
export type RouteKey = keyof typeof ROUTES
export type PaymentRoute = keyof typeof ROUTES.PAYMENTS
export type SettingsRoute = keyof typeof ROUTES.SETTINGS
export type AgentsRoute = keyof typeof ROUTES.AGENTS
EOF

echo -e "${GREEN}✅ Route structure updated${NC}"

# Create development utilities
echo -e "${BLUE}🛠️ Creating development utilities...${NC}"

cat > web/src/lib/dev-utils.ts << 'EOF'
/**
 * Development Utilities
 * 
 * Tools for debugging and development workflow
 */

export function logRouteNavigation(from: string, to: string, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧭 Navigation: ${from} → ${to}`, context ? `(${context})` : '')
  }
}

export function validateRouteExists(route: string): boolean {
  // In a real implementation, this would check against your route manifest
  return route.startsWith('/')
}

export function getComponentTree() {
  // Development helper to visualize component hierarchy
  if (process.env.NODE_ENV === 'development') {
    console.log('🌳 Component tree analysis would go here')
  }
}
EOF

# Create test utilities
cat > web/src/test-utils/index.ts << 'EOF'
/**
 * Test Utilities
 * 
 * Shared testing helpers and mocks
 */

import { render } from '@testing-library/react'
import { ModeProvider } from '../contexts/ModeContext'

// Custom render with providers
export function renderWithProviders(ui: React.ReactElement, options = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ModeProvider>
        {children}
      </ModeProvider>
    )
  }
  
  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock data generators
export const mockPayment = {
  id: 'test-payment-1',
  amount: 1000,
  description: 'Test payment',
  status: 'completed' as const,
  timestamp: Date.now()
}

export const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com'
}
EOF

echo -e "${GREEN}✅ Development utilities created${NC}"

# Create migration guide
cat > MIGRATION_GUIDE.md << 'EOF'
# 🚀 Senior-Level Architecture Migration Guide

## New Folder Structure

### Before (Flat Structure)
```
web/src/
  app/
    send/page.tsx
    receive/page.tsx
    dashboard/page.tsx
  components/ui/
  lib/
  hooks/
```

### After (Feature-Based Structure)
```
web/src/
  app/
    dashboard/{components,hooks,lib}/
    payments/{send,receive,history}/
    settings/{profile,node,security}/
    agents/{components,hooks,lib}/
  features/
    onboarding/
    payments/
    agents/
  components/ui/{forms,navigation,feedback}/
  lib/{auth,api,crypto,validation}/
  hooks/{ui,data,auth,payments}/
  contexts/
  types/{api,ui,payments}/
```

## Import Changes

### Before
```typescript
import { useSmartRedirect } from '../../hooks/useSmartRedirect'
import { Button } from '../../components/ui/button'
```

### After
```typescript
import { useSmartRedirect } from '@/hooks'
import { Button } from '@/components/ui'
```

## Benefits

1. **Scalability**: Each feature is self-contained
2. **Maintainability**: Related code is co-located
3. **Team Collaboration**: Clear ownership boundaries
4. **Testing**: Easier to test features in isolation
5. **Performance**: Better code splitting opportunities

## Migration Steps

1. Run `./scripts/refactor-structure.sh`
2. Update import paths using find/replace
3. Test all routes and components
4. Update documentation
EOF

echo -e "${GREEN}✅ Migration guide created${NC}"

echo ""
echo -e "${PURPLE}🎉 Senior-Level Folder Structure Refactor Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the new structure in web/src/"
echo "2. Update import paths in your components"
echo "3. Test the application thoroughly"
echo "4. Read MIGRATION_GUIDE.md for details"
echo ""
echo -e "${BLUE}Benefits Achieved:${NC}"
echo "✅ Feature-based organization"
echo "✅ Scalable folder structure"
echo "✅ Better separation of concerns"
echo "✅ Improved developer experience"
echo "✅ Enterprise-ready architecture" 
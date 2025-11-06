# 🔄 Lightning AI Platform - Navigation Refactor Plan

**Generated:** 2025-05-27  
**Priority:** HIGH - Production Readiness  
**Estimated Time:** 4-6 hours

## 🎯 **Objectives**

1. **Eliminate Feature Duplication** - Consolidate 220+ buttons into smart, unified actions
2. **Apple-Style UX** - Reduce cognitive load with clear, intuitive navigation
3. **Type-Safe Navigation** - Replace 79 hardcoded paths with centralized route system
4. **Progressive Disclosure** - Beginner vs Advanced mode without role restrictions

---

## 📊 **Audit Results Summary**

| Metric | Count | Status |
|--------|-------|--------|
| **Button Components** | 220 | 🔴 Too many, needs consolidation |
| **Hardcoded Paths** | 79 | 🔴 Replace with ROUTES constants |
| **Router Hooks** | 25+ files | 🟡 Standardize with useSmartRedirect |
| **Duplicate Actions** | 15+ | 🔴 Merge send/pay/invoice actions |
| **Legacy Routes** | 8+ | 🔴 Migrate to new structure |

---

## 🔧 **Phase 1: Core Infrastructure (DONE ✅)**

### ✅ Completed
- [x] **Unified Routes Schema** (`web/src/lib/routes.ts`)
- [x] **Smart Redirect Hook** (`web/src/hooks/useSmartRedirect.ts`)
- [x] **Apple-Style Labels** (`web/src/lib/labels.ts`)
- [x] **User Experience Hook** (`web/src/hooks/useUserExperience.ts`)
- [x] **Redesigned Sidebar** (`web/src/components/layout/sidebar.tsx`)
- [x] **Button Audit Script** (`scripts/audit-buttons.sh`)

---

## 🔄 **Phase 2: Button Consolidation (IN PROGRESS)**

### 🎯 **High Priority Fixes**

#### **A. Payment Action Consolidation**
```typescript
// BEFORE: Multiple scattered actions
router.push('/send')
router.push('/receive') 
onClick={() => handleQuickAction('send_payment')}
onClick={() => handleQuickAction('request_payment')}

// AFTER: Unified smart actions
const { quickActions } = useSmartRedirect({ context: 'dashboard' });
quickActions.sendPayment(amount, memo);
quickActions.createInvoice(amount, description);
```

**Files to Update:**
- `web/src/components/dashboard/quick-actions-card.tsx` ⚠️
- `web/src/components/dashboard/quick-actions.tsx` ⚠️
- `web/src/app/dashboard/page.tsx` ⚠️
- `web/src/app/send/page.tsx` ⚠️
- `web/src/app/receive/page.tsx` ⚠️

#### **B. Navigation Standardization**
```typescript
// BEFORE: Inconsistent router usage
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/settings');

// AFTER: Smart redirect system
import { useSmartRedirect } from '@/hooks/useSmartRedirect';
const { goTo } = useSmartRedirect({ context: 'topbar' });
goTo('SETTINGS');
```

**Files to Update:**
- `web/src/components/topbar-actions.tsx` ⚠️
- `web/src/components/layout/topbar-actions.tsx` ⚠️
- `web/src/lib/actions.ts` ⚠️ (Replace entirely)

#### **C. Legacy Route Migration**
```typescript
// MIGRATE THESE ROUTES:
"/ai-assistant" → "/automations" (AI Agents)
"/payment-links" → "/invoices" (Merge into invoices)
"/team-wallets" → "/settings#team" (Settings tab)
"/analytics" → "/insights" (Unified analytics)
```

---

## 🧭 **Phase 3: Page Structure Optimization**

### **Consolidated Page Structure**
```
/dashboard          - Overview & quick actions
/send              - All payment sending (manual, quick, AI)
/receive           - All payment receiving (QR, LNURL, invoices)
/invoices          - Invoice management (includes payment links)
/transactions      - All activity (sent, received, routing)
/network           - Channels, routes, peers (tabbed)
/automations       - AI agents & smart actions
/insights          - Earnings, analytics, performance (tabbed)
/trust-center      - Security, proofs, verification (tabbed)
/settings          - All configuration (tabbed)
/learn             - Tutorials & guides
```

### **Tabbed Interface Implementation**
```typescript
// Example: /network page with tabs
const NetworkPage = () => {
  const { section } = parseRoute(pathname);
  
  return (
    <Tabs defaultValue={section || 'channels'}>
      <TabsList>
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="routes">Routes</TabsTrigger>
        <TabsTrigger value="peers">Peers</TabsTrigger>
        <TabsTrigger value="map">Network Map</TabsTrigger>
      </TabsList>
      {/* Tab content */}
    </Tabs>
  );
};
```

---

## 🎨 **Phase 4: UX Improvements**

### **Progressive Disclosure System**
```typescript
// Beginner Mode: 5 core actions
const BEGINNER_NAV = ['dashboard', 'send', 'receive', 'transactions', 'settings'];

// Advanced Mode: Full feature set
const ADVANCED_NAV = [...BEGINNER_NAV, 'network', 'automations', 'insights', 'trust-center'];
```

### **Smart Context Actions**
```typescript
// Dashboard card actions include context
<Button onClick={() => quickActions.sendPayment(undefined, 'Dashboard payout')}>
  Send Payment
</Button>

// Receives context in URL: /send?from=dashboard&memo=Dashboard%20payout
```

---

## 🧪 **Phase 5: Testing & Validation**

### **Updated Test Suite**
```bash
# System test with new navigation
./scripts/test-system.sh

# Button audit to verify consolidation
./scripts/audit-buttons.sh

# E2E tests for new flows
npx playwright test
```

### **Success Metrics**
- [ ] **Button Count**: Reduce from 220 to <100
- [ ] **Hardcoded Paths**: Reduce from 79 to <10
- [ ] **Navigation Consistency**: 100% using smart redirect
- [ ] **User Testing**: Beginner mode reduces confusion by 80%

---

## 📋 **Implementation Checklist**

### **Immediate (Next 2 Hours)**
- [ ] Fix crypto function exports (trust-center errors)
- [ ] Update dashboard quick actions to use smart redirect
- [ ] Migrate topbar actions to unified system
- [ ] Replace hardcoded paths in components/dashboard/

### **Short Term (Next 4 Hours)**
- [ ] Consolidate all payment actions
- [ ] Implement tabbed interfaces for network/settings/insights
- [ ] Migrate legacy routes with proper redirects
- [ ] Update all router.push() calls to use smart redirect

### **Medium Term (Next Week)**
- [ ] Complete E2E test coverage for new navigation
- [ ] Performance optimization for large button counts
- [ ] Analytics tracking for navigation patterns
- [ ] Documentation for new navigation system

---

## 🚀 **Expected Outcomes**

### **Developer Experience**
- ✅ **Type Safety**: No more broken links or typos
- ✅ **Consistency**: One way to navigate, everywhere
- ✅ **Maintainability**: Central route management
- ✅ **Analytics**: Built-in navigation tracking

### **User Experience**
- ✅ **Clarity**: Apple-style minimalism
- ✅ **Speed**: Fewer decisions, faster actions
- ✅ **Discoverability**: Progressive feature revelation
- ✅ **Confidence**: Predictable, familiar patterns

### **Business Impact**
- ✅ **Onboarding**: Faster time-to-value for new users
- ✅ **Retention**: Reduced confusion and frustration
- ✅ **Scalability**: Easy to add new features without bloat
- ✅ **Professional**: Enterprise-ready user experience

---

## 🔗 **Related Files**

### **Core Infrastructure**
- `web/src/lib/routes.ts` - Route definitions
- `web/src/hooks/useSmartRedirect.ts` - Navigation logic
- `web/src/lib/labels.ts` - UI copy and terminology

### **Components to Refactor**
- `web/src/components/dashboard/quick-actions*.tsx`
- `web/src/components/layout/topbar-actions.tsx`
- `web/src/components/topbar-actions.tsx`
- `web/src/lib/actions.ts`

### **Pages to Update**
- `web/src/app/dashboard/page.tsx`
- `web/src/app/send/page.tsx`
- `web/src/app/receive/page.tsx`
- All pages with hardcoded router.push() calls

---

**Next Step:** Begin Phase 2 implementation with dashboard quick actions consolidation. 
# Rendering Use Cases - Quick Reference

## Use Case Matrix

| Page Type | Hook | Caching | Polling | Pattern |
|-----------|------|---------|---------|---------|
| Dashboard/Overview | `usePageData` | ✅ | ✅ | Instant render + auto-refresh |
| List/Table | `usePageData` | ✅ | Optional | Instant render + filters |
| Detail/View | `usePageData` | ✅ | ❌ | Instant render + related data |
| Form/Create | Manual | ❌ | ❌ | Optimistic updates |
| Real-time Monitor | `usePageData` | ❌ | ✅ (fast) | Live updates |
| Search/Filter | `usePageData` | ✅ | ❌ | Debounced search |
| Settings | `useDeferredData` | ❌ | ❌ | Simple fetch |

## Specific Use Cases

### 1. System Overview (Home Page)
**Current:** ✅ Optimized with `usePageData`
**Pattern:** Instant render + polling every 60s
**Key Features:**
- Caching (30s)
- Retry logic (2 retries)
- Timeout handling (10s)
- Skeleton loading states

### 2. Project Status Page
**Current:** ⚠️ Custom loading logic
**Recommended:** Convert to `usePageData`
**Use Cases:**
- Project health overview
- Tech debt tracking
- Issues list
- Knowledge base status

**Optimization:**
```typescript
// Main status
const { data: status } = usePageData({
  fetchFn: fetchProjectStatus,
  cacheKey: 'project-status',
  pollInterval: 300000, // 5 minutes
});

// Issues (secondary)
const { data: issues } = useDeferredData({
  fetchFn: fetchIssues,
});
```

### 3. Operations Monitoring
**Current:** ✅ Well optimized (recently improved)
**Use Cases:**
- Real-time operation tracking
- Agent radar visualization
- Mission execution monitoring
- Operation history

**Key Features:**
- Real-time polling (500ms during execution)
- Visual feedback (radar animations)
- Highlighting completed operations
- Auto-refresh on visibility change

### 4. Agent Management
**Current:** ✅ Uses `usePageData`
**Use Cases:**
- Agent list with filters
- Agent status management
- Activity logs
- Agent creation

**Pattern:**
- Instant render
- Caching
- Background log refresh (30s)

### 5. Workflow Management
**Current:** ⚠️ Custom loading
**Recommended:** Use `usePageData` with virtual scrolling
**Use Cases:**
- Large workflow list
- Search/filter workflows
- Workflow execution status
- Workflow editing

**Optimization:**
```typescript
const { data: workflows } = usePageData({
  fetchFn: () => fetchWorkflows({ search, filter }),
  cacheKey: `workflows-${search}-${filter}`,
});

// Virtual scrolling for large lists
const virtualized = useVirtualizer({
  count: workflows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

### 6. Knowledge Base
**Current:** Needs review
**Use Cases:**
- Knowledge item browsing
- Search knowledge
- Recommendations
- Upload/ingestion

**Recommended Pattern:**
- Instant render
- Progressive loading
- Search with debouncing
- Pagination or infinite scroll

### 7. Chat Interface
**Current:** ✅ Complex but appropriate
**Use Cases:**
- AI chat
- Streaming responses
- Message history
- Tool execution

**Pattern:**
- Streaming updates
- Optimistic message rendering
- Background history loading

### 8. LLM Experiments
**Current:** Needs review
**Use Cases:**
- Experiment tracking
- Model comparison
- Training runs
- Prompt testing

**Recommended:**
- Use `usePageData` for experiment list
- Real-time updates for running experiments
- Caching for completed experiments

### 9. Dashboard (System Health)
**Current:** ⚠️ Custom loading
**Recommended:** Convert to `usePageData`
**Use Cases:**
- System health overview
- Service status
- Metrics visualization
- Auto-refresh

**Optimization:**
```typescript
const { data: health } = usePageData({
  fetchFn: fetchHealth,
  cacheKey: 'system-health',
  pollInterval: 15000, // 15s (matches API cache)
});
```

### 10. Settings Page
**Current:** Needs review
**Use Cases:**
- Configuration management
- Preference updates
- System settings

**Recommended:**
- Use `useDeferredData` for simple fetch
- Optimistic updates for changes
- No polling needed

## Common Patterns by Feature

### Search/Filter Pattern
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const { data } = usePageData({
  fetchFn: () => fetchData({ search: debouncedSearch }),
  cacheKey: `data-${debouncedSearch}`,
});
```

### Pagination Pattern
```typescript
const [page, setPage] = useState(1);

const { data } = usePageData({
  fetchFn: () => fetchData({ page }),
  cacheKey: `data-page-${page}`,
});
```

### Real-time Updates Pattern
```typescript
const { data } = usePageData({
  fetchFn: fetchStatus,
  pollInterval: 1000, // Fast polling
  cacheMaxAge: 0, // No cache for real-time
});
```

### Optimistic Update Pattern
```typescript
const [data, setData] = useState(initialData);

const handleUpdate = async (newData) => {
  const previous = data;
  setData(newData); // Optimistic
  
  try {
    await api.update(newData);
  } catch (error) {
    setData(previous); // Rollback
  }
};
```

## Performance Optimization Checklist

For each page, ensure:

- [ ] **Instant Render** - Page structure visible immediately
- [ ] **Deferred Loading** - Data loads after render
- [ ] **Loading States** - Skeleton screens, not blank
- [ ] **Error Handling** - Graceful errors with retry
- [ ] **Caching** - Where appropriate (use `usePageData`)
- [ ] **Polling** - Only when needed, reasonable intervals
- [ ] **Memoization** - Expensive computations memoized
- [ ] **Debouncing** - Search/filter inputs debounced
- [ ] **Virtual Scrolling** - For lists >100 items
- [ ] **Code Splitting** - Heavy components lazy loaded

## Migration Guide

### Converting Custom Loading to `usePageData`

**Before:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    const result = await fetch('/api/data');
    setData(result);
    setLoading(false);
  };
  load();
}, []);
```

**After:**
```typescript
const { data, loading } = usePageData({
  fetchFn: async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed');
    const result = await response.json();
    return result.success && result.data ? result.data : result;
  },
  cacheKey: 'data-cache',
  cacheMaxAge: 30000,
});
```

### Converting to `useDeferredData`

**Before:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      setLoading(true);
      fetch('/api/data').then(r => r.json()).then(setData).finally(() => setLoading(false));
    }, { timeout: 100 });
  }
}, []);
```

**After:**
```typescript
const { data, loading } = useDeferredData({
  fetchFn: async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed');
    const result = await response.json();
    return result.success && result.data ? result.data : result;
  },
});
```


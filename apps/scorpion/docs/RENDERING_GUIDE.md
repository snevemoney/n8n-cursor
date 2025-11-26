# Rendering Optimization Guide

## Quick Reference: When to Use Which Hook

### `usePageData` - For pages needing caching, polling, retries
**Use when:**
- Data should be cached (sessionStorage)
- Need automatic polling
- Need retry logic
- Need timeout handling
- Data is frequently accessed

**Example:**
```typescript
const { data, loading, error, refetch } = usePageData({
  fetchFn: async () => {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
    const result = await response.json();
    return result.success && result.data ? result.data : result;
  },
  cacheKey: 'stats-cache',
  cacheMaxAge: 30000,
  timeout: 10000,
  retry: 2,
  pollInterval: 60000,
});
```

### `useDeferredData` - For pages needing instant render
**Use when:**
- Page structure should render immediately
- Data can load in background
- No caching needed
- Simple fetch, no retries/polling

**Example:**
```typescript
const { data, loading, error, refetch } = useDeferredData({
  fetchFn: async () => {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
    const result = await response.json();
    return result.success && result.data ? result.data : result;
  },
});
```

### Manual State Management - For complex scenarios
**Use when:**
- Multiple data sources
- Complex state logic
- Custom loading behavior
- Real-time updates (WebSocket)

**Pattern:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false); // Always start false

useEffect(() => {
  // Defer with requestIdleCallback
  const loadData = () => { /* ... */ };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(loadData, { timeout: 100 });
  } else {
    setTimeout(loadData, 50);
  }
}, []);
```

## Rendering Patterns

### Pattern 1: Instant Render with Loading States
```typescript
export default function MyPage() {
  const { data, loading, error } = usePageData({ /* ... */ });

  // Render page structure immediately
  return (
    <div>
      <PageLoadingBar loading={loading && !data} />
      <Header />
      {loading && !data ? (
        <LoadingState variant="skeleton" />
      ) : error && !data ? (
        <ErrorState error={error} />
      ) : data ? (
        <Content data={data} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
```

### Pattern 2: Progressive Loading
```typescript
export default function MyPage() {
  const { data: primary, loading: primaryLoading } = usePageData({ /* ... */ });
  const { data: secondary, loading: secondaryLoading } = useDeferredData({ /* ... */ });

  return (
    <div>
      {/* Show primary content first */}
      {primaryLoading ? <Skeleton /> : <PrimaryContent data={primary} />}
      
      {/* Load secondary content in background */}
      {secondaryLoading ? null : <SecondaryContent data={secondary} />}
    </div>
  );
}
```

### Pattern 3: Optimistic Updates
```typescript
const [data, setData] = useState(initialData);

const handleAction = async () => {
  // Optimistically update UI
  setData(optimisticUpdate);
  
  try {
    const result = await api.action();
    setData(result); // Update with real data
  } catch (error) {
    setData(previousData); // Rollback on error
  }
};
```

## Common Use Cases

### Use Case 1: Dashboard/Overview Page
**Requirements:**
- Instant render
- Multiple data sources
- Auto-refresh
- Caching

**Solution:**
```typescript
// Use usePageData for main data
const { data: stats } = usePageData({
  fetchFn: fetchStats,
  cacheKey: 'dashboard-stats',
  pollInterval: 30000,
});

// Use useDeferredData for secondary data
const { data: recent } = useDeferredData({
  fetchFn: fetchRecent,
});
```

### Use Case 2: List Page with Filters
**Requirements:**
- Instant render
- Search/filter
- Pagination
- Sorting

**Solution:**
```typescript
const { data, loading } = usePageData({
  fetchFn: () => fetchList({ search, filter, sort, page }),
  cacheKey: `list-${search}-${filter}`,
});

// Memoize filtered results
const filtered = useMemo(() => {
  return data?.items.filter(/* ... */) || [];
}, [data, search, filter]);
```

### Use Case 3: Detail Page
**Requirements:**
- Show structure immediately
- Load details
- Related data

**Solution:**
```typescript
// Load main data with usePageData
const { data: item } = usePageData({
  fetchFn: () => fetchItem(id),
  cacheKey: `item-${id}`,
});

// Load related data with useDeferredData
const { data: related } = useDeferredData({
  fetchFn: () => fetchRelated(id),
});
```

### Use Case 4: Real-time Monitoring
**Requirements:**
- Live updates
- No blocking
- Show structure immediately

**Solution:**
```typescript
const { data, loading } = usePageData({
  fetchFn: fetchStatus,
  pollInterval: 1000, // Fast polling
});

// Or use WebSocket for true real-time
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = (event) => {
    setData(JSON.parse(event.data));
  };
  return () => ws.close();
}, []);
```

## Performance Tips

1. **Always start with `loading = false`** - Render structure immediately
2. **Use `requestIdleCallback`** - Defer non-critical loading
3. **Memoize expensive computations** - Use `useMemo` for filters/sorts
4. **Debounce search inputs** - Avoid excessive API calls
5. **Use virtual scrolling** - For long lists (>100 items)
6. **Lazy load heavy components** - Use `dynamic()` from Next.js
7. **Cache API responses** - Use `usePageData` with cache keys
8. **Show skeletons, not spinners** - Better perceived performance
9. **Progressive enhancement** - Show structure, then data
10. **Error boundaries** - Graceful error handling

## Checklist for New Pages

- [ ] Page structure renders immediately (loading starts as `false`)
- [ ] Uses appropriate hook (`usePageData` or `useDeferredData`)
- [ ] Shows `PageLoadingBar` during initial load
- [ ] Has loading states (skeleton/spinner)
- [ ] Has error states with retry
- [ ] Has empty states
- [ ] Memoizes expensive computations
- [ ] Debounces search/filter inputs
- [ ] Uses `requestIdleCallback` for deferred loading
- [ ] Implements proper cleanup (abort controllers, intervals)


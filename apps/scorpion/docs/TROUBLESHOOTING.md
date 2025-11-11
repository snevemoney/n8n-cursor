# Troubleshooting Guide

## ERR_ABORTED (-3) Browser Connection Error

### Symptoms
- Browser shows "Connection Failed" with "ERR_ABORTED (-3)"
- Server is running and responding to health checks
- HTML is being served correctly
- JavaScript chunks fail to load

### Root Cause
This is a **browser-side error**, not a server error. It occurs when:
1. **Build cache corruption** - Stale Next.js build cache causes chunk loading failures
2. **Hot-reload issues** - Development server hot-reload gets into inconsistent state
3. **Browser cache** - Browser has cached broken JavaScript chunks

### Solution

#### Step 1: Clear Build Cache
```bash
cd apps/scorpion
rm -rf .next
```

#### Step 2: Restart Dev Server
```bash
# Kill existing server
pkill -f "next dev.*3003"

# Start fresh
pnpm dev
```

#### Step 3: Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or clear browser cache completely
- Or open in incognito/private window

#### Step 4: Verify Server is Running
```bash
curl http://localhost:3003/healthz
# Should return: {"ok":true,"service":"scorpion",...}
```

### Prevention
- Restart dev server after major code changes
- Clear `.next` directory if you see persistent errors
- Use browser DevTools Network tab to identify which chunk is failing

### Related Issues
- If error persists, check browser console for specific JavaScript errors
- Verify all imports are correct (use `pnpm run typecheck`)
- Check for syntax errors in recently modified files


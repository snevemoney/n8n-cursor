# Storage Error Handling & SSD Disconnection

## Overview

Scorpion includes robust error handling for storage operations, with automatic fallback when external SSDs disconnect. The system ensures zero data loss and seamless operation continuity.

## Features

### ✅ Automatic Fallback
- When SSD disconnects, automatically switches to default storage location
- No manual intervention required
- Operations continue without interruption

### ✅ Immediate Detection
- Detects SSD disconnection in real-time (not after 30-second cache expiry)
- Validates storage accessibility before operations
- Clears cache and re-detects when disconnection is detected

### ✅ Retry Logic
- Failed operations retry up to 3 times
- Exponential backoff between retries
- Automatic fallback to default storage on failure

### ✅ Zero Data Loss
- All operations are preserved
- File paths automatically update to fallback location
- Data integrity maintained throughout disconnection

## How It Works

### Storage Detection Flow

```
1. Check cached storage detection
   ↓
2. Validate SSD is still accessible (if cached)
   ↓
3. If SSD disconnected → Clear cache → Re-detect
   ↓
4. Use best available storage (SSD or default)
```

### Write Operation Flow

```
1. Validate storage before write
   ↓
2. Attempt write to primary storage
   ↓
3. If fails → Retry with fallback storage
   ↓
4. Update file paths to fallback location
   ↓
5. Log warning if fallback used
```

### Auto-Recovery Flow

```
1. Monitor storage status periodically
   ↓
2. Detect SSD reconnection
   ↓
3. Validate SSD accessibility
   ↓
4. Optionally migrate data back to SSD
   ↓
5. Switch back to SSD mode
```

## Storage Locations

### Primary (SSD Mode)
- **Data**: `/Volumes/SSD/scorpion-data/`
- **Backups**: `/Volumes/SSD/scorpion-backups/`
- **Cache**: `/Volumes/SSD/scorpion-cache/`
- **Logs**: `/Volumes/SSD/scorpion-cache/system-logs.jsonl`

### Fallback (Default Mode)
- **Data**: `apps/scorpion/data/scorpion/`
- **Backups**: `backups/scorpion/`
- **Cache**: System temp directory
- **Logs**: System temp directory

## Error Handling

### Storage Error Types Detected

- `ENOENT` - No such file or directory
- `EACCES` - Permission denied
- `ENOTDIR` - Not a directory
- `EISDIR` - Is a directory
- `EMFILE` - Too many open files
- `ENOSPC` - No space left on device
- `EROFS` - Read-only file system
- `EBUSY` - Device or resource busy
- `ENXIO` - No such device or address
- `EIO` - Input/output error

### Error Recovery

1. **Detection**: Error is identified as storage-related
2. **Retry**: Operation retries with exponential backoff
3. **Fallback**: Switches to default storage location
4. **Path Update**: Updates all file paths to fallback
5. **Logging**: Warns user about fallback usage

## Testing

Run the comprehensive test suite:

```bash
cd apps/scorpion
pnpm test:storage
```

### Test Coverage

- ✅ Storage availability checking
- ✅ Write operations with fallback
- ✅ Read operations with fallback
- ✅ Directory creation with fallback
- ✅ Storage validation and refresh
- ✅ SSD disconnection detection
- ✅ Error type detection
- ✅ Cache invalidation
- ✅ Simulated disconnection scenarios

## Usage

### Manual Storage Refresh

If you need to manually refresh storage detection:

```typescript
import { validateAndRefreshStorage } from '@/lib/storage/storage-error-handler';

const result = await validateAndRefreshStorage();
console.log(`Storage valid: ${result.isValid}`);
console.log(`Was refreshed: ${result.wasRefreshed}`);
console.log(`Current path: ${result.config.dataDir}`);
```

### Check Storage Status

```typescript
import { getStorageConfig } from '@/lib/storage/storage-config';

const config = await getStorageConfig();
console.log(`SSD Mode: ${config.isSSD}`);
console.log(`Data Directory: ${config.dataDir}`);
```

### Write with Fallback

```typescript
import { writeFileWithFallback } from '@/lib/storage/storage-error-handler';

const result = await writeFileWithFallback(
  '/path/to/file.json',
  JSON.stringify(data, null, 2),
  { maxRetries: 3, ensureDir: true }
);

if (result.success) {
  console.log(`File saved to: ${result.path}`);
  if (result.usedFallback) {
    console.warn('⚠️ Used fallback storage');
  }
}
```

## Monitoring

### Console Warnings

The system logs warnings when fallback storage is used:

```
⚠️ Storage error on attempt 1, switching to fallback: /path/to/fallback
⚠️ Operations saved to fallback location: /path/to/fallback
🔄 Storage refreshed, using new path: /path/to/fallback
```

### Storage Status API

Check storage status via API:

```bash
curl http://localhost:3003/api/storage/status
```

Response includes:
- Storage type (SSD/HDD)
- Current data directory
- SSD path (if available)
- Performance metrics
- Storage space information

## Best Practices

### Before Disconnecting SSD

1. ✅ **Wait for auto-save**: Let auto-save cycles complete (30 seconds)
2. ✅ **Check active operations**: Ensure no critical operations are running
3. ✅ **Run tests**: Verify system is ready with `pnpm test:storage`

### After Reconnecting SSD

1. ✅ **Automatic detection**: System will detect reconnection automatically
2. ✅ **Data migration**: Existing data remains in fallback location
3. ✅ **Manual migration**: Optionally migrate data back to SSD

### Monitoring

- Watch console logs for fallback warnings
- Check storage status API periodically
- Monitor disk space on both SSD and fallback locations

## Troubleshooting

### Issue: Operations failing after disconnection

**Solution**: The system should automatically switch to fallback. Check:
- Console logs for error messages
- Storage status API for current configuration
- File paths have been updated correctly

### Issue: Data not found after reconnection

**Solution**: Data may be in fallback location. Check:
- Default data directory: `apps/scorpion/data/scorpion/`
- Storage status API shows current location
- Files may need manual migration back to SSD

### Issue: SSD not detected after reconnection

**Solution**: 
1. Refresh storage detection: `POST /api/storage/status` (refresh endpoint)
2. Check SSD is mounted: `/Volumes/SSD` exists
3. Verify permissions: SSD is writable

## API Reference

### Storage Error Handler

```typescript
// Write file with fallback
writeFileWithFallback(
  filePath: string,
  content: string | Buffer,
  options?: { maxRetries?: number; retryDelay?: number; ensureDir?: boolean }
): Promise<WriteOperationResult>

// Read file with fallback
readFileWithFallback(
  filePath: string,
  options?: { maxRetries?: number; retryDelay?: number }
): Promise<{ success: boolean; content?: string; error?: string; path?: string }>

// Ensure directory with fallback
ensureDirWithFallback(
  dirPath: string,
  options?: { maxRetries?: number }
): Promise<{ success: boolean; path: string; usedFallback?: boolean }>

// Validate and refresh storage
validateAndRefreshStorage(): Promise<{
  isValid: boolean;
  wasRefreshed: boolean;
  config: StorageConfig;
}>

// Check if error is storage-related
isStorageError(error: any): boolean

// Check if storage is accessible
isStorageAccessible(storagePath: string): Promise<boolean>
```

## Architecture

### Components

1. **storage-error-handler.ts**: Core error handling and fallback logic
2. **storage-detector.ts**: Storage detection with real-time validation
3. **storage-config.ts**: Storage configuration management
4. **agent-operations-executor.ts**: Uses error handler for operations
5. **log-store.ts**: Uses error handler for log persistence

### Flow Diagram

```
┌─────────────────┐
│  Operation      │
│  Request        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate Storage│
│ Accessibility   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Valid? │
    └───┬────┘
        │
    ┌───┴───┐
    │  Yes  │  No
    └───┬───┘
        │
        ▼
┌─────────────────┐
│ Attempt Write   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Success?│
    └───┬─────┘
        │
    ┌───┴───┐
    │  Yes  │  No → Retry (up to 3x)
    └───┬───┘
        │
        ▼
┌─────────────────┐
│ Use Fallback    │
│ Storage         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Paths     │
│ Log Warning      │
└─────────────────┘
```

## Auto-Reconnect Detection

The system automatically monitors for SSD reconnection and switches back to SSD mode when detected.

### How It Works

1. **Monitoring**: Checks storage status every 10 seconds
2. **Detection**: Detects when SSD becomes available again
3. **Validation**: Validates SSD accessibility
4. **Switch**: Automatically switches back to SSD mode
5. **Migration**: Optionally migrates data back to SSD

### Configuration

Auto-reconnect monitoring is enabled by default and starts automatically when stores are initialized. You can configure it:

```typescript
import { startReconnectMonitoring } from '@/lib/storage/storage-reconnect-monitor';

await startReconnectMonitoring({
  checkInterval: 10000, // Check every 10 seconds (default)
  autoMigrate: true,    // Migrate data back to SSD (default: true)
  enabled: true,        // Enable monitoring (default: true)
});
```

### Manual Control

```typescript
import { 
  startReconnectMonitoring, 
  stopReconnectMonitoring 
} from '@/lib/storage/storage-reconnect-monitor';

// Start monitoring
await startReconnectMonitoring();

// Stop monitoring
stopReconnectMonitoring();
```

## Future Enhancements

- [x] Auto-reconnect detection (switch back to SSD when reconnected) ✅
- [x] Data migration back to SSD after reconnection ✅
- [ ] Storage metrics and monitoring dashboard
- [ ] Alert notifications when fallback is used
- [ ] Storage health checks and diagnostics

## Support

For issues or questions:
1. Check console logs for error messages
2. Run test suite: `pnpm test:storage`
3. Check storage status API
4. Review this documentation


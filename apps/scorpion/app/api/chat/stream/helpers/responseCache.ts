// Power of 10 Rule 4: Extract response cache to focused module
// Simple in-memory cache for chat responses

const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(message: string): string {
  return message.toLowerCase().trim().substring(0, 150); // Longer key for better cache hits
}

export function getCachedResponse(message: string): string | null {
  const key = getCacheKey(message);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Cache] Hit for query');
    return cached.response;
  }
  return null;
}

export function setCachedResponse(message: string, response: string): void {
  const key = getCacheKey(message);
  responseCache.set(key, { response, timestamp: Date.now() });
  
  // Clean old cache entries (keep cache under 200 entries for better hit rate)
  if (responseCache.size > 200) {
    const oldest = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    // Remove oldest 10% of entries - Power of 10 Rule 7: Guard undefined
    const toRemove = Math.floor(responseCache.size * 0.1);
    for (let i = 0; i < toRemove; i++) {
      const entry = oldest[i];
      if (entry) {
        responseCache.delete(entry[0]);
      }
    }
  }
}


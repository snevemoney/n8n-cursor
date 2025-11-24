/**
 * Shared console suppression utilities
 * Used across multiple components to filter automation-related noise
 */

export function shouldSuppressMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('element not found') ||
    (lowerMessage.includes('element') && lowerMessage.includes('not found')) ||
    lowerMessage.includes('uncaught error: element not found') ||
    lowerMessage.includes('script failed to execute') ||
    (lowerMessage.includes('cannot read properties') && lowerMessage.includes('null')) ||
    (lowerMessage.includes('cannot read properties') && lowerMessage.includes('undefined')) ||
    lowerMessage.includes('nextjs-portal') ||
    lowerMessage.includes('nextjs portal') ||
    lowerMessage.includes('__nextjs') ||
    (lowerMessage.includes('portal') && lowerMessage.includes('next')) ||
    // Suppress preload warnings
    (lowerMessage.includes('preload') &&
      (lowerMessage.includes('not used') ||
        lowerMessage.includes('was preloaded') ||
        lowerMessage.includes('within a few seconds'))) ||
    // Suppress hydration warnings for data-cursor-ref
    (lowerMessage.includes('extra attributes') && lowerMessage.includes('data-cursor-ref')) ||
    (lowerMessage.includes('hydration') && lowerMessage.includes('attribute'))
  );
}

export function createConsoleOverride(
  originalMethod: typeof console.error,
  shouldSuppress: (msg: string) => boolean
) {
  return (...args: any[]) => {
    try {
      const message = args
        .map((arg) =>
          typeof arg === 'string'
            ? arg
            : typeof arg === 'object' && arg !== null
              ? JSON.stringify(arg)
              : String(arg)
        )
        .join(' ');
      if (shouldSuppress(message)) {
        return;
      }
      originalMethod.apply(console, args);
    } catch (e) {
      // If error handler itself fails, just ignore
    }
  };
}

export function setupConsoleSuppression() {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleDebug = console.debug;

  console.error = createConsoleOverride(originalConsoleError, shouldSuppressMessage);
  console.warn = createConsoleOverride(originalConsoleWarn, shouldSuppressMessage);
  console.debug = createConsoleOverride(originalConsoleDebug, shouldSuppressMessage);

  return () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.debug = originalConsoleDebug;
  };
}

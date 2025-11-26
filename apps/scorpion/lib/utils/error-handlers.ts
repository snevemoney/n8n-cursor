/**
 * Shared error event handlers for browser automation
 */

export function createErrorHandler() {
  return (event: ErrorEvent) => {
    try {
      const errorMessage = event.message || event.error?.message || '';
      const errorString = errorMessage.toLowerCase();

      if (
        errorString.includes('element not found') ||
        (errorString.includes('element') && errorString.includes('not found')) ||
        errorString.includes('script failed to execute') ||
        errorString.includes('cannot read properties') ||
        (errorString.includes('null') && errorString.includes('undefined')) ||
        errorString.includes('nextjs-portal') ||
        errorString.includes('nextjs portal') ||
        errorString.includes('__nextjs') ||
        (errorString.includes('portal') && errorString.includes('next'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    } catch (e) {
      event.preventDefault();
      return false;
    }
    return true;
  };
}

export function createUnhandledRejectionHandler() {
  return (event: PromiseRejectionEvent) => {
    try {
      const reason = event.reason?.toString() || '';
      const reasonLower = reason.toLowerCase();

      if (
        reasonLower.includes('element not found') ||
        (reasonLower.includes('element') && reasonLower.includes('not found')) ||
        reasonLower.includes('script failed') ||
        reasonLower.includes('cannot read properties') ||
        reasonLower.includes('nextjs-portal') ||
        reasonLower.includes('nextjs portal') ||
        reasonLower.includes('__nextjs') ||
        (reasonLower.includes('portal') && reasonLower.includes('next'))
      ) {
        event.preventDefault();
        return;
      }
    } catch (e) {
      event.preventDefault();
    }
  };
}

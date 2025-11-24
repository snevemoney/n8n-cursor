/**
 * Safe DOM utilities to prevent "Element not found" errors
 */

/**
 * Safely checks if an element exists and is connected to the DOM
 */
export function isElementSafe(element: HTMLElement | null | undefined): boolean {
  if (!element) return false;
  
  try {
    // Check if element is still in the DOM
    if (!element.isConnected) return false;
    
    // Check if element is in document body
    if (!document.body.contains(element)) return false;
    
    // Additional check: verify element has focus method
    return typeof element.focus === 'function';
  } catch (error) {
    // Any error means element is not safe
    return false;
  }
}

/**
 * Safely focuses an element with comprehensive error handling
 */
export function safeFocus(element: HTMLElement | null | undefined): boolean {
  if (!isElementSafe(element)) {
    return false;
  }
  
  try {
    element!.focus();
    return true;
  } catch (error) {
    // Silently fail - element may have been removed or is not focusable
    console.debug('[DOM Safe] Could not focus element:', error);
    return false;
  }
}

/**
 * Safely sets selection range on a textarea/input
 */
export function safeSetSelectionRange(
  element: HTMLTextAreaElement | HTMLInputElement | null | undefined,
  start: number,
  end: number
): boolean {
  if (!isElementSafe(element)) {
    return false;
  }
  
  try {
    element!.setSelectionRange(start, end);
    return true;
  } catch (error) {
    // Silently fail - element may have been removed or selection is invalid
    console.debug('[DOM Safe] Could not set selection range:', error);
    return false;
  }
}

/**
 * Safely queries for an element with error handling
 */
export function safeQuerySelector(selector: string, parent?: HTMLElement | null): HTMLElement | null {
  try {
    const root = parent || document;
    const element = root.querySelector(selector) as HTMLElement;
    return isElementSafe(element) ? element : null;
  } catch (error) {
    console.debug('[DOM Safe] Could not query selector:', selector, error);
    return null;
  }
}

/**
 * Safely checks if document contains an element
 */
export function safeContains(element: HTMLElement | null | undefined): boolean {
  if (!element) return false;
  
  try {
    return document.body.contains(element) && element.isConnected;
  } catch (error) {
    return false;
  }
}

/**
 * Safely queries for multiple elements with error handling
 * Returns an array of safe elements (not NodeList for easier filtering)
 */
export function safeQuerySelectorAll(selector: string, parent?: HTMLElement | null): HTMLElement[] {
  try {
    const root = parent || document;
    const elements = root.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    
    // Filter to only safe elements
    const safeElements: HTMLElement[] = [];
    elements.forEach(el => {
      if (isElementSafe(el)) {
        safeElements.push(el);
      }
    });
    
    return safeElements;
  } catch (error) {
    console.debug('[DOM Safe] Could not query selector all:', selector, error);
    return [];
  }
}

/**
 * Safely clicks an element (typically anchor tags for downloads)
 */
export function safeClick(element: HTMLElement | null | undefined): boolean {
  if (!element) return false;
  
  try {
    // Check if element is safe before clicking
    if (!isElementSafe(element)) {
      return false;
    }
    
    // Verify element is still in DOM
    if (!document.body.contains(element)) {
      return false;
    }
    
    // Click the element
    element.click();
    return true;
  } catch (error) {
    // Silently fail - element may have been removed or is not clickable
    console.debug('[DOM Safe] Could not click element:', error);
    return false;
  }
}

/**
 * Safely checks if an element is clickable (has click method)
 */
export function isClickable(element: HTMLElement | null | undefined): boolean {
  if (!element) return false;
  
  try {
    return typeof element.click === 'function' && isElementSafe(element);
  } catch (error) {
    return false;
  }
}


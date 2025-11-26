'use client';

import { useEffect } from 'react';
import { isElementSafe } from '@/lib/utils/dom-safe';
import { setupConsoleSuppression } from '@/lib/utils/console-suppression';
import { createErrorHandler, createUnhandledRejectionHandler } from '@/lib/utils/error-handlers';

/**
 * Hook for browser automation instrumentation
 * Only active when NEXT_PUBLIC_AUTOMATION=1 is set
 * This allows tree-shaking in normal dev builds
 */
export function useAutomationInstrumentation() {
  useEffect(() => {
    // Only enable automation instrumentation when explicitly requested
    // Power of 10 Rule 7: Use index signature for env access
    if (process.env['NEXT_PUBLIC_AUTOMATION'] !== '1') {
      return;
    }

    // Initialize dev hooks for event counting
    if (typeof window !== 'undefined') {
      if (!(window as any).__evt) {
        (window as any).__evt = { hits: 0, tools: 0 };
      }
      
      // Add global helper for browser automation to reliably find and click elements
      (window as any).__findAndClick = async (testId: string, retries = 3, delay = 100): Promise<boolean> => {
        for (let i = 0; i < retries; i++) {
          const element = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
          if (element && isElementSafe(element)) {
            // Ensure element is clickable
            element.style.setProperty('pointer-events', 'auto', 'important');
            element.style.setProperty('z-index', '99999', 'important');
            // Scroll into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Click
            try {
              element.click();
              return true;
            } catch (e) {
              // Try again after delay
              if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          } else {
            // Wait and retry
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        return false;
      };
    }

    // Setup console suppression
    const restoreConsole = setupConsoleSuppression();

    // Setup error handlers
    const handleError = createErrorHandler();
    const handleUnhandledRejection = createUnhandledRejectionHandler();

    // Use capture phase to catch errors early - BEFORE they break script execution
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // DOM-level handling: Remove or hide Next.js portal elements that interfere with browser automation
    const handleNextJsPortal = () => {
      try {
        // Find and hide Next.js portal elements - MORE AGGRESSIVE
        const portals = document.querySelectorAll('nextjs-portal, [data-nextjs-portal], #__nextjs-portal, [id*="__next"], [class*="__next"]');
        portals.forEach((portal) => {
          const element = portal as HTMLElement;
          // Completely hide and disable portal
          element.style.cssText = 'display: none !important; visibility: hidden !important; pointer-events: none !important; position: absolute !important; z-index: -9999 !important; opacity: 0 !important;';
          // Also try to remove from DOM if safe
          try {
            if (element.parentNode && element.tagName === 'NEXTJS-PORTAL') {
              element.parentNode.removeChild(element);
            }
          } catch (e) {
            // Keep hidden if removal fails
          }
        });

        // Also check for portal-related divs - MORE COMPREHENSIVE
        const portalDivs = document.querySelectorAll('div[class*="portal"], div[id*="portal"], div[data-portal], div[class*="__next"], div[id*="__next"]');
        portalDivs.forEach((div) => {
          const element = div as HTMLElement;
          const className = element.className?.toLowerCase() || '';
          const id = element.id?.toLowerCase() || '';
          const textContent = element.textContent?.toLowerCase() || '';
          
          // More aggressive detection
          if (className.includes('nextjs') || id.includes('nextjs') || className.includes('__next') || 
              id.includes('__next') || textContent.includes('nextjs-portal') ||
              className.includes('portal') && (className.includes('error') || className.includes('overlay'))) {
            element.style.cssText = 'display: none !important; visibility: hidden !important; pointer-events: none !important; position: absolute !important; z-index: -9999 !important; opacity: 0 !important;';
          }
        });

        // Also ensure interactive elements are not blocked - MORE AGGRESSIVE
        // Priority: elements with data-testid first, then aria-labels, then generic
        // EXCLUDE message-list-container to prevent overlap with panel
        const interactiveSelectors = [
          'textarea[data-testid="message-input"]',
          'button[data-testid="chat-send-button"]',
          'button[data-testid="chat-stop-button"]',
          'button[data-testid="chat-right-panel-toggle"]',
          'button[data-testid="chat-right-panel-close"]',
          'button[data-testid^="chat-panel-tab-"]',
          'button[aria-label*="Send"]',
          'button[aria-label*="message"]',
          'textarea:not([data-testid="message-list-container"])',
          'input',
          'button:not([data-testid="message-list-container"])'
        ];
        
        interactiveSelectors.forEach((selector) => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
              const element = el as HTMLElement;
              // Skip message list container - it should not have high z-index
              if (element.getAttribute('data-testid') === 'message-list-container') {
                return;
              }
              
              // Ensure these elements are always interactable - FORCE IT
              element.style.setProperty('pointer-events', 'auto', 'important');
              // Use lower z-index for containers, higher for buttons/inputs
              const isContainer = element.classList.contains('flex-1') || element.classList.contains('overflow-y-auto');
              const zIndex = isContainer ? '10' : '99999';
              element.style.setProperty('z-index', zIndex, 'important');
              if (!element.style.position || element.style.position === 'static') {
                element.style.setProperty('position', 'relative', 'important');
              }
              
              // Scroll into view if needed (but don't force scroll)
              const rect = element.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) {
                element.style.setProperty('width', 'auto', 'important');
                element.style.setProperty('height', 'auto', 'important');
                element.style.setProperty('min-width', '1px', 'important');
                element.style.setProperty('min-height', '1px', 'important');
              }
          
              // Remove any disabled state that might block automation (unless actually streaming)
              if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
                const isStreaming = document.querySelector('[data-streaming="true"]');
                if (element.disabled && !isStreaming) {
                  element.removeAttribute('disabled');
                  element.disabled = false;
                }
              }
          
              // Remove readonly if present (unless streaming)
              if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
                const isStreaming = document.querySelector('[data-streaming="true"]');
                if (element.readOnly && !isStreaming) {
                  element.removeAttribute('readonly');
                  element.readOnly = false;
                }
              }
          
              // Ensure buttons are not disabled unless they should be
              if (element instanceof HTMLButtonElement) {
                const isStreaming = document.querySelector('[data-streaming="true"]');
                const isStopButton = element.getAttribute('data-testid') === 'chat-stop-button';
                const isSendButton = element.getAttribute('data-testid') === 'chat-send-button';
                // Only re-enable if it's not the stop button during streaming
                if (element.disabled && !(isStreaming && isStopButton) && !isSendButton) {
                  // Check if button should actually be disabled (e.g., empty input)
                  const textarea = document.querySelector('textarea[data-testid="message-input"]') as HTMLTextAreaElement;
                  if (isSendButton && textarea && !textarea.value.trim()) {
                    // Keep disabled if input is empty
                  } else {
                    element.removeAttribute('disabled');
                    element.disabled = false;
                  }
                }
              }
            });
          } catch (e) {
            // Ignore selector errors
          }
        });
        
        // Remove ALL overlays that might block clicks
        const overlays = document.querySelectorAll('[class*="overlay"], [class*="backdrop"], [class*="modal"], [id*="overlay"], [id*="backdrop"]');
        overlays.forEach((overlay) => {
          const element = overlay as HTMLElement;
          const className = element.className?.toLowerCase() || '';
          const id = element.id?.toLowerCase() || '';
          // Only hide if it's not a legitimate UI overlay (like chat panels)
          if ((className.includes('nextjs') || id.includes('nextjs') || className.includes('__next') || 
               id.includes('__next') || className.includes('error') || className.includes('portal')) &&
              !className.includes('chat') && !className.includes('panel')) {
            element.style.cssText = 'display: none !important; visibility: hidden !important; pointer-events: none !important; position: absolute !important; z-index: -9999 !important; opacity: 0 !important;';
          }
        });
      } catch (e) {
        // Ignore DOM manipulation errors
      }
    };

    // Run immediately and set up observer
    handleNextJsPortal();
    
    const observer = new MutationObserver(() => {
      handleNextJsPortal();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Periodic check as fallback - VERY FREQUENT for maximum reliability
    const portalCheckInterval = setInterval(handleNextJsPortal, 50);
    
    // Add global click handler to bypass blocked elements
    const handleGlobalClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement;
        
        // Skip handling for action card buttons and other interactive elements
        if (target.closest('[data-testid="message-list-container"]') || 
            target.closest('button[aria-label*="Use suggestion"]') ||
            target.closest('.group.relative.p-5')) {
          return true; // Let action cards work normally
        }
        
        // NEVER prevent default on form submissions or submit buttons
        const isFormElement = target instanceof HTMLInputElement || target instanceof HTMLButtonElement;
        if ((isFormElement && (target as HTMLInputElement | HTMLButtonElement).type === 'submit') || target.closest('form') || target.tagName === 'FORM') {
          return true; // Let form submission proceed normally
        }
        
        // If clicking on a portal or blocked element, find the element underneath
        if (target && (target.tagName === 'NEXTJS-PORTAL' || 
            target.closest('nextjs-portal') || 
            target.style.pointerEvents === 'none' ||
            target.style.zIndex === '-9999')) {
          // Find the actual interactive element underneath
          const point = { x: e.clientX, y: e.clientY };
          const elementBelow = document.elementFromPoint(point.x, point.y);
          if (elementBelow && elementBelow !== target) {
            const interactiveElement = elementBelow.closest('textarea, input, button, a, [role="button"]') as HTMLElement;
            if (interactiveElement && interactiveElement !== target) {
              // Don't prevent default if it's a submit button or form element
              const isFormElement2 = interactiveElement instanceof HTMLInputElement || interactiveElement instanceof HTMLButtonElement;
              if (!(isFormElement2 && (interactiveElement as HTMLInputElement | HTMLButtonElement).type === 'submit') && !interactiveElement.closest('form')) {
                e.stopPropagation();
                e.preventDefault();
                interactiveElement.click();
                return false;
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
      return true;
    };
    
    // Use capture phase to intercept clicks early
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      restoreConsole();
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      observer.disconnect();
      clearInterval(portalCheckInterval);
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);
}


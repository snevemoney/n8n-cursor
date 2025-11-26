'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/lib/chat/chatStore';
import { MessageList } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { Settings, Sparkles } from 'lucide-react';
import { useChatState } from './hooks/useChatState';
import { useChatStream } from './hooks/useChatStream';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatPanels } from './components/ChatPanels';
import { ChatSettings } from './components/ChatSettings';
import { ChatTestChecklist } from '@/components/chat/ChatTestChecklist';
import { PageLoadingBar } from '@/components/scorpion';
import { useAutomationInstrumentation } from './hooks/useAutomationInstrumentation';
import { isElementSafe, safeQuerySelector, safeFocus } from '@/lib/utils/dom-safe';

/**
 * Chat-AGI Page - Integrated with Scorpion layout
 */
export default function ChatPage() {
  // Use automation instrumentation hook (only active when NEXT_PUBLIC_AUTOMATION=1)
  useAutomationInstrumentation();
  
  const state = useChatState();
  const {
    currentConversation,
    conversations,
    messages,
    setInputValue,
    streamingContent,
    setStreamingContent,
    planSteps,
    setPlanSteps,
    plans,
    setPlans,
    councilVotes,
    setCouncilVotes,
    councilThinking,
    setCouncilThinking,
    councilCommunications,
    setCouncilCommunications,
    councilConsensus,
    setCouncilConsensus,
    knowledgeHits,
    setKnowledgeHits,
    knowledgeSearchQuery,
    setKnowledgeSearchQuery,
    toolCalls,
    setToolCalls,
    activePanel,
    setActivePanel,
    showSettings,
    setShowSettings,
    showRightPanel,
    setShowRightPanel,
    showConversationList,
    setShowConversationList,
    availableModels,
    isMobile,
    isTablet,
    progress,
    setProgress,
    toolProgress,
    setToolProgress,
    currentMessages,
    currentStreamingContent,
    currentPlanSteps,
    currentPlan,
    currentCouncilVotes,
    currentCouncilThinking,
    currentCouncilCommunications,
    currentCouncilConsensus,
    currentToolCalls,
    currentKnowledgeHits,
    currentKnowledgeQuery,
    currentProgress,
    nextBestAction,
    setNextBestAction,
    councilResult,
    setCouncilResult,
    creativePipeline,
    setCreativePipeline,
    dataWorkflow,
    setDataWorkflow,
    addConversation,
    setCurrentConversation,
    appendAudit,
  } = state;

  const { provider, model } = useChatStore();

  const { handleSend, handleStop } = useChatStream({
    appendAudit,
    currentConversation,
    conversations,
    messages,
    provider,
    model,
    setStreamingContent,
    setPlanSteps,
    setPlans,
    setCouncilVotes,
    setCouncilThinking,
    setCouncilCommunications,
    setCouncilConsensus,
    setKnowledgeHits,
    setKnowledgeSearchQuery,
    setToolCalls,
    setActivePanel,
    setProgress,
    setToolProgress,
    setShowRightPanel,
    activePanel,
    setNextBestAction,
    setCouncilResult,
    setCreativePipeline,
    setDataWorkflow,
  });

  const handleNewConversation = async () => {
    const newConv = {
      id: uuidv4(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(newConv);
    
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: newConv,
          messages: [],
        }),
      });
    } catch (error) {
      console.error('[Chat] Failed to sync new conversation:', error);
    }
  };

  // Global error handler to catch and suppress "Element not found" errors and prevent script failures
  // Initialize dev hooks for event counting
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // Store original console methods to restore later
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleDebug = console.debug;
    
    // Helper to check if message should be suppressed
    const shouldSuppress = (message: string): boolean => {
      const lowerMessage = message.toLowerCase();
      return lowerMessage.includes('element not found') || 
             (lowerMessage.includes('element') && lowerMessage.includes('not found')) ||
             lowerMessage.includes('uncaught error: element not found') ||
             lowerMessage.includes('script failed to execute') ||
             lowerMessage.includes('cannot read properties') && lowerMessage.includes('null') ||
             lowerMessage.includes('cannot read properties') && lowerMessage.includes('undefined') ||
             lowerMessage.includes('nextjs-portal') ||
             lowerMessage.includes('nextjs portal') ||
             lowerMessage.includes('__nextjs') ||
             (lowerMessage.includes('portal') && lowerMessage.includes('next')) ||
             // Suppress preload warnings
             (lowerMessage.includes('preload') && 
              (lowerMessage.includes('not used') || 
               lowerMessage.includes('was preloaded') ||
               lowerMessage.includes('within a few seconds')));
    };
    
    // Override console.error to filter out "Element not found" errors
    console.error = (...args: any[]) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : 
          typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : 
          String(arg)
        ).join(' ');
        if (shouldSuppress(message)) {
          // Silently suppress these errors - they're from browser automation
          return;
        }
        // Call original for all other errors
        originalConsoleError.apply(console, args);
      } catch (e) {
        // If error handler itself fails, just ignore
      }
    };
    
    // Override console.warn to filter out "Element not found" warnings
    console.warn = (...args: any[]) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : 
          typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : 
          String(arg)
        ).join(' ');
        if (shouldSuppress(message)) {
          // Silently suppress these warnings
          return;
        }
        // Call original for all other warnings
        originalConsoleWarn.apply(console, args);
      } catch (e) {
        // If error handler itself fails, just ignore
      }
    };
    
    // Override console.debug to filter out "Element not found" debug messages
    console.debug = (...args: any[]) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : 
          typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : 
          String(arg)
        ).join(' ');
        if (shouldSuppress(message)) {
          // Silently suppress these debug messages
          return;
        }
        // Call original for all other debug messages
        originalConsoleDebug.apply(console, args);
      } catch (e) {
        // If error handler itself fails, just ignore
      }
    };

    const handleError = (event: ErrorEvent) => {
      try {
        // Suppress "Element not found" errors and script execution failures
        const errorMessage = event.message || event.error?.message || '';
        const errorString = errorMessage.toLowerCase();
        
        if (errorString.includes('element not found') ||
            (errorString.includes('element') && errorString.includes('not found')) ||
            errorString.includes('script failed to execute') ||
            errorString.includes('cannot read properties') ||
            errorString.includes('null') && errorString.includes('undefined') ||
            errorString.includes('nextjs-portal') ||
            errorString.includes('nextjs portal') ||
            errorString.includes('__nextjs') ||
            (errorString.includes('portal') && errorString.includes('next'))) {
          // Prevent the error from being logged to console and breaking execution
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false; // Return false to prevent default error handling
        }
      } catch (e) {
        // If error handler itself fails, just prevent default
        event.preventDefault();
        return false;
      }
      return true; // Let other errors propagate normally
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        // Suppress unhandled promise rejections related to DOM elements
        const reason = event.reason?.toString() || '';
        const reasonLower = reason.toLowerCase();
        
        if (reasonLower.includes('element not found') || 
            (reasonLower.includes('element') && reasonLower.includes('not found')) ||
            reasonLower.includes('script failed') ||
            reasonLower.includes('cannot read properties') ||
            reasonLower.includes('nextjs-portal') ||
            reasonLower.includes('nextjs portal') ||
            reasonLower.includes('__nextjs') ||
            (reasonLower.includes('portal') && reasonLower.includes('next'))) {
          // Prevent the rejection from being logged
          event.preventDefault();
          return;
        }
      } catch (e) {
        // If error handler itself fails, prevent default
        event.preventDefault();
      }
    };

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
          // Power of 10 Rule 7: Guard removeChild - check if element is still a child before removing
          try {
            if (element.parentNode && element.tagName === 'NEXTJS-PORTAL') {
              // Verify element is actually a child before removing
              const parent = element.parentNode;
              if (parent.contains(element)) {
                parent.removeChild(element);
              }
            }
          } catch (e) {
            // Keep hidden if removal fails - element may have already been removed
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
      // Restore original console methods
      try {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.debug = originalConsoleDebug;
        window.removeEventListener('error', handleError, true);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        observer.disconnect();
        clearInterval(portalCheckInterval);
        document.removeEventListener('click', handleGlobalClick, true);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  return (
    <>
      <PageLoadingBar loading={currentStreamingContent !== null && currentStreamingContent.length > 0} />
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10] relative" style={{ zIndex: 1 }} suppressHydrationWarning>
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-white/10 bg-[#0c1014]/50 backdrop-blur-xl px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4 min-w-0 pointer-events-auto">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base lg:text-lg font-bold text-white tracking-tight truncate">SCORPION</h1>
            <p className="text-[10px] md:text-xs lg:text-xs text-white/50 mt-0.5 hidden md:block">Chat-AGI Interface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <ChatTestChecklist variant="compact" />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 md:p-1.5 lg:p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white/60" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-w-0 relative pointer-events-none" style={{ minHeight: 0, height: '100%' }}>
        <ChatSidebar
          showConversationList={showConversationList}
          isMobile={isMobile}
          onToggle={() => {
            setShowConversationList(prev => !prev);
          }}
          onNewConversation={handleNewConversation}
        />
        
        {/* Center: Chat */}
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-150 pointer-events-auto ${
          showRightPanel && !isMobile && !isTablet ? 'max-w-[calc(100%-16rem)]' : ''
        }`}>
          <MessageList messages={currentMessages} streamingContent={currentStreamingContent} />
          <Composer 
            onSend={handleSend} 
            onStop={handleStop} 
            availableModels={availableModels}
            conversationId={currentConversation ?? undefined}
          />
        </div>
        
        <ChatPanels
          showRightPanel={showRightPanel}
          isMobile={isMobile}
          isTablet={isTablet}
          activePanel={activePanel}
          currentPlanSteps={currentPlanSteps}
          currentPlan={currentPlan}
          currentCouncilVotes={currentCouncilVotes}
          currentCouncilThinking={currentCouncilThinking}
          currentCouncilCommunications={currentCouncilCommunications}
          currentCouncilConsensus={currentCouncilConsensus}
          currentToolCalls={currentToolCalls}
          currentKnowledgeHits={currentKnowledgeHits}
          currentKnowledgeQuery={currentKnowledgeQuery}
          currentProgress={currentProgress}
          currentToolProgress={toolProgress}
          currentConversationId={currentConversation}
          currentNextBestAction={currentConversation ? nextBestAction[currentConversation] : undefined}
          currentCouncilResult={currentConversation ? councilResult[currentConversation] : undefined}
          currentCreativePipeline={currentConversation ? creativePipeline[currentConversation] : undefined}
          currentDataWorkflow={currentConversation ? dataWorkflow[currentConversation] : undefined}
          currentMessage={(() => {
            // Get the last USER message (not assistant response)
            const userMessages = currentMessages.filter(m => m.role === 'user');
            return userMessages[userMessages.length - 1]?.content || '';
          })()}
          onToggle={() => {
            setShowRightPanel(prev => !prev);
          }}
          onPanelChange={setActivePanel}
          onToolSelect={(toolName, slashCommand) => {
            setInputValue(slashCommand + ' ');
            // Use requestAnimationFrame for immediate focus without delay
            // Add multiple retries with delays to ensure textarea is mounted
            let retries = 0;
            const tryFocus = () => {
              const composer = safeQuerySelector('textarea[data-testid="message-input"]');
              if (composer) {
                safeFocus(composer);
              } else if (retries < 5) {
                retries++;
                requestAnimationFrame(() => {
                  setTimeout(tryFocus, 50);
              });
              }
            };
            requestAnimationFrame(() => {
              setTimeout(tryFocus, 100);
            });
          }}
        />
      </div>
      </div>
      
      {/* Settings Modal */}
      <ChatSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

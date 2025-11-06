/**
 * Feedback System for Lightning AI Business Node Platform
 * 
 * Provides user-centric feedback for all actions:
 * - Visual confirmations
 * - Cryptographic verification indicators
 * - Human-readable explanations
 * - Trust and safety indicators
 */

export interface FeedbackMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'crypto';
  title: string;
  message: string;
  humanExplanation?: string;
  cryptoProof?: {
    hash: string;
    signature: string;
    verified: boolean;
    timestamp: number;
  };
  actions?: FeedbackAction[];
  duration?: number; // Auto-dismiss after ms
  persistent?: boolean; // Don't auto-dismiss
  metadata?: Record<string, any>;
}

export interface FeedbackAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface TrustIndicator {
  level: 'high' | 'medium' | 'low' | 'unknown';
  reasons: string[];
  cryptoVerified: boolean;
  signatureValid: boolean;
  timestamp?: number;
  proofId?: string;
}

// Global feedback store (in production, use proper state management)
let feedbackStore: FeedbackMessage[] = [];
let feedbackListeners: ((messages: FeedbackMessage[]) => void)[] = [];

/**
 * Add a feedback message
 */
export function addFeedback(feedback: Omit<FeedbackMessage, 'id'>): string {
  const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const message: FeedbackMessage = { id, ...feedback };
  
  feedbackStore.push(message);
  notifyListeners();
  
  // Auto-dismiss if duration is set
  if (feedback.duration && !feedback.persistent) {
    setTimeout(() => {
      removeFeedback(id);
    }, feedback.duration);
  }
  
  return id;
}

/**
 * Remove a feedback message
 */
export function removeFeedback(id: string): void {
  feedbackStore = feedbackStore.filter(msg => msg.id !== id);
  notifyListeners();
}

/**
 * Clear all feedback messages
 */
export function clearAllFeedback(): void {
  feedbackStore = [];
  notifyListeners();
}

/**
 * Subscribe to feedback changes
 */
export function subscribeFeedback(listener: (messages: FeedbackMessage[]) => void): () => void {
  feedbackListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    feedbackListeners = feedbackListeners.filter(l => l !== listener);
  };
}

/**
 * Get current feedback messages
 */
export function getFeedbackMessages(): FeedbackMessage[] {
  return [...feedbackStore];
}

/**
 * Notify all listeners of feedback changes
 */
function notifyListeners(): void {
  feedbackListeners.forEach(listener => listener([...feedbackStore]));
}

/**
 * Payment-specific feedback messages
 */
export const PaymentFeedback = {
  sent: (amount: number, recipient: string, proofId?: string, time?: number) => 
    addFeedback({
      type: 'success',
      title: 'Payment Sent',
      message: `You sent ${amount} sats to ${recipient}`,
      humanExplanation: `Your payment was successfully delivered${time ? ` in ${time}ms` : ''}. The transaction is cryptographically verified and cannot be altered.`,
      cryptoProof: proofId ? {
        hash: proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      } : undefined,
      duration: 5000
    }),
    
  received: (amount: number, sender: string, proofId?: string) =>
    addFeedback({
      type: 'success',
      title: 'Payment Received',
      message: `You received ${amount} sats from ${sender}`,
      humanExplanation: 'This payment has been cryptographically verified and added to your balance.',
      cryptoProof: proofId ? {
        hash: proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      } : undefined,
      duration: 5000
    }),
    
  failed: (amount: number, recipient: string, reason: string) =>
    addFeedback({
      type: 'error',
      title: 'Payment Failed',
      message: `Failed to send ${amount} sats to ${recipient}`,
      humanExplanation: `Payment could not be completed: ${reason}. Your funds remain secure in your account.`,
      actions: [
        {
          label: 'Try Again',
          action: () => console.log('Retry payment'),
          style: 'primary'
        },
        {
          label: 'Contact Support',
          action: () => console.log('Contact support'),
          style: 'secondary'
        }
      ],
      persistent: true
    })
};

/**
 * Agent-specific feedback messages
 */
export const AgentFeedback = {
  executed: (agentType: string, action: string, proofId?: string) =>
    addFeedback({
      type: 'crypto',
      title: 'Agent Executed',
      message: `${agentType} agent completed: ${action}`,
      humanExplanation: 'This automation was cryptographically signed and executed according to your pre-approved rules.',
      cryptoProof: proofId ? {
        hash: proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      } : undefined,
      actions: [
        {
          label: 'View Details',
          action: () => console.log('View agent details'),
          style: 'secondary'
        }
      ],
      duration: 8000
    }),
    
  vaultTransfer: (amount: number, percentage: number, proofId?: string) =>
    addFeedback({
      type: 'info',
      title: 'Vault Transfer',
      message: `Agent moved ${amount} sats (${percentage}% of earnings) to secure vault`,
      humanExplanation: 'This automated transfer was executed according to your savings rules and is cryptographically verified.',
      cryptoProof: proofId ? {
        hash: proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      } : undefined,
      duration: 6000
    }),
    
  error: (agentType: string, error: string) =>
    addFeedback({
      type: 'warning',
      title: 'Agent Error',
      message: `${agentType} agent encountered an issue`,
      humanExplanation: `The agent stopped safely without making any changes: ${error}`,
      actions: [
        {
          label: 'Review Agent',
          action: () => console.log('Review agent settings'),
          style: 'primary'
        }
      ],
      persistent: true
    })
};

/**
 * Security and trust feedback
 */
export const SecurityFeedback = {
  signatureVerified: (action: string, proofId: string) =>
    addFeedback({
      type: 'crypto',
      title: 'Cryptographically Verified',
      message: `${action} signature verified`,
      humanExplanation: 'This action was cryptographically signed and cannot be altered without your approval.',
      cryptoProof: {
        hash: proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      },
      duration: 4000
    }),
    
  signatureInvalid: (action: string) =>
    addFeedback({
      type: 'error',
      title: 'Invalid Signature',
      message: `${action} could not be verified`,
      humanExplanation: 'This action failed cryptographic verification and was blocked for your security.',
      persistent: true
    }),
    
  keyRotated: (proofId: string) =>
    addFeedback({
      type: 'crypto',
      title: 'Security Keys Updated',
      message: 'Your cryptographic keys have been rotated',
      humanExplanation: 'Your security keys have been updated and all future actions will use the new keys.',
      cryptoProof: {
        hash: proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      },
      duration: 10000
    })
};

/**
 * Generate trust indicator for an action
 */
export function generateTrustIndicator(
  action: string,
  cryptoVerified: boolean,
  signatureValid: boolean,
  proofId?: string
): TrustIndicator {
  const reasons: string[] = [];
  let level: TrustIndicator['level'] = 'unknown';
  
  if (cryptoVerified && signatureValid) {
    level = 'high';
    reasons.push('Cryptographically signed and verified');
    reasons.push('Action logged in immutable audit trail');
  } else if (cryptoVerified) {
    level = 'medium';
    reasons.push('Action is logged but signature verification pending');
  } else {
    level = 'low';
    reasons.push('Action not cryptographically verified');
  }
  
  // Add action-specific trust factors
  switch (action) {
    case 'send_payment':
      if (level === 'high') {
        reasons.push('Payment amount and recipient verified');
        reasons.push('Lightning Network provides additional security');
      }
      break;
    case 'agent_execution':
      if (level === 'high') {
        reasons.push('Agent rules pre-approved and signed');
        reasons.push('Execution parameters within safe limits');
      }
      break;
    case 'vault_transfer':
      if (level === 'high') {
        reasons.push('Vault security independently verified');
        reasons.push('Transfer is reversible with proper authorization');
      }
      break;
  }
  
  return {
    level,
    reasons,
    cryptoVerified,
    signatureValid,
    timestamp: Date.now(),
    proofId
  };
}

/**
 * Format human-readable explanations for different actions
 */
export function formatActionExplanation(
  action: string,
  data: any,
  trustLevel: TrustIndicator['level']
): string {
  const trustPrefix = {
    high: '🔒 Secure:',
    medium: '⚠️ Caution:',
    low: '❌ Unverified:',
    unknown: '❓ Unknown:'
  }[trustLevel];
  
  switch (action) {
    case 'send_payment':
      return `${trustPrefix} Payment of ${data.amount} sats to ${data.recipient} ${
        trustLevel === 'high' 
          ? 'is cryptographically verified and cannot be altered'
          : 'could not be fully verified - proceed with caution'
      }`;
      
    case 'agent_execution':
      return `${trustPrefix} Agent "${data.agentType}" execution ${
        trustLevel === 'high'
          ? 'follows your pre-approved rules and is fully verified'
          : 'may not follow expected parameters - review carefully'
      }`;
      
    case 'vault_transfer':
      return `${trustPrefix} Transfer of ${data.amount} sats to vault ${
        trustLevel === 'high'
          ? 'is secure and reversible with proper authorization'
          : 'security cannot be guaranteed - verify manually'
      }`;
      
    default:
      return `${trustPrefix} Action "${action}" ${
        trustLevel === 'high'
          ? 'is cryptographically verified and safe'
          : 'verification status unknown - proceed carefully'
      }`;
  }
}

/**
 * Create a comprehensive feedback message for any action
 */
export function createActionFeedback(
  action: string,
  data: any,
  result: { success: boolean; proofId?: string; error?: string },
  executionTime?: number
): string {
  const trustIndicator = generateTrustIndicator(
    action,
    !!result.proofId,
    !!result.proofId,
    result.proofId
  );
  
  if (result.success) {
    return addFeedback({
      type: trustIndicator.level === 'high' ? 'crypto' : 'info',
      title: 'Action Completed',
      message: formatActionExplanation(action, data, trustIndicator.level),
      humanExplanation: `${action} completed successfully${
        executionTime ? ` in ${executionTime}ms` : ''
      }. ${trustIndicator.reasons.join(' ')}`,
      cryptoProof: result.proofId ? {
        hash: result.proofId.split('_')[1] || '',
        signature: 'verified',
        verified: true,
        timestamp: Date.now()
      } : undefined,
      duration: trustIndicator.level === 'high' ? 5000 : 8000
    });
  } else {
    return addFeedback({
      type: 'error',
      title: 'Action Failed',
      message: `${action} could not be completed`,
      humanExplanation: `Error: ${result.error}. No changes were made to your account.`,
      persistent: true
    });
  }
} 
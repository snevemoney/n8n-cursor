/**
 * Lightning AI Platform - Signed Button Component
 * Handles cryptographic signing with animations and TrustTile integration
 */

"use client"

import React, { useState } from 'react';
import { Button, ButtonProps } from './button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { signAndExecute } from '@/core/crypto/signAndExecute';
import { logProof } from '@/core/crypto/proofLog';
import { cn } from '@/lib/utils';

export interface SignedButtonProps extends Omit<ButtonProps, 'onClick'> {
  action: string;
  payload: any;
  executor?: string;
  requireConfirmation?: boolean;
  confirmationMessage?: string;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
  showTrustTile?: boolean;
  signatureRequired?: boolean;
}

type ButtonState = 'idle' | 'confirming' | 'signing' | 'executing' | 'success' | 'error';

export function SignedButton({
  action,
  payload,
  executor = 'user',
  requireConfirmation = true,
  confirmationMessage,
  onSuccess,
  onFailure,
  showTrustTile = true,
  signatureRequired = true,
  children,
  className,
  disabled,
  ...props
}: SignedButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [error, setError] = useState<string | null>(null);

  const getButtonContent = () => {
    switch (state) {
      case 'confirming':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Confirm Action
          </motion.div>
        );
      case 'signing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing...
          </motion.div>
        );
      case 'executing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Executing...
          </motion.div>
        );
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Success
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Failed
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {showTrustTile && <Shield className="w-4 h-4" />}
            {children}
          </motion.div>
        );
    }
  };

  const getButtonVariant = () => {
    switch (state) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'signing':
      case 'executing':
        return 'secondary';
      default:
        return props.variant || 'default';
    }
  };

  const handleClick = async () => {
    try {
      setError(null);

      // Confirmation step
      if (requireConfirmation && state === 'idle') {
        setState('confirming');
        
        const message = confirmationMessage || 
          `Are you sure you want to execute "${action}"?\n\nThis action will be cryptographically signed and logged.`;
        
        const confirmed = window.confirm(message);
        
        if (!confirmed) {
          setState('idle');
          return;
        }
      }

      // Signing and execution
      setState('signing');

      let result: any;
      if (signatureRequired) {
        // Use cryptographic signing
        result = await signAndExecute(
          action, 
          payload, 
          async () => {
            // Execute the action - this is where the actual business logic would go
            return { success: true, data: payload };
          },
          { requireSignature: false, logProof: true, userId: 'user' }
        );
        
        setState('executing');
        
        // Log to proof system
        logProof({
          action,
          user_id: 'user', // This should be the actual user ID
          payload_json: JSON.stringify(payload),
          timestamp: Date.now()
        });
        
        if (showTrustTile) {
          toast.success('Action signed and executed', {
            description: `Signature: ${result?.signature?.substring(0, 16)}...`,
            action: {
              label: 'View Proof',
              onClick: () => {
                // Navigate to trust center or show proof details
                console.log('Show proof details:', result);
              }
            }
          });
        }
      } else {
        // Direct execution without signing
        setState('executing');
        result = { success: true, data: payload };
      }

      // Success state
      setState('success');
      onSuccess?.(result);

      // Reset to idle after delay
      setTimeout(() => {
        setState('idle');
      }, 2000);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      setState('error');
      onFailure?.(error);

      toast.error('Action failed', {
        description: error.message
      });

      // Reset to idle after delay
      setTimeout(() => {
        setState('idle');
        setError(null);
      }, 3000);
    }
  };

  const isDisabled = disabled || ['signing', 'executing'].includes(state);

  return (
    <div className="relative">
      <Button
        {...props}
        variant={getButtonVariant()}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          state === 'success' && 'bg-green-600 hover:bg-green-700',
          state === 'error' && 'bg-red-600 hover:bg-red-700',
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {getButtonContent()}
          </motion.div>
        </AnimatePresence>

        {/* Progress indicator for signing/executing */}
        {['signing', 'executing'].includes(state) && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-blue-400"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        )}
      </Button>

      {/* Error tooltip */}
      <AnimatePresence>
        {error && state === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-200 rounded-md text-sm text-red-700 z-10 max-w-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
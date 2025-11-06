'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackButtonsProps {
  embeddingId: string;
  onFeedback?: (embeddingId: string, value: 'yes' | 'no') => void;
  context?: {
    tutorial_id?: string;
    page_url?: string;
    tooltip_id?: string;
    source?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'inline';
  showText?: boolean;
}

export default function FeedbackButtons({
  embeddingId,
  onFeedback,
  context,
  className,
  size = 'sm',
  variant = 'default',
  showText = true
}: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendFeedback = async (value: 'yes' | 'no') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/track/feedback', {
        method: 'POST',
        body: JSON.stringify({ 
          embedding_id: embeddingId, 
          value,
          timestamp: new Date().toISOString(),
          context: {
            ...context,
            page_url: window.location.href,
            user_agent: navigator.userAgent
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setFeedback(value);
        onFeedback?.(embeddingId, value);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-7 px-2 text-xs';
      case 'md': return 'h-8 px-3 text-sm';
      case 'lg': return 'h-10 px-4 text-base';
      default: return 'h-7 px-2 text-xs';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'border-none shadow-none bg-transparent hover:bg-gray-50';
      case 'inline':
        return 'border-gray-200 bg-white hover:bg-gray-50';
      default:
        return '';
    }
  };

  if (feedback) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-gray-600",
        variant === 'inline' ? 'text-xs' : 'text-sm',
        className
      )}>
        {showText && <span>Thanks for your feedback!</span>}
        <div className="flex items-center">
          {feedback === 'yes' ? (
            <ThumbsUp className={cn(
              "text-green-600",
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          ) : (
            <ThumbsDown className={cn(
              "text-red-600",
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-red-600",
        variant === 'inline' ? 'text-xs' : 'text-sm',
        className
      )}>
        <span>{error}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setError(null)}
          className="h-auto p-1 text-gray-500 hover:text-gray-700"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2",
      variant === 'inline' ? 'text-xs' : 'text-sm',
      className
    )}>
      {showText && (
        <span className="text-gray-600">
          {variant === 'minimal' ? 'Helpful?' : 'Was this helpful?'}
        </span>
      )}
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendFeedback('yes')}
          disabled={isSubmitting}
          className={cn(
            getSizeClasses(),
            getVariantClasses(),
            "text-green-600 hover:text-green-700 hover:bg-green-50",
            isSubmitting && "opacity-50"
          )}
        >
          {isSubmitting ? (
            <Loader2 className={cn(
              "animate-spin",
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          ) : (
            <ThumbsUp className={cn(
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          )}
          {size !== 'sm' && variant !== 'minimal' && <span className="ml-1">Yes</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendFeedback('no')}
          disabled={isSubmitting}
          className={cn(
            getSizeClasses(),
            getVariantClasses(),
            "text-red-600 hover:text-red-700 hover:bg-red-50",
            isSubmitting && "opacity-50"
          )}
        >
          {isSubmitting ? (
            <Loader2 className={cn(
              "animate-spin",
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          ) : (
            <ThumbsDown className={cn(
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          )}
          {size !== 'sm' && variant !== 'minimal' && <span className="ml-1">No</span>}
        </Button>
      </div>
    </div>
  );
} 
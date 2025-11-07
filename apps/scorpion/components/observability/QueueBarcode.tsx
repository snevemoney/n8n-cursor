'use client';

import { useEffect, useRef } from 'react';
import type { DomainEvent } from '@/lib/telemetry/schema';

interface QueueBarcodeProps {
  events: DomainEvent[];
  queue: string;
  width?: number;
  height?: number;
}

/**
 * QueueBarcode - Tiny canvas showing success/error stripes per minute
 */
export function QueueBarcode({ events, queue, width = 120, height = 20 }: QueueBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Filter events for this queue in last hour
    const now = Date.now();
    const hourAgo = now - 3600000;
    const queueEvents = events.filter(e => 
      e.ts >= hourAgo && 
      (e.type === 'job.completed' || e.type === 'job.failed') &&
      'queue' in e && e.queue === queue
    );
    
    if (queueEvents.length === 0) {
      // No data
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(0, 0, width, height);
      return;
    }
    
    // Group by minute
    const minutes = 60;
    const minuteWidth = width / minutes;
    const buckets = new Array(minutes).fill(0).map(() => ({ success: 0, error: 0 }));
    
    queueEvents.forEach(event => {
      const minuteIndex = Math.floor((now - event.ts) / 60000);
      if (minuteIndex >= 0 && minuteIndex < minutes) {
        const bucket = buckets[minutes - 1 - minuteIndex];
        if (event.type === 'job.completed') {
          bucket.success++;
        } else {
          bucket.error++;
        }
      }
    });
    
    // Draw stripes
    buckets.forEach((bucket, i) => {
      const x = i * minuteWidth;
      const total = bucket.success + bucket.error;
      
      if (total === 0) {
        // No activity
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(x, 0, minuteWidth, height);
      } else {
        const errorRatio = bucket.error / total;
        
        if (errorRatio === 0) {
          // All success
          ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'; // emerald
        } else if (errorRatio >= 0.5) {
          // High error rate
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // red
        } else {
          // Some errors
          ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'; // yellow
        }
        
        ctx.fillRect(x, 0, minuteWidth, height);
      }
    });
  }, [events, queue, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded"
      title={`${queue} queue activity (last hour)`}
    />
  );
}


/**
 * Distributed Tracing System
 * Simple tracing implementation for request tracking
 * Can be extended to export to Jaeger/Zipkin/OpenTelemetry Collector
 */

export interface Span {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: number; message: string; fields?: Record<string, any> }>;
  children: Span[];
}

class Tracer {
  private spans: Map<string, Span> = new Map();
  private activeSpans: string[] = [];

  /**
   * Start a new span
   */
  startSpan(name: string, tags: Record<string, string> = {}): string {
    const spanId = `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const span: Span = {
      id: spanId,
      name,
      startTime: Date.now(),
      tags,
      logs: [],
      children: []
    };

    this.spans.set(spanId, span);

    // If there's an active span, add this as a child
    if (this.activeSpans.length > 0) {
      const parentId = this.activeSpans[this.activeSpans.length - 1];
      const parent = this.spans.get(parentId);
      if (parent) {
        parent.children.push(span);
      }
    }

    this.activeSpans.push(spanId);
    return spanId;
  }

  /**
   * End a span
   */
  endSpan(spanId: string): void {
    const span = this.spans.get(spanId);
    if (!span) {
      console.warn(`Span ${spanId} not found`);
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;

    // Remove from active spans
    const index = this.activeSpans.indexOf(spanId);
    if (index > -1) {
      this.activeSpans.splice(index, 1);
    }
  }

  /**
   * Add a log entry to a span
   */
  log(spanId: string, message: string, fields?: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (!span) {
      console.warn(`Span ${spanId} not found`);
      return;
    }

    span.logs.push({
      timestamp: Date.now(),
      message,
      fields
    });
  }

  /**
   * Add a tag to a span
   */
  setTag(spanId: string, key: string, value: string): void {
    const span = this.spans.get(spanId);
    if (!span) {
      console.warn(`Span ${spanId} not found`);
      return;
    }

    span.tags[key] = value;
  }

  /**
   * Get current active span
   */
  getActiveSpan(): string | null {
    return this.activeSpans.length > 0 ? this.activeSpans[this.activeSpans.length - 1] : null;
  }

  /**
   * Get span by ID
   */
  getSpan(spanId: string): Span | undefined {
    return this.spans.get(spanId);
  }

  /**
   * Get all root spans (spans without parents)
   */
  getRootSpans(): Span[] {
    const rootSpans: Span[] = [];
    for (const span of this.spans.values()) {
      // Check if this span is a child of any other span
      let isChild = false;
      for (const otherSpan of this.spans.values()) {
        if (otherSpan.children.includes(span)) {
          isChild = true;
          break;
        }
      }
      if (!isChild) {
        rootSpans.push(span);
      }
    }
    return rootSpans;
  }

  /**
   * Export traces in a simple format (can be extended to OpenTelemetry format)
   */
  exportTraces(): any[] {
    const rootSpans = this.getRootSpans();
    return rootSpans.map(span => this.exportSpan(span));
  }

  private exportSpan(span: Span): any {
    return {
      id: span.id,
      name: span.name,
      startTime: span.startTime,
      endTime: span.endTime,
      duration: span.duration,
      tags: span.tags,
      logs: span.logs,
      children: span.children.map(child => this.exportSpan(child))
    };
  }

  /**
   * Clear all spans (for memory management)
   */
  clear(): void {
    this.spans.clear();
    this.activeSpans = [];
  }
}

// Singleton instance
let tracer: Tracer | null = null;

export function getTracer(): Tracer {
  if (!tracer) {
    tracer = new Tracer();
  }
  return tracer;
}

/**
 * Trace a function execution
 */
export async function trace<T>(
  name: string,
  fn: (spanId: string) => Promise<T>,
  tags: Record<string, string> = {}
): Promise<T> {
  const t = getTracer();
  const spanId = t.startSpan(name, tags);
  
  try {
    const result = await fn(spanId);
    t.endSpan(spanId);
    return result;
  } catch (error: any) {
    t.setTag(spanId, 'error', 'true');
    t.log(spanId, error.message, { error: error.message, stack: error.stack });
    t.endSpan(spanId);
    throw error;
  }
}


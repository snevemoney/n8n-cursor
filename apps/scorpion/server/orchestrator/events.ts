import { ChatEvent } from '../types/events';

type Emit = (e: ChatEvent) => void;

// Use per-connection emitter; below is a simple wrapper
// Power of 10 Rule 5: Typed response parameter
export function sseEmit(res: { write: (chunk: string) => void }): Emit {
  return (e) => {
    res.write(`event: ${e.type}\n`);
    res.write(`data: ${JSON.stringify(e)}\n\n`);
  };
}


/**
 * State snapshot utilities for "Copy Snapshot Link"
 * Serializes time window + filters to URL
 */

export interface Snapshot {
  from: number;
  to: number;
  live: boolean;
  focus?: {
    agentId?: string;
    nodeId?: string;
    workflowId?: string;
  };
  filters?: {
    levels?: string[];
    search?: string;
  };
}

/**
 * Serialize snapshot to URL params
 */
export function serializeSnapshot(snapshot: Snapshot): string {
  const params = new URLSearchParams();
  
  params.set('from', snapshot.from.toString());
  params.set('to', snapshot.to.toString());
  params.set('live', snapshot.live ? '1' : '0');
  
  if (snapshot.focus) {
    if (snapshot.focus.agentId) params.set('agent', snapshot.focus.agentId);
    if (snapshot.focus.nodeId) params.set('node', snapshot.focus.nodeId);
    if (snapshot.focus.workflowId) params.set('workflow', snapshot.focus.workflowId);
  }
  
  if (snapshot.filters) {
    if (snapshot.filters.levels) {
      params.set('levels', snapshot.filters.levels.join(','));
    }
    if (snapshot.filters.search) {
      params.set('search', snapshot.filters.search);
    }
  }
  
  return params.toString();
}

/**
 * Deserialize snapshot from URL params
 */
export function deserializeSnapshot(search: string): Snapshot | null {
  try {
    const params = new URLSearchParams(search);
    
    const from = params.get('from');
    const to = params.get('to');
    
    if (!from || !to) return null;
    
    const snapshot: Snapshot = {
      from: parseInt(from),
      to: parseInt(to),
      live: params.get('live') === '1',
    };
    
    const agentId = params.get('agent');
    const nodeId = params.get('node');
    const workflowId = params.get('workflow');
    
    if (agentId || nodeId || workflowId) {
      snapshot.focus = { agentId: agentId || undefined, nodeId: nodeId || undefined, workflowId: workflowId || undefined };
    }
    
    const levels = params.get('levels');
    const searchTerm = params.get('search');
    
    if (levels || searchTerm) {
      snapshot.filters = {
        levels: levels ? levels.split(',') : undefined,
        search: searchTerm || undefined,
      };
    }
    
    return snapshot;
  } catch (error) {
    console.error('Failed to deserialize snapshot:', error);
    return null;
  }
}

/**
 * Copy snapshot link to clipboard
 */
export async function copySnapshotLink(snapshot: Snapshot): Promise<boolean> {
  try {
    const params = serializeSnapshot(snapshot);
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy snapshot link:', error);
    return false;
  }
}


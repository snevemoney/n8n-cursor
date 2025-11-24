/**
 * File Tracking Service
 * Tracks files uploaded via knowledge base, accessed via code.readFile, and mentioned in conversations
 */

export interface FileMetadata {
  path: string;
  timestamp: number;
  source: 'upload' | 'read' | 'mentioned';
  contentType?: string;
  size?: number;
  contentPreview?: string;
  conversationId?: string;
  knowledgeBaseId?: string; // ID in knowledge base (for uploaded files)
}

class FileTracker {
  private files: Map<string, FileMetadata[]> = new Map();
  private maxFilesPerPath = 50; // Keep last 50 accesses per file path

  /**
   * Track a file access/upload
   */
  trackFile(metadata: FileMetadata): void {
    const { path } = metadata;
    if (!this.files.has(path)) {
      this.files.set(path, []);
    }
    
    const entries = this.files.get(path)!;
    entries.push({
      ...metadata,
      timestamp: Date.now(),
    });
    
    // Keep only the most recent entries
    if (entries.length > this.maxFilesPerPath) {
      entries.shift();
    }
  }

  /**
   * Get recent files (all sources combined, sorted by timestamp)
   */
  getRecentFiles(limit: number = 20): FileMetadata[] {
    const allFiles: FileMetadata[] = [];
    
    for (const entries of this.files.values()) {
      allFiles.push(...entries);
    }
    
    return allFiles
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get recent files by source
   */
  getRecentFilesBySource(source: FileMetadata['source'], limit: number = 20): FileMetadata[] {
    return this.getRecentFiles(limit * 2)
      .filter(file => file.source === source)
      .slice(0, limit);
  }

  /**
   * Get files accessed in a specific conversation
   */
  getFilesByConversation(conversationId: string): FileMetadata[] {
    const allFiles: FileMetadata[] = [];
    
    for (const entries of this.files.values()) {
      allFiles.push(...entries.filter(f => f.conversationId === conversationId));
    }
    
    return allFiles.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get file history for a specific path
   */
  getFileHistory(path: string): FileMetadata[] {
    return this.files.get(path) || [];
  }

  /**
   * Check if a file was recently accessed
   */
  wasRecentlyAccessed(path: string, maxAgeMs: number = 3600000): boolean {
    const history = this.getFileHistory(path);
    if (history.length === 0) return false;
    
    const mostRecent = history[history.length - 1];
    return Date.now() - mostRecent.timestamp < maxAgeMs;
  }

  /**
   * Clear old entries (older than specified age)
   */
  clearOldEntries(maxAgeMs: number = 86400000): void {
    const now = Date.now();
    
    for (const [path, entries] of this.files.entries()) {
      const filtered = entries.filter(entry => now - entry.timestamp < maxAgeMs);
      
      if (filtered.length === 0) {
        this.files.delete(path);
      } else {
        this.files.set(path, filtered);
      }
    }
  }

  /**
   * Get context string for planner prompt
   */
  getContextForPlanner(conversationId?: string, limit: number = 10): string {
    const recentFiles = conversationId 
      ? this.getFilesByConversation(conversationId)
      : this.getRecentFiles(limit);
    
    if (recentFiles.length === 0) {
      return '';
    }
    
    const lines = ['\n=== RECENTLY ACCESSED/UPLOADED FILES ==='];
    
    recentFiles.slice(0, limit).forEach((file, index) => {
      const age = Math.floor((Date.now() - file.timestamp) / 1000 / 60); // minutes ago
      const sourceLabel = file.source === 'upload' ? '📤 Uploaded' 
        : file.source === 'read' ? '📖 Read'
        : '💬 Mentioned';
      
      lines.push(`${index + 1}. ${sourceLabel} ${age}m ago: ${file.path}`);
      if (file.contentPreview) {
        lines.push(`   Preview: ${file.contentPreview.substring(0, 100)}...`);
      }
    });
    
    lines.push('=== END RECENT FILES ===\n');
    
    return lines.join('\n');
  }
}

// Singleton instance
let trackerInstance: FileTracker | null = null;

export function getFileTracker(): FileTracker {
  if (!trackerInstance) {
    trackerInstance = new FileTracker();
    // Clean up old entries every hour
    setInterval(() => {
      trackerInstance?.clearOldEntries();
    }, 3600000);
  }
  return trackerInstance;
}


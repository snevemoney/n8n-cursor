import { z } from 'zod';
import { getFileTracker } from '../file-tracker';

export const name = 'files.recent';
export const label = 'Get Recent Files';
export const description = 'Get recently uploaded or accessed files with metadata';

export const schema = z.object({
  limit: z.number().optional().default(20).describe('Maximum number of files to return'),
  source: z.enum(['upload', 'read', 'mentioned', 'all']).optional().default('all').describe('Filter by source type'),
  conversationId: z.string().optional().describe('Filter by conversation ID'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const tracker = getFileTracker();
    
    let files;
    if (args.conversationId) {
      files = tracker.getFilesByConversation(args.conversationId);
    } else if (args.source === 'all') {
      files = tracker.getRecentFiles(args.limit);
    } else {
      files = tracker.getRecentFilesBySource(args.source, args.limit);
    }
    
    return {
      ok: true,
      files: files.map(file => ({
        path: file.path,
        timestamp: file.timestamp,
        source: file.source,
        contentType: file.contentType,
        size: file.size,
        contentPreview: file.contentPreview,
        ageMinutes: Math.floor((Date.now() - file.timestamp) / 1000 / 60),
        knowledgeBaseId: file.knowledgeBaseId, // Include knowledge base ID if available
        isImage: file.contentType === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.path),
      })),
      total: files.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get recent files',
    };
  }
}


/**
 * Conversation Ingester
 * Extracts conversations from Cursor chat and stores them as knowledge
 */

import { ExtractedKnowledge } from './types';
import fs from 'fs/promises';
import path from 'path';

export interface ConversationData {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    ts: number;
  }>;
}

export class ConversationIngester {
  private workspaceRoot: string;
  private conversationsPath: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    // Use workspaceRoot but ensure it matches API path
    // The API uses process.cwd(), so we should too for consistency
    this.conversationsPath = path.join(workspaceRoot, '.scorpion', 'conversations');
  }

  /**
   * Extract conversation knowledge
   */
  async extractConversationKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Try to read conversations from the shared storage
      const conversations = await this.loadConversations();
      
      for (const conv of conversations) {
        if (!conv.messages || conv.messages.length === 0) continue;

        // Extract key topics and decisions from conversation
        const userMessages = conv.messages.filter(m => m.role === 'user');
        const assistantMessages = conv.messages.filter(m => m.role === 'assistant');
        
        // Create knowledge entry for the conversation
        const conversationText = conv.messages
          .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n\n');

        // Extract patterns and topics
        const topics = this.extractTopics(conversationText);
        const decisions = this.extractDecisions(conversationText);

        knowledge.push({
          id: `conversation-${conv.id}`,
          source: 'cursor-chat',
          type: 'best-practice',
          category: 'conversation',
          title: `Conversation: ${conv.title || 'Untitled'}`,
          description: `Chat conversation from ${new Date(conv.createdAt).toLocaleDateString()}. Topics: ${topics.slice(0, 3).join(', ')}`,
          codeSnippets: [{
            file: `conversations/${conv.id}.json`,
            language: 'markdown',
            code: conversationText.substring(0, 5000), // Limit to 5k chars
            explanation: `Full conversation transcript`
          }],
          patterns: decisions.slice(0, 5),
          dependencies: [],
          useCases: topics.slice(0, 10),
          tags: ['conversation', 'chat', 'cursor', ...topics.slice(0, 5).map(t => t.toLowerCase().replace(/\s+/g, '-'))],
          extractedAt: new Date(conv.updatedAt).toISOString()
        });
      }
    } catch (error) {
      console.error('Error extracting conversation knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Load conversations from storage
   */
  private async loadConversations(): Promise<ConversationData[]> {
    try {
      // Try to read from shared storage file
      const storageFile = path.join(this.conversationsPath, 'conversations.json');
      const content = await fs.readFile(storageFile, 'utf-8');
      const data = JSON.parse(content);
      return data.conversations || [];
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Extract topics from conversation text
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    // Common topic patterns
    const topicPatterns = [
      { pattern: /(?:discuss|talk|about|regarding|concerning)\s+([^\.\?\!]+)/gi, name: 'discussion' },
      { pattern: /(?:fix|fixing|fixed|error|bug|issue)\s+([^\.\?\!]+)/gi, name: 'bug-fix' },
      { pattern: /(?:implement|implementing|add|adding|create|creating)\s+([^\.\?\!]+)/gi, name: 'feature' },
      { pattern: /(?:refactor|refactoring|improve|improving|optimize|optimizing)\s+([^\.\?\!]+)/gi, name: 'improvement' },
    ];

    for (const { pattern, name } of topicPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        topics.push(name);
      }
    }

    // Extract specific technologies/frameworks mentioned
    const techPatterns = [
      /(?:using|with|via)\s+(react|next\.?js|typescript|node\.?js|python|docker|n8n|ollama)/gi,
      /\b(api|database|workflow|dashboard|component|service)\b/gi
    ];

    for (const pattern of techPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        topics.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(topics)].slice(0, 10); // Limit to 10 unique topics
  }

  /**
   * Extract decisions made in conversation
   */
  private extractDecisions(text: string): string[] {
    const decisions: string[] = [];
    
    // Look for decision patterns
    const decisionPatterns = [
      /(?:decided|decide|chose|choose|going with|will use|using)\s+([^\.\?\!]+)/gi,
      /(?:should|will|going to)\s+([^\.\?\!]+)/gi,
    ];

    for (const pattern of decisionPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        decisions.push(...matches.slice(0, 5)); // Limit to 5 decisions
      }
    }

    return decisions;
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(): Promise<{
    total: number;
    totalMessages: number;
    recentConversations: number;
  }> {
    try {
      const conversations = await this.loadConversations();
      const totalMessages = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
      const recentConversations = conversations.filter(conv => {
        const daysSinceUpdate = (Date.now() - conv.updatedAt) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate <= 7; // Last 7 days
      }).length;

      return {
        total: conversations.length,
        totalMessages,
        recentConversations
      };
    } catch (error) {
      return {
        total: 0,
        totalMessages: 0,
        recentConversations: 0
      };
    }
  }
}


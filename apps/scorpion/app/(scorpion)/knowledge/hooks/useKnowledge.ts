import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/scorpion';

export interface KnowledgeItem {
  id: string;
  source: string;
  type: string;
  title: string;
  category: string;
  extracted: string;
  description?: string;
  friendlyName?: string;
  friendlyCategory?: string;
  icon?: string;
  contentUrl?: string;
  filePath?: string;
  contentType?: string;
  contentData?: any;
  codeSnippets?: Array<{ file: string; language: string; code: string; explanation: string }>;
}

export function useKnowledge() {
  const { showToast } = useToast();
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false); // Start false so component renders immediately
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoIngesting, setAutoIngesting] = useState(false);
  
  const getAutoIngestInitiated = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('knowledge-auto-ingest-initiated') === 'true';
  };
  
  const setAutoIngestInitiated = (value: boolean) => {
    if (typeof window === 'undefined') return;
    if (value) {
      sessionStorage.setItem('knowledge-auto-ingest-initiated', 'true');
    } else {
      sessionStorage.removeItem('knowledge-auto-ingest-initiated');
    }
  };

  useEffect(() => {
    setMounted(true);
    // Defer data fetch so component renders first
    // Use requestIdleCallback for better performance
    const loadData = () => {
    loadKnowledge();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 100 });
    } else {
      setTimeout(loadData, 50); // Small delay to allow initial render
    }
  }, []);

  const loadKnowledge = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased from 8s to 20s
      
      try {
        const response = await fetch('/api/project/knowledge', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          const knowledgeData = result.success && result.data 
            ? result.data.knowledge || []
            : result.knowledge || [];
          
          setKnowledge(knowledgeData);
        } else {
          const fallbackResponse = await fetch('/api/build', {
            signal: controller.signal
          });
          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            const knowledgeData = fallbackResult.success && fallbackResult.data
              ? fallbackResult.data.knowledge || []
              : fallbackResult.knowledge || [];
            setKnowledge(knowledgeData);
          } else {
            throw new Error(`API returned ${fallbackResponse.status}`);
          }
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        
        const errorMsg = fetchError.message || fetchError.toString() || '';
        const isConnectionError = 
          errorMsg.includes('ERR_CONNECTION_REFUSED') ||
          errorMsg.includes('Failed to fetch') ||
          errorMsg.includes('ECONNREFUSED') ||
          errorMsg.includes('NetworkError') ||
          fetchError.code === 'ECONNREFUSED' ||
          fetchError.cause?.code === 'ECONNREFUSED';
        
        if (isConnectionError) {
          throw new Error('Cannot connect to the server. Make sure the Next.js dev server is running: `cd apps/scorpion && pnpm dev`');
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Failed to load knowledge:', error);
      
      let errorMessage = error.message || 'Failed to load knowledge. Please refresh the page.';
      
      if (errorMessage.includes('Cannot connect to the server') || 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server.\n\nMake sure the Next.js dev server is running:\n`cd apps/scorpion && pnpm dev`';
      }
      
      setError(errorMessage);
      showToast('error', errorMessage.split('\n')[0] || 'Failed to load knowledge');
      setKnowledge([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestAll = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setAutoIngestInitiated(false);
        showToast('info', 'Starting full knowledge ingestion... This may take a minute.');
        setLoading(true);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      try {
        const response = await fetch('/api/project/knowledge', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        const ingestedCount = result.data?.ingested || result.ingested || 0;
        
        if (!silent) {
          showToast('success', `Successfully ingested ${ingestedCount} knowledge items!`);
        } else {
          console.log(`Auto-ingestion completed: ${ingestedCount} items ingested`);
        }
        
        setTimeout(() => {
          loadKnowledge();
        }, 2000);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          if (!silent) {
            throw new Error('Ingestion timed out after 2 minutes. The process may still be running in the background.');
          }
          return;
        }
        
        const errorMsg = fetchError.message || fetchError.toString() || '';
        const isConnectionError = 
          errorMsg.includes('ERR_CONNECTION_REFUSED') ||
          errorMsg.includes('Failed to fetch') ||
          errorMsg.includes('ECONNREFUSED') ||
          errorMsg.includes('NetworkError') ||
          fetchError.code === 'ECONNREFUSED' ||
          fetchError.cause?.code === 'ECONNREFUSED';
        
        if (isConnectionError) {
          if (!silent) {
            throw new Error('Cannot connect to the server. Make sure the Next.js dev server is running: `cd apps/scorpion && pnpm dev`');
          }
          return;
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Ingestion failed:', error);
      if (!silent) {
        const errorMessage = error.message || 'Failed to ingest knowledge. Please check server logs.';
        showToast('error', errorMessage);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleIngestAndRefresh = async () => {
    try {
      setAutoIngesting(true);
      await handleIngestAll(false);
      await loadKnowledge();
    } catch (err) {
      console.error('Ingestion failed:', err);
      showToast('error', 'Failed to ingest knowledge');
    } finally {
      setAutoIngesting(false);
    }
  };

  const handleExtract = async (item: KnowledgeItem) => {
    try {
      showToast('info', 'Starting content extraction...');
      const response = await fetch('/api/project/knowledge/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, source: item.source })
      });
      
      if (response.ok) {
        showToast('success', 'Content extraction started! Knowledge base will be updated.');
        await loadKnowledge();
      } else {
        throw new Error('Extraction failed');
      }
    } catch (error) {
      console.error('Extract failed:', error);
      showToast('error', 'Failed to extract content. Please try again.');
    }
  };

  return {
    knowledge,
    loading,
    mounted,
    error,
    autoIngesting,
    loadKnowledge,
    handleIngestAll,
    handleIngestAndRefresh,
    handleExtract,
    getAutoIngestInitiated,
    setAutoIngestInitiated,
  };
}


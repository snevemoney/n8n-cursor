'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Panel, DataTable, useToast, PageLoadingBar } from '@/components/scorpion';
import { LoadingState } from '@/components/scorpion/LoadingState';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore - ESM import path
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface KnowledgeItem {
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

export default function KnowledgePage() {
  const { showToast } = useToast();
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [autoIngesting, setAutoIngesting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [contentType, setContentType] = useState<string>('text');
  const [contentData, setContentData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Use sessionStorage to prevent duplicate auto-ingestion across component instances
  // (handles React StrictMode creating multiple component instances)
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

  // Define loadKnowledge before useEffect that uses it
  const loadKnowledge = useCallback(async (preventAutoIngest: boolean = false) => {
    setError(null);
    // Only show loading spinner on initial load, not on refresh
    if (knowledge.length === 0) {
      setLoading(true);
    }
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout (increased from 8s)
      
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
          // Try fallback API
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
        
        // Check for connection errors
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
      
      // Provide helpful error message for connection errors
      let errorMessage = error.message || 'Failed to load knowledge. Please refresh the page.';
      
      if (errorMessage.includes('Cannot connect to the server') || 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server.\n\nMake sure the Next.js dev server is running:\n`cd apps/scorpion && pnpm dev`';
      }
      
      setError(errorMessage);
      showToast('error', errorMessage.split('\n')[0] || 'Failed to load knowledge');
      // Set empty array so page can still render
      setKnowledge([]);
    } finally {
      setLoading(false);
    }
  }, [knowledge.length, showToast]);

  // Define all handler functions before they're used in callbacks
  // These must be defined before the callbacks that reference them
  
  const handleViewFull = async (item: KnowledgeItem) => {
    try {
      // Load full content from API
      const response = await fetch(`/api/knowledge/${item.id}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        
        // Update selected item with full content
        setSelected({
          ...item,
          description: data.content || data.description || item.description,
          contentData: {
            content: data.content || data.description || item.description,
            ...data.metadata
          }
        });
        
        // Set content type based on what we have
        if (data.metadata?.codeSnippets && data.metadata.codeSnippets.length > 0) {
          setContentType('code');
          setContentData({ snippets: data.metadata.codeSnippets });
        } else {
          setContentType('text');
          setContentData({ content: data.content || data.description || item.description });
        }
      } else {
        // Fallback: just select the item
        setSelected(item);
        setContentType('text');
        setContentData({ content: item.description || item.extracted });
      }
    } catch (error) {
      console.error('Failed to load full content:', error);
      // Fallback: just select the item
      setSelected(item);
      setContentType('text');
      setContentData({ content: item.description || item.extracted });
      showToast('warning', 'Could not load full content, showing available preview');
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
        await loadKnowledge(); // Refresh
      } else {
        throw new Error('Extraction failed');
      }
    } catch (error) {
      console.error('Extract failed:', error);
      showToast('error', 'Failed to extract content. Please try again.');
    }
  };

  // Detect content type and load content
  const detectAndLoadContent = useCallback(async (item: KnowledgeItem) => {
    setPdfPage(1);
    setPdfTotalPages(0);
    
    // Check if item has a URL or file path - prioritize filePath for n8n-cursor items
    const url = item.filePath || item.contentUrl || item.id;
    const description = item.description || '';
    const extracted = item.extracted || '';
    
    // Detect content type
    let detectedType = 'text';
    let data = null;
    
    // Check for PDF
    if (url.toLowerCase().endsWith('.pdf') || 
        description.toLowerCase().includes('.pdf') ||
        item.category?.toLowerCase().includes('pdf')) {
      detectedType = 'pdf';
      // Try to load PDF
      try {
        // For now, we'll use a placeholder - in production, you'd fetch the actual PDF
        setPdfTotalPages(100); // Placeholder - would be determined from actual PDF
        data = { url, type: 'pdf' };
      } catch (error) {
        console.error('Failed to load PDF:', error);
      }
    }
    // Check for images (including data URLs for uploaded images)
    else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
             description.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
             url.startsWith('data:image/') ||
             item.contentUrl?.startsWith('data:image/')) {
      detectedType = 'image';
      // Use contentUrl if it's a data URL, otherwise use url
      const imageUrl = item.contentUrl?.startsWith('data:image/') ? item.contentUrl : url;
      data = { url: imageUrl, alt: item.title };
    }
    // Check for videos
    else if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
             description.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
             url.includes('youtube.com') || url.includes('youtu.be') ||
             url.includes('vimeo.com')) {
      detectedType = 'video';
      data = { url, title: item.title };
    }
    // Check for code files
    else if (url.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|cc|h|hpp|cs|php|rb|go|rs|swift|kt|scala|sh|bash|zsh|fish|ps1|sql|html|css|scss|sass|less|json|xml|yaml|yml|toml|ini|conf|md|markdown|vue|svelte|dart|r|m|mm|pl|pm|ex|exs|elm|clj|cljs|hs|lua|vim|diff|patch)$/i) ||
             description.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|cc|h|hpp|cs|php|rb|go|rs|swift|kt|scala|sh|bash|zsh|fish|ps1|sql|html|css|scss|sass|less|json|xml|yaml|yml|toml|ini|conf|md|markdown|vue|svelte|dart|r|m|mm|pl|pm|ex|exs|elm|clj|cljs|hs|lua|vim|diff|patch)$/i) ||
             item.codeSnippets && item.codeSnippets.length > 0) {
      detectedType = 'code';
      // Extract language from file extension
      const getLanguageFromExtension = (filePath: string): string => {
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
        const langMap: Record<string, string> = {
          'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
          'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cc': 'cpp', 'h': 'c', 'hpp': 'cpp',
          'cs': 'csharp', 'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'swift': 'swift',
          'kt': 'kotlin', 'scala': 'scala', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash', 'fish': 'bash',
          'ps1': 'powershell', 'sql': 'sql', 'html': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'sass',
          'less': 'less', 'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'toml': 'toml',
          'ini': 'ini', 'conf': 'ini', 'md': 'markdown', 'markdown': 'markdown', 'vue': 'vue',
          'svelte': 'javascript', 'dart': 'dart', 'r': 'r', 'm': 'objectivec', 'mm': 'objectivec',
          'pl': 'perl', 'pm': 'perl', 'ex': 'elixir', 'exs': 'elixir', 'elm': 'elm', 'clj': 'clojure',
          'cljs': 'clojure', 'hs': 'haskell', 'lua': 'lua', 'vim': 'vim', 'diff': 'diff', 'patch': 'diff'
        };
        return langMap[ext] || 'text';
      };
      
      const language = getLanguageFromExtension(url);
      const content = description || extracted || '';
      
      // If we have code snippets from the item, use those
      if (item.codeSnippets && item.codeSnippets.length > 0) {
        data = { 
          snippets: item.codeSnippets,
          language: item.codeSnippets[0]?.language || language 
        };
      } else {
        data = { 
          content: content || 'No code content available',
          language: language,
          filePath: url
        };
      }
    }
    // Check for sheets/CSV
    else if (url.toLowerCase().endsWith('.csv') || 
             url.toLowerCase().endsWith('.xlsx') ||
             url.toLowerCase().endsWith('.xls') ||
             description.toLowerCase().includes('csv') ||
             description.toLowerCase().includes('spreadsheet') ||
             item.category?.toLowerCase().includes('sheet')) {
      detectedType = 'sheet';
      // Try to parse CSV data from description or fetch
      try {
        if (description.includes(',') && description.split('\n').length > 1) {
          const lines = description.split('\n').slice(0, 100); // Limit to 100 rows for preview
          const headers = lines[0]?.split(',') || [];
          const rows = lines.slice(1).map(line => line.split(','));
          data = { headers, rows, totalRows: description.split('\n').length - 1 };
        } else {
          data = { url, type: 'csv' };
        }
      } catch (error) {
        console.error('Failed to parse sheet data:', error);
        data = { url, type: 'sheet' };
      }
    }
    // Default to text
    else {
      detectedType = 'text';
      data = { content: description || extracted || 'No content available' };
    }
    
    setContentType(detectedType);
    setContentData(data);
  }, []);

  // Handle item selection
  const handleItemSelect = useCallback((item: KnowledgeItem) => {
    setSelected(item);
    detectAndLoadContent(item);
  }, [detectAndLoadContent]);

  const handleExport = useCallback(async (item: KnowledgeItem) => {
    // Check governance before export
    const { checkAccess } = await import('@/lib/governance/client');
    const accessCheck = await checkAccess({
      action: 'export',
      resourceType: 'rag_document',
      resourceId: item.id,
    });

    if (!accessCheck.allowed) {
      showToast('error', 'Export denied by governance policy');
      return;
    }

    // Export as JSON
    const dataStr = JSON.stringify(item, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-${item.id}.json`;
    link.click();
  }, []);

  const handleIngestAll = async (silent: boolean = false) => {
    try {
      if (!silent) {
        // Reset the sessionStorage flag for manual ingestion
        setAutoIngestInitiated(false);
        showToast('info', 'Starting full knowledge ingestion... This may take a minute.');
        setLoading(true);
      }
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for ingestion
      
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
        
        // Refresh immediately after data is saved (without auto-ingest to avoid loops)
        // Use requestAnimationFrame for immediate refresh without artificial delay
        requestAnimationFrame(() => {
          loadKnowledge(true); // Pass true to prevent auto-ingest loop
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          if (!silent) {
            throw new Error('Ingestion timed out after 2 minutes. The process may still be running in the background.');
          }
          return; // Silent fail for auto-ingestion
        }
        
        // Check for connection errors
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
          return; // Silent fail for auto-ingestion
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

  // Now define callbacks that use the above functions
  // Handle ingestion with refresh
  const handleIngestAndRefresh = useCallback(async () => {
    try {
      setAutoIngesting(true);
      await handleIngestAll(false);
      // Refresh knowledge after ingestion
      await loadKnowledge();
    } catch (err) {
      console.error('Ingestion failed:', err);
      showToast('error', 'Failed to ingest knowledge');
    } finally {
      setAutoIngesting(false);
    }
  }, [handleIngestAll, loadKnowledge, showToast]);

  // Memoized click handlers
  const handleRetryClick = useCallback(() => {
    loadKnowledge();
  }, [loadKnowledge]);

  const handleToggleFilters = useCallback(() => {
    setFiltersOpen(prev => !prev);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSourceFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
  }, []);

  const createItemSelectHandler = useCallback((item: KnowledgeItem) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      handleItemSelect(item);
    };
  }, [handleItemSelect]);

  const handleViewFullClick = useCallback(() => {
    if (selected) {
      handleViewFull(selected);
    }
  }, [selected, handleViewFull]);

  const handlePrevPage = useCallback(() => {
    setPdfPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPdfPage(prev => Math.min(pdfTotalPages, prev + 1));
  }, [pdfTotalPages]);

  const handleExtractClick = useCallback(() => {
    if (selected) {
      handleExtract(selected);
    }
  }, [selected, handleExtract]);

  const handleExportClick = useCallback(() => {
    if (selected) {
      handleExport(selected);
    }
  }, [selected, handleExport]);

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/project/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const uploadedCount = result.data?.uploaded || result.uploaded || 0;
        const errorCount = result.data?.errors?.length || result.errors?.length || 0;
        
        if (errorCount > 0) {
          showToast('warning', `Uploaded ${uploadedCount} file(s), ${errorCount} failed`);
        } else {
          showToast('success', `Successfully uploaded ${uploadedCount} file(s)!`);
        }
        
        // Refresh knowledge list
        await loadKnowledge(true); // Prevent auto-ingest
      } else {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      showToast('error', error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [loadKnowledge, showToast]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  useEffect(() => {
    setMounted(true);
    // Defer data fetch aggressively so page renders instantly
    // Don't include callbacks in deps to prevent re-render loops
    const loadData = () => {
      loadKnowledge();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - callback is stable, don't recreate effect

  // Utility function to generate friendly names from IDs - memoized to prevent recreation
  const getFriendlyName = useCallback((id: string, type: string, title: string, description?: string): string => {
    // If title exists and is not just the ID, use it
    if (title && title !== id && title.length > 3) {
      return title;
    }
    
    // Handle n8n-cursor items
    if (id.startsWith('n8n-cursor-')) {
      const parts = id.replace('n8n-cursor-', '').split('-');
      if (parts[0] === 'overview') return 'n8n-cursor Overview';
      if (parts[0] === 'script') return `Script: ${parts.slice(1).join(' ').replace(/\.(sh|js)$/, '')}`;
      if (parts[0] === 'tool') return `Tool: ${parts.slice(1).join(' ').replace(/\.(js|mjs)$/, '')}`;
      if (parts[0] === 'mcp') return 'MCP Server';
      if (parts[0] === 'viz') return `Visualization: ${parts.slice(1).join(' ').replace(/\.md$/, '')}`;
      if (parts[0] === 'prompt') return `AI Prompt: ${parts.slice(1).join(' ').replace(/\.md$/, '')}`;
      if (parts[0] === 'spec') return `Workflow Spec: ${parts.slice(1).join(' ').replace(/\.(yaml|yml)$/, '')}`;
      if (parts[0] === 'workflow') return 'Workflow Management Tools';
      return `n8n-cursor: ${parts.join(' ')}`;
    }
    
    // Generate friendly name from ID patterns
    if (id.startsWith('error-')) {
      const timestamp = id.match(/error-(\d+)-/)?.[1];
      if (timestamp) {
        const date = new Date(parseInt(timestamp));
        return `Error at ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      }
      return 'System Error';
    }
    
    if (id === 'mcp-status') {
      return 'MCP Tools Status';
    }
    
    if (id.startsWith('service-')) {
      const serviceName = id.replace('service-', '');
      return `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service`;
    }
    
    if (id.startsWith('mistake-')) {
      return `Mistake Pattern: ${id.replace('mistake-', '').replace(/-/g, ' ')}`;
    }
    
    if (id.startsWith('workflow-')) {
      return `Workflow: ${id.replace('workflow-', '').replace(/-/g, ' ')}`;
    }
    
    // Use description if available
    if (description && description.length > 0) {
      const firstLine = description.split('\n')[0];
      if (firstLine.length < 60) {
        return firstLine;
      }
    }
    
    // Fallback: capitalize and format ID
    return id
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .substring(0, 50);
  }, []);

  // Utility function to get friendly category name - memoized to prevent recreation
  const getFriendlyCategory = useCallback((category: string, source: string, type: string): string => {
    if (category && category !== 'undefined' && category.length > 0) {
      return category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Generate category from source/type
    if (source === 'ontology') {
      if (type === 'Error') return 'Error Tracking';
      if (type === 'Metric') return 'System Metrics';
      if (type === 'pattern') return 'Pattern Analysis';
    }
    
    return source || 'Uncategorized';
  }, []);

  // Utility function to get icon for type - already memoized
  const getTypeIcon = useCallback((type: string): string => {
    if (type === 'Error') return '⚠️';
    if (type === 'Metric') return '📊';
    if (type === 'pattern') return '🔍';
    if (type === 'architecture') return '🏗️';
    if (type === 'feature') return '✨';
    if (type === 'integration') return '🔌';
    if (type === 'best-practice') return '⭐';
    return '📄';
  }, []);

  // Enhance knowledge items with friendly names
  const displayKnowledge = useMemo(() => {
    return knowledge.map(k => ({
      ...k,
      friendlyName: getFriendlyName(k.id, k.type, k.title, k.description),
      friendlyCategory: getFriendlyCategory(k.category, k.source, k.type),
      icon: getTypeIcon(k.type),
      extracted: k.extracted || (k.description ? k.description.substring(0, 150) + (k.description.length > 150 ? '...' : '') : 'No content available')
    }));
  }, [knowledge, getFriendlyName, getFriendlyCategory, getTypeIcon]);

  // Apply filters
  const filteredKnowledge = useMemo(() => {
    return displayKnowledge.filter(item => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && item.friendlyCategory !== categoryFilter) return false;
      return true;
    });
  }, [displayKnowledge, sourceFilter, typeFilter, categoryFilter]);

  // Extract unique filter options with friendly names
  const sources = useMemo(() => ['all', ...new Set(displayKnowledge.map(k => k.source))], [displayKnowledge]);
  const types = useMemo(() => ['all', ...new Set(displayKnowledge.map(k => k.type))], [displayKnowledge]);
  const categories = useMemo(() => ['all', ...new Set(displayKnowledge.map(k => k.friendlyCategory))], [displayKnowledge]);

  // Memoize knowledge table data to prevent re-creation on every render
  const knowledgeTableData = useMemo(() => {
    return filteredKnowledge.map(k => ({
      name: (
        <div className="flex items-center gap-2">
          <span className="text-lg">{k.icon}</span>
          <div className="flex flex-col">
            <span 
              className="text-white/90 font-semibold cursor-pointer hover:text-emerald-300 transition-colors"
              onClick={createItemSelectHandler(k)}
            >
              {k.friendlyName}
            </span>
            <span className="sc-mono font-mono text-xs text-white/40">{k.id}</span>
          </div>
        </div>
      ),
      category: (
        <span className="text-white/70 text-xs font-medium px-2 py-1 bg-white/5 rounded">
          {k.friendlyCategory}
        </span>
      ),
      type: (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
          k.type === 'Error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
          k.type === 'Metric' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          k.type === 'pattern' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
          k.type === 'architecture' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
          k.type === 'feature' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
          k.type === 'integration' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
          'bg-white/10 text-white/70 border border-white/20'
        }`}>
          {k.type}
        </span>
      ),
      preview: (
        <span className="text-white/70 text-xs leading-relaxed">
          {k.extracted || 'No preview available'}
        </span>
      ),
    }));
  }, [filteredKnowledge, createItemSelectHandler]);

  // Remove the blocking check - render immediately
  // if (!mounted) {
  //   return (
  //     <div className="h-full flex items-center justify-center">
  //       <div className="flex flex-col items-center gap-3">
  //       <div className="text-sm text-white/40">Loading knowledge...</div>
  //         {error && (
  //           <div className="text-xs text-red-400 max-w-md text-center whitespace-pre-line">
  //             {error}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }
  
  // Render page structure immediately, show loading/error states inline
  
  // Show error banner if there's an error and no knowledge loaded
  const showErrorBanner = error && knowledge.length === 0;
  
  // Check if we only have ontology items (no real project knowledge)
  const hasProjectKnowledge = knowledge.some((k: KnowledgeItem) => 
    k.source !== 'ontology' && 
    k.type !== 'pattern' &&
    (k.source === 'n8n-cursor' || 
     k.source === 'workspace' || 
     k.source === 'database' || 
     k.source === 'workflow' ||
     k.source === 'documentation' ||
     k.source === 'infrastructure' ||
     k.id.startsWith('workspace-') ||
     k.id.startsWith('database-') ||
     k.id.startsWith('workflow-') ||
     k.id.startsWith('n8n-cursor-'))
  );
  
  // Show prompt to ingest if no project knowledge
  const showIngestPrompt = !hasProjectKnowledge && knowledge.length > 0 && !autoIngesting && !loading;

  const activeFiltersCount = (sourceFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  return (
    <div 
      ref={dropZoneRef}
      className="h-full max-w-[1000px] mx-auto flex flex-col md:grid md:grid-cols-[1fr_240px] gap-2 md:gap-2 p-3 overflow-y-auto min-w-0"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <PageLoadingBar loading={loading && knowledge.length === 0} />
      {/* Drag and drop overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-500/20 border-4 border-dashed border-blue-400 z-50 flex items-center justify-center">
          <div className="bg-black/90 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📁</div>
            <div className="text-xl font-semibold text-white mb-2">Drop files here to upload</div>
            <div className="text-sm text-white/70">Supported: PDF, images, code files, text documents</div>
          </div>
        </div>
      )}
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.json,.yaml,.yml,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.bash,.zsh,.fish,.ps1,.sql,.html,.css,.scss,.sass,.less,.xml,.toml,.ini,.conf,.vue,.svelte,.dart,.r,.m,.mm,.pl,.pm,.ex,.exs,.elm,.clj,.cljs,.hs,.lua,.vim,.diff,.patch,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div className="flex flex-col gap-2 min-w-0">
        {/* Error Banner */}
        {showErrorBanner && (
          <div className="bg-red-500/20 border border-red-500/30 rounded p-3 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-300 mb-1">⚠️ Error Loading Knowledge</div>
              <div className="text-xs text-red-200/80 whitespace-pre-line">{error}</div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleRetryClick}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors whitespace-nowrap"
              >
                Retry
              </button>
              <button
                onClick={handleIngestAndRefresh}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors whitespace-nowrap"
                disabled={autoIngesting}
              >
                {autoIngesting ? 'Ingesting...' : 'Ingest'}
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State Banner */}
        {loading && knowledge.length === 0 && !showErrorBanner && (
          <div className="bg-white/5 border border-white/10 rounded p-3">
            <LoadingState variant="skeleton" skeletonLines={2} text="Loading knowledge..." />
          </div>
        )}
        
        {/* Prompt to ingest if no project knowledge */}
        {showIngestPrompt && !loading && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded p-3 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold text-yellow-300 mb-1">No Project Knowledge Found</div>
              <div className="text-xs text-yellow-200/80">
                Only ontology items (errors/metrics) are available. Click below to ingest project knowledge including n8n-cursor, workspace, workflows, and more.
              </div>
            </div>
            <button
              onClick={handleIngestAndRefresh}
              className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
              disabled={autoIngesting}
            >
              {autoIngesting ? 'Ingesting...' : 'Ingest Knowledge'}
            </button>
          </div>
        )}
        
        {/* Compact Filters Bar */}
        <div className="flex items-center gap-2 flex-wrap bg-white/5 border border-white/10 rounded p-2">
          <button
            onClick={handleToggleFilters}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
          >
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                {activeFiltersCount}
              </span>
            )}
            <span className="text-white/40">{filtersOpen ? '▼' : '▶'}</span>
          </button>
          
          {(autoIngesting || loading) && (
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 text-xs text-white/60">
              <span className="animate-spin">🔄</span>
              <span>{autoIngesting ? 'Auto-ingesting...' : 'Loading...'}</span>
            </div>
          )}
          
          {!autoIngesting && !loading && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="ml-auto flex items-center gap-1.5 px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 rounded transition-colors disabled:opacity-50"
                title="Upload files from your computer"
              >
                <span>{uploading ? '⏳' : '📁'}</span>
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            <button
              onClick={handleIngestAndRefresh}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded transition-colors"
              title="Manually re-ingest all knowledge"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            </>
          )}
          
          {/* Quick filter chips */}
          {!filtersOpen && (
            <>
              {sourceFilter !== 'all' && (
                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  {sourceFilter}
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                  {typeFilter}
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded">
                  {categoryFilter}
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-xs text-white/60 hover:text-white/80"
                >
                  Clear all
                </button>
              )}
            </>
          )}
        </div>

        {/* Expandable Filters Panel */}
        {filtersOpen && (
      <Panel title="Filters">
            <div className="space-y-1">
          <div>
                <div className="sc-title mb-0.5 text-xs leading-tight">Source</div>
            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-sm px-1.5 py-0.5 text-xs h-6 focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="all">All Sources</option>
              {sources.filter(s => s !== 'all').map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div>
                <div className="sc-title mb-0.5 text-xs leading-tight">Type</div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-sm px-1.5 py-0.5 text-xs h-6 focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="all">All Types</option>
              {types.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
                <div className="sc-title mb-0.5 text-xs leading-tight">Category</div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-sm px-1.5 py-0.5 text-xs h-6 focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="pt-1 border-t border-white/10 mt-1">
                  <div className="text-xs text-white/60 leading-tight">
                    {filteredKnowledge.length} of {displayKnowledge.length}
              </div>
            </div>
          )}
        </div>
      </Panel>
        )}

        {/* Knowledge Base Table */}
      <Panel title="Knowledge Base">
        {loading ? (
          <div className="text-sm text-white/40">Loading knowledge...</div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Name', width: '220px', wrap: true },
              { key: 'category', label: 'Category', width: '140px' },
              { key: 'type', label: 'Type', width: '120px' },
              { key: 'preview', label: 'Preview', width: '300px', wrap: true },
            ]}
            data={knowledgeTableData}
          />
        )}
      </Panel>
      </div>

      <Panel title="Preview" className="md:sticky md:top-3 md:self-start md:max-h-[calc(100vh-1.5rem)] md:overflow-y-auto">
        {selected ? (
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getTypeIcon(selected.type)}</span>
                  <div>
                    <div className="text-sm font-semibold text-white/90">
                      {getFriendlyName(selected.id, selected.type, selected.title, selected.description)}
                    </div>
                    <div className="text-xs text-white/40 sc-mono font-mono mt-0.5">ID: {selected.id}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleViewFullClick}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                View Full
              </button>
            </div>
            
            <div className="text-xs text-white/60 space-y-1">
              <div><span className="text-white/40">Category:</span> {getFriendlyCategory(selected.category, selected.source, selected.type)}</div>
              <div><span className="text-white/40">Source:</span> {selected.source || 'N/A'}</div>
              <div><span className="text-white/40">Type:</span> {selected.type}</div>
            </div>

            {/* Content Preview */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="text-xs text-white/40 mb-2">Content Preview:</div>
              <div className="bg-black/30 rounded p-3 max-h-[500px] overflow-y-auto">
                {contentType === 'pdf' && contentData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">Page {pdfPage} of {pdfTotalPages}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={pdfPage === 1}
                          className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={pdfPage === pdfTotalPages}
                          className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded p-2 shadow-lg">
                      <iframe
                        src={`${contentData.url}#page=${pdfPage}`}
                        className="w-full h-[600px] border-0"
                        title={`PDF Page ${pdfPage}`}
                        onError={(e) => {
                          console.error('PDF iframe failed to load');
                        }}
                      />
                    </div>
                    <div className="text-xs text-white/50 text-center">
                      {pdfTotalPages - pdfPage} pages remaining
                    </div>
                    <div className="text-xs text-white/40 text-center mt-2">
                      <a 
                        href={contentData.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Open PDF in new tab
                      </a>
                    </div>
                  </div>
                ) : contentType === 'image' && contentData ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative group">
                    <img
                      src={contentData.url}
                      alt={contentData.alt || selected.title}
                        className="max-w-full max-h-[500px] object-contain rounded cursor-zoom-in transition-transform hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                      }}
                        onClick={() => {
                          window.open(contentData.url, '_blank');
                        }}
                      />
                    </div>
                    <div className="text-xs text-white/40 text-center">
                      <a 
                        href={contentData.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Open image in new tab
                      </a>
                    </div>
                  </div>
                ) : contentType === 'code' && contentData ? (
                  <div className="space-y-3">
                    {contentData.snippets && contentData.snippets.length > 0 ? (
                      contentData.snippets.map((snippet: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          {snippet.file && (
                            <div className="text-xs text-white/60 font-mono">
                              📄 {snippet.file}
                            </div>
                          )}
                          {snippet.explanation && (
                            <div className="text-xs text-white/50 italic mb-2">
                              {snippet.explanation}
                            </div>
                          )}
                          <div className="rounded-lg overflow-hidden border border-white/10">
                            <SyntaxHighlighter
                              language={snippet.language || contentData.language || 'text'}
                              style={vscDarkPlus}
                              PreTag="div"
                              className="!m-0 !bg-black/40"
                              customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: 'rgba(0, 0, 0, 0.4)',
                                borderRadius: '0.5rem',
                              }}
                            >
                              {snippet.code || ''}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg overflow-hidden border border-white/10">
                        <SyntaxHighlighter
                          language={contentData.language || 'text'}
                          style={vscDarkPlus}
                          PreTag="div"
                          className="!m-0 !bg-black/40"
                          customStyle={{
                            margin: 0,
                            padding: '1rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '0.5rem',
                          }}
                        >
                          {contentData.content || 'No code content available'}
                        </SyntaxHighlighter>
                      </div>
                    )}
                    {contentData.filePath && (
                      <div className="text-xs text-white/40 text-center mt-2">
                        <span className="font-mono">{contentData.filePath}</span>
                      </div>
                    )}
                  </div>
                ) : contentType === 'video' && contentData ? (
                  <div className="flex flex-col items-center">
                    {contentData.url.includes('youtube.com') || contentData.url.includes('youtu.be') ? (
                      <iframe
                        src={contentData.url.replace('youtu.be/', 'youtube.com/embed/').replace('watch?v=', 'embed/')}
                        className="w-full aspect-video rounded"
                        allowFullScreen
                        title={contentData.title || selected.title}
                      />
                    ) : contentData.url.includes('vimeo.com') ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${contentData.url.split('/').pop()}`}
                        className="w-full aspect-video rounded"
                        allowFullScreen
                        title={contentData.title || selected.title}
                      />
                    ) : (
                      <video
                        src={contentData.url}
                        controls
                        className="w-full max-h-[500px] rounded"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : contentType === 'sheet' && contentData ? (
                  <div className="overflow-x-auto">
                    {contentData.headers && contentData.rows ? (
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-white/5">
                            {contentData.headers.map((header: string, idx: number) => (
                              <th key={idx} className="border border-white/10 px-2 py-1 text-left font-semibold text-white/80">
                                {header.trim()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {contentData.rows.slice(0, 50).map((row: string[], rowIdx: number) => (
                            <tr key={rowIdx} className="hover:bg-white/5">
                              {row.map((cell: string, cellIdx: number) => (
                                <td key={cellIdx} className="border border-white/10 px-2 py-1 text-white/70">
                                  {cell.trim()}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-xs text-white/60 p-4 text-center">
                        Sheet data available at: <a href={contentData.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{contentData.url}</a>
                      </div>
                    )}
                    {contentData.totalRows && contentData.totalRows > 50 && (
                      <div className="text-xs text-white/50 mt-2 text-center">
                        Showing first 50 of {contentData.totalRows} rows
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-white/80 whitespace-pre-wrap">
                    {contentData?.content || selected.description || selected.extracted || (
                  <div className="text-xs text-white/40 italic">
                    No content available for preview.
                    <br /><br />
                    This knowledge item contains metadata only.
                    Click "View Full" to see all details or "Extract" to pull content from source.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleExtractClick}
                className="flex-1 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
              >
                Extract Full Content
              </button>
              <button
                onClick={handleExportClick}
                className="flex-1 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/40 flex flex-col items-center justify-center h-full gap-3">
            <div>Select an item to preview</div>
            <div className="text-xs text-white/30 text-center max-w-xs">
              Click on any knowledge item in the list to view its details, content preview, and available actions.
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}


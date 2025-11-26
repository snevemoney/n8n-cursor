'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useDebounce } from 'react-use';
import { 
  Search, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink, 
  Play, 
  BookOpen,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResult {
  id: string;
  type: 'tutorial' | 'loop_solution';
  title: string;
  content: string;
  similarity: number;
  metadata: any;
  actions?: Array<{
    type: 'view_tutorial' | 'run_agent' | 'open_simulator';
    label: string;
    href?: string;
    data?: any;
  }>;
}

interface VectorSearchProps {
  /** Default search type */
  defaultType?: 'tutorial' | 'error' | 'general';
  /** Context information for better results */
  context?: {
    currentPage?: string;
    errorDetails?: any;
    userLevel?: string;
  };
  /** Custom placeholder text */
  placeholder?: string;
  /** Maximum results to show */
  maxResults?: number;
  /** Show search type toggles */
  showTypeToggle?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Callback when user clicks on a result */
  onResultClick?: (result: SearchResult) => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * VectorSearch Component
 * 
 * Advanced search interface with:
 * - Real-time vector similarity search
 * - Contextual result ranking
 * - User feedback collection
 * - Auto-suggestions and corrections
 * - Multiple content types (tutorials, error solutions)
 */
export function VectorSearch({
  defaultType = 'general',
  context,
  placeholder = 'Search tutorials, solutions, and Lightning knowledge...',
  maxResults = 8,
  showTypeToggle = true,
  compact = false,
  onResultClick,
  className = '',
}: VectorSearchProps) {
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState(defaultType);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feedback state
  const [feedbackMap, setFeedbackMap] = useState<Map<string, boolean>>(new Map());
  const [feedbackText, setFeedbackText] = useState<Map<string, string>>(new Map());
  const [showFeedbackInput, setShowFeedbackInput] = useState<Map<string, boolean>>(new Map());

  // Auto-suggestions
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search
  useDebounce(
    async () => {
      if (query.length > 2) {
        await performSearch();
      } else {
        setResults([]);
        setSuggestions([]);
      }
    },
    300,
    [query, searchType]
  );

  // Auto-suggestions debounce
  useDebounce(
    async () => {
      if (query.length > 1) {
        await fetchAutoSuggestions();
      } else {
        setAutoSuggestions([]);
        setShowSuggestions(false);
      }
    },
    150,
    [query]
  );

  /**
   * Perform vector search
   */
  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vector/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          type: searchType,
          matchCount: maxResults,
          context: {
            ...context,
            currentPage: pathname,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
      setSuggestions(data.suggestions || []);
      setShowSuggestions(false);

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, maxResults, context, pathname]);

  /**
   * Fetch auto-suggestions
   */
  const fetchAutoSuggestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/vector/search?q=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await response.json();
      
      setAutoSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Auto-suggestions error:', err);
    }
  }, [query, searchType]);

  /**
   * Handle feedback submission
   */
  const handleFeedback = async (result: SearchResult, helpful: boolean, rank: number) => {
    try {
      const additionalFeedback = feedbackText.get(result.id) || '';
      
      const response = await fetch('/api/feedback/vector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryText: query,
          searchType: result.type,
          matchId: result.id,
          matchRank: rank,
          helpful,
          additionalFeedback: additionalFeedback || undefined,
          context: {
            ...context,
            currentPage: pathname,
          },
        }),
      });

      if (response.ok) {
        setFeedbackMap(prev => new Map(prev).set(result.id, helpful));
        setShowFeedbackInput(prev => new Map(prev).set(result.id, false));
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
    }
  };

  /**
   * Handle result click
   */
  const handleResultClick = (result: SearchResult) => {
    // Track interaction
    onResultClick?.(result);
    
    // Navigate if href provided
    if (result.actions?.[0]?.href) {
      window.open(result.actions[0].href, '_blank');
    }
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Input Section */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`pl-10 pr-10 ${compact ? 'h-9' : 'h-11'}`}
            onFocus={() => setShowSuggestions(autoSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Auto-suggestions Dropdown */}
        {showSuggestions && autoSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg">
            {autoSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-3 py-2 text-left hover:bg-accent text-sm flex items-center gap-2"
                onMouseDown={() => handleSuggestionClick(suggestion)}
              >
                <Search className="h-3 w-3 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Type Toggle */}
      {showTypeToggle && !compact && (
        <div className="flex gap-2 mt-3">
          {[
            { value: 'general', label: 'All', icon: Search },
            { value: 'tutorial', label: 'Tutorials', icon: BookOpen },
            { value: 'error', label: 'Solutions', icon: AlertCircle },
          ].map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={searchType === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType(value as any)}
              className="flex items-center gap-1"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              Rate results to improve quality
            </div>
          </div>

          {results.map((result, index) => (
            <Card 
              key={result.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Result Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {result.type === 'tutorial' ? (
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="font-medium text-sm truncate">
                          {result.title}
                        </span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.similarity * 100)}% match
                      </Badge>
                    </div>

                    {/* Result Content */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {result.content}
                    </p>

                    {/* Metadata */}
                    {result.metadata && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {result.metadata.category && (
                          <Badge variant="secondary" className="text-xs">
                            {result.metadata.category}
                          </Badge>
                        )}
                        {result.metadata.difficulty && (
                          <Badge variant="secondary" className="text-xs">
                            {result.metadata.difficulty}
                          </Badge>
                        )}
                        {result.metadata.errorType && (
                          <Badge variant="secondary" className="text-xs">
                            {result.metadata.errorType}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {result.actions && result.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (action.href) {
                                window.open(action.href, '_blank');
                              }
                            }}
                          >
                            {action.type === 'view_tutorial' && <BookOpen className="h-3 w-3 mr-1" />}
                            {action.type === 'run_agent' && <Play className="h-3 w-3 mr-1" />}
                            {action.type === 'open_simulator' && <ExternalLink className="h-3 w-3 mr-1" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  <div className="flex flex-col items-end gap-2">
                    {!feedbackMap.has(result.id) ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(result, true, index + 1);
                          }}
                          className="h-6 w-6 p-0"
                          title="Helpful"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFeedbackInput(prev => new Map(prev).set(result.id, true));
                          }}
                          className="h-6 w-6 p-0"
                          title="Not helpful"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {feedbackMap.get(result.id) ? (
                          <>
                            <ThumbsUp className="h-3 w-3 text-green-500" />
                            Thanks!
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="h-3 w-3 text-red-500" />
                            Noted
                          </>
                        )}
                      </div>
                    )}

                    {/* Feedback Input */}
                    {showFeedbackInput.get(result.id) && (
                      <div className="w-48" onClick={(e) => e.stopPropagation()}>
                        <Textarea
                          placeholder="Why wasn't this helpful?"
                          value={feedbackText.get(result.id) || ''}
                          onChange={(e) => {
                            setFeedbackText(prev => new Map(prev).set(result.id, e.target.value));
                          }}
                          className="text-xs h-16 mb-2"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleFeedback(result, false, index + 1)}
                            className="text-xs h-6"
                          >
                            Submit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFeedbackInput(prev => new Map(prev).set(result.id, false))}
                            className="text-xs h-6"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search Suggestions */}
      {query.length > 2 && results.length === 0 && !isLoading && suggestions.length > 0 && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Try searching for:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs"
              >
                {suggestion}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {query.length > 2 && results.length === 0 && !isLoading && !error && (
        <div className="mt-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Try different keywords or browse our tutorials directly.
          </p>
          <Button variant="outline" onClick={() => window.open('/learn/lightning', '_blank')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Browse All Tutorials
          </Button>
        </div>
      )}
    </div>
  );
}

export default VectorSearch; 
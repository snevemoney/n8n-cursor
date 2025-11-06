'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Loader2, Search, Tag } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  source: string;
  title: string;
  category: string;
  type: string;
  tags: string[];
}

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const response = await fetch('/api/build');
      if (response.ok) {
        const data = await response.json();
        setKnowledge(data.knowledge || []);
      }
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKnowledge = knowledge.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(knowledge.map(k => k.category))];
  const sources = [...new Set(knowledge.map(k => k.source))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Database className="h-8 w-8 mr-3 text-blue-400" />
              Knowledge Base
            </h1>
            <p className="text-gray-400">
              Extracted knowledge from side hustles stored in RAG
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Knowledge</h3>
            <p className="text-4xl font-bold text-white">{knowledge.length}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Sources</h3>
            <p className="text-4xl font-bold text-green-400">{sources.length}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Categories</h3>
            <p className="text-4xl font-bold text-blue-400">{categories.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Knowledge List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : filteredKnowledge.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400 mb-4">
              {knowledge.length === 0 
                ? 'No knowledge extracted yet. Extract knowledge from side hustles first.'
                : 'No knowledge matches your search criteria.'}
            </p>
            {knowledge.length === 0 && (
              <Link
                href="/build"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Extract Knowledge
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKnowledge.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">From: {item.source}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.type === 'architecture' ? 'bg-purple-500/20 text-purple-400' :
                    item.type === 'feature' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.type}
                  </span>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs text-gray-400">Category: </span>
                  <span className="text-xs font-medium text-gray-300">{item.category}</span>
                </div>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


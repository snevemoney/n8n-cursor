import { NextRequest } from 'next/server';
import { getRAGStore } from '@/lib/shared-stores';
import { createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/knowledge/recommendations - Get recommended knowledge cards and PDF bundles
 */
export async function GET(request: NextRequest) {
  try {
    const store = await getRAGStore();
    const allKnowledge = store.getAllKnowledge();
    
    if (allKnowledge.length === 0) {
      return createSuccessResponse({
        cards: [],
        bundles: [],
        message: 'No knowledge available yet'
      });
    }

    // Helper to check if document is README or doc
    const isReadme = (id: string, source: string, category: string, title: string) => {
      const idLower = id.toLowerCase();
      const sourceLower = source.toLowerCase();
      const titleLower = title.toLowerCase();
      return idLower.includes('readme') || 
             sourceLower.includes('readme') || 
             titleLower.includes('readme') ||
             category === 'readme' ||
             category.toLowerCase().includes('readme');
    };
    
    const isDoc = (id: string, source: string, category: string, title: string) => {
      const idLower = id.toLowerCase();
      const sourceLower = source.toLowerCase();
      const titleLower = title.toLowerCase();
      return idLower.includes('doc-') || 
             idLower.includes('docs/') ||
             sourceLower.includes('docs/') || 
             sourceLower.includes('documentation') ||
             titleLower.includes('documentation') ||
             category === 'documentation' ||
             category.toLowerCase().includes('doc');
    };

    // Group knowledge by category
    const byCategory = new Map<string, typeof allKnowledge>();
    const byType = new Map<string, typeof allKnowledge>();
    const bySource = new Map<string, typeof allKnowledge>();
    
    allKnowledge.forEach(k => {
      // By category
      if (!byCategory.has(k.category)) {
        byCategory.set(k.category, []);
      }
      byCategory.get(k.category)!.push(k);
      
      // By type
      if (!byType.has(k.type)) {
        byType.set(k.type, []);
      }
      byType.get(k.type)!.push(k);
      
      // By source
      if (!bySource.has(k.source)) {
        bySource.set(k.source, []);
      }
      bySource.get(k.source)!.push(k);
    });

    // Get README files
    const readmeFiles = allKnowledge.filter(k => 
      isReadme(k.id, k.source, k.category, k.title)
    );

    // Get documentation files
    const docFiles = allKnowledge.filter(k => 
      isDoc(k.id, k.source, k.category, k.title)
    );

    // Get recent knowledge (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentKnowledge = allKnowledge
      .filter(k => new Date(k.extractedAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime())
      .slice(0, 10);

    // Get popular categories (categories with most items)
    const popularCategories = Array.from(byCategory.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([category, items]) => ({
        category,
        count: items.length,
        items: items.slice(0, 5) // Top 5 items per category
      }));

    // Build knowledge cards
    const cards = [
      // Popular by Category
      ...popularCategories.map(({ category, count, items }) => ({
        type: 'category' as const,
        title: `${category} (${count} items)`,
        description: `Explore ${count} knowledge items in ${category}`,
        items: items.map(k => ({
          id: k.id,
          title: k.title,
          url: `/knowledge?id=${k.id}`,
          spans: [{ text: k.description.slice(0, 200) }],
          category: k.category,
          type: k.type,
        })),
        icon: 'folder',
      })),
      
      // Recent Knowledge
      recentKnowledge.length > 0 ? {
        type: 'recent' as const,
        title: 'Recently Added',
        description: 'Latest knowledge items added to the base',
        items: recentKnowledge.slice(0, 5).map(k => ({
          id: k.id,
          title: k.title,
          url: `/knowledge?id=${k.id}`,
          spans: [{ text: k.description.slice(0, 200) }],
          category: k.category,
          type: k.type,
        })),
        icon: 'clock',
      } : null,
      
      // README Files
      readmeFiles.length > 0 ? {
        type: 'readme' as const,
        title: 'README Files',
        description: `${readmeFiles.length} README files with project documentation`,
        items: readmeFiles.slice(0, 5).map(k => ({
          id: k.id,
          title: k.title,
          url: `/knowledge?id=${k.id}`,
          spans: [{ text: k.description.slice(0, 200) }],
          category: k.category,
          type: k.type,
        })),
        icon: 'book',
      } : null,
      
      // Documentation
      docFiles.length > 0 ? {
        type: 'documentation' as const,
        title: 'Documentation',
        description: `${docFiles.length} documentation files`,
        items: docFiles.slice(0, 5).map(k => ({
          id: k.id,
          title: k.title,
          url: `/knowledge?id=${k.id}`,
          spans: [{ text: k.description.slice(0, 200) }],
          category: k.category,
          type: k.type,
        })),
        icon: 'file-text',
      } : null,
      
      // By Type
      ...Array.from(byType.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3)
        .map(([type, items]) => ({
          type: 'type' as const,
          title: `${type} (${items.length} items)`,
          description: `Knowledge items of type ${type}`,
          items: items.slice(0, 5).map(k => ({
            id: k.id,
            title: k.title,
            url: `/knowledge?id=${k.id}`,
            spans: [{ text: k.description.slice(0, 200) }],
            category: k.category,
            type: k.type,
          })),
          icon: 'tag',
        })),
    ].filter(Boolean);

    // Build PDF bundles based on categories and user patterns
    // Group items by category combinations that are commonly used together
    const bundles = [
      // Architecture & Patterns bundle
      {
        id: 'architecture-patterns',
        title: 'Architecture & Patterns',
        description: 'Essential architecture patterns and design principles',
        categories: ['architecture', 'pattern', 'design'],
        items: allKnowledge
          .filter(k => ['architecture', 'pattern'].includes(k.type) || k.category.includes('architecture'))
          .slice(0, 10)
          .map(k => ({
            id: k.id,
            title: k.title,
            url: `/knowledge?id=${k.id}`,
            spans: [{ text: k.description.slice(0, 200) }],
            category: k.category,
            type: k.type,
          })),
        icon: 'layers',
      },
      
      // Integration & Best Practices bundle
      {
        id: 'integration-best-practices',
        title: 'Integration & Best Practices',
        description: 'Integration guides and best practices',
        categories: ['integration', 'best-practice'],
        items: allKnowledge
          .filter(k => ['integration', 'best-practice'].includes(k.type))
          .slice(0, 10)
          .map(k => ({
            id: k.id,
            title: k.title,
            url: `/knowledge?id=${k.id}`,
            spans: [{ text: k.description.slice(0, 200) }],
            category: k.category,
            type: k.type,
          })),
        icon: 'link',
      },
      
      // Feature & Code Examples bundle
      {
        id: 'features-code',
        title: 'Features & Code Examples',
        description: 'Feature implementations with code examples',
        categories: ['feature', 'code'],
        items: allKnowledge
          .filter(k => k.type === 'feature' || k.codeSnippets.length > 0)
          .slice(0, 10)
          .map(k => ({
            id: k.id,
            title: k.title,
            url: `/knowledge?id=${k.id}`,
            spans: [{ text: k.description.slice(0, 200) }],
            category: k.category,
            type: k.type,
          })),
        icon: 'code',
      },
      
      // Multi-category bundles (top categories combined)
      ...popularCategories.slice(0, 2).map(({ category, items }) => ({
        id: `bundle-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${category} Bundle`,
        description: `Complete ${category} knowledge collection`,
        categories: [category],
        items: items.slice(0, 15).map(k => ({
          id: k.id,
          title: k.title,
          url: `/knowledge?id=${k.id}`,
          spans: [{ text: k.description.slice(0, 200) }],
          category: k.category,
          type: k.type,
        })),
        icon: 'package',
      })),
    ].filter(bundle => bundle.items.length > 0);

    return createSuccessResponse({
      cards,
      bundles,
      stats: {
        total: allKnowledge.length,
        categories: byCategory.size,
        types: byType.size,
        sources: bySource.size,
        readmes: readmeFiles.length,
        docs: docFiles.length,
      }
    });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to fetch recommendations',
      error.message,
      500
    );
  }
}


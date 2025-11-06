import { NextRequest, NextResponse } from 'next/server';
import { 
  LIGHTNING_FACTS, 
  getLightningFactsByCategory, 
  searchLightningFacts,
  getRandomLightningFact,
  formatFactForAssistant,
  type LightningFact
} from '@/lib/ai/lightning-facts';

// GET /api/education/lightning-facts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as LightningFact['category'] | null;
    const query = searchParams.get('query');
    const random = searchParams.get('random') === 'true';
    const format = searchParams.get('format'); // 'assistant' for formatted text

    let facts: LightningFact[] = [];

    if (random) {
      // Return a single random fact
      const randomFact = getRandomLightningFact();
      facts = [randomFact];
    } else if (query) {
      // Search for facts containing the query
      facts = searchLightningFacts(query);
    } else if (category) {
      // Filter by category
      facts = getLightningFactsByCategory(category);
    } else {
      // Return all facts
      facts = LIGHTNING_FACTS;
    }

    // Format for AI assistant if requested
    if (format === 'assistant') {
      const formattedFacts = facts.map(formatFactForAssistant);
      return NextResponse.json({
        facts: formattedFacts,
        count: facts.length,
        query: query || null,
        category: category || null
      });
    }

    return NextResponse.json({
      facts,
      count: facts.length,
      query: query || null,
      category: category || null,
      categories: ['scalability', 'security', 'limitations', 'routing', 'economics']
    });

  } catch (error) {
    console.error('Error serving Lightning facts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Lightning facts' },
      { status: 500 }
    );
  }
}

// POST /api/education/lightning-facts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Please provide an array of questions' },
        { status: 400 }
      );
    }

    // Find relevant facts for each question
    const responses = questions.map((question: string) => {
      const relevantFacts = searchLightningFacts(question);
      const topFacts = relevantFacts.slice(0, 3); // Top 3 most relevant
      
      return {
        question,
        facts: topFacts.map(formatFactForAssistant),
        confidence: topFacts.length > 0 ? 'high' : 'low'
      };
    });

    return NextResponse.json({
      responses,
      total_questions: questions.length,
      facts_found: responses.reduce((sum, r) => sum + r.facts.length, 0)
    });

  } catch (error) {
    console.error('Error processing Lightning questions:', error);
    return NextResponse.json(
      { error: 'Failed to process questions' },
      { status: 500 }
    );
  }
} 
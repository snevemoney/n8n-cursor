/**
 * Free research sources - no paid APIs required
 * Uses Wikipedia, RSS feeds, and public APIs
 */

export interface FreeSource {
  url: string;
  title: string;
  content: string;
  publishedAt?: string;
  source: string;
}

/**
 * Fetch from Wikipedia API
 */
export async function searchWikipedia(query: string, limit = 3): Promise<FreeSource[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&format=json`;
    const searchRes = await fetch(searchUrl);
    const [_, titles, descriptions, urls] = await searchRes.json();

    const sources: FreeSource[] = [];

    for (let i = 0; i < titles.length && i < limit; i++) {
      // Get full content for each article
      const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles[i])}&prop=extracts&exintro=true&explaintext=true&format=json`;
      const contentRes = await fetch(contentUrl);
      const contentData = await contentRes.json();

      const pages = contentData.query?.pages || {};
      const pageIds = Object.keys(pages);
      const pageId = pageIds.length > 0 ? pageIds[0] : null;
      const extract = pageId ? (pages[pageId]?.extract || descriptions[i] || '') : (descriptions[i] || '');

      sources.push({
        url: urls[i],
        title: titles[i],
        content: extract,
        source: 'wikipedia',
      });
    }

    return sources;
  } catch (error) {
    console.error('[Wikipedia] Search failed:', error);
    return [];
  }
}

/**
 * Parse RSS feed
 */
export async function parseRSSFeed(feedUrl: string, limit = 5): Promise<FreeSource[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      console.warn(`[RSS] Feed ${feedUrl} returned ${res.status}`);
      return [];
    }

    const xml = await res.text();

    // Simple RSS parser (works for most feeds)
    const items: FreeSource[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      if (items.length >= limit) break;

      const itemXml = match[1];
      if (!itemXml) continue;

      const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = itemXml.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      // Clean HTML tags from description
      const cleanDesc = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();

      if (title && link) {
        items.push({
          url: link.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
          title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
          content: cleanDesc,
          publishedAt: pubDate,
          source: new URL(feedUrl).hostname.replace('www.', ''),
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`[RSS] Failed to parse ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Get Bitcoin/crypto news from multiple RSS feeds
 */
export async function getCryptoNewsRSS(maxPerFeed = 3): Promise<FreeSource[]> {
  const feeds = [
    'https://cointelegraph.com/rss',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://bitcoinmagazine.com/.rss/full/',
    'https://decrypt.co/feed',
  ];

  const results = await Promise.allSettled(
    feeds.map(feed => parseRSSFeed(feed, maxPerFeed))
  );

  const allSources: FreeSource[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    }
  }

  return allSources;
}

/**
 * Get general news from RSS feeds
 */
export async function getGeneralNewsRSS(topic: string, maxPerFeed = 3): Promise<FreeSource[]> {
  const feeds = [
    `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`,
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://feeds.bbci.co.uk/news/rss.xml',
  ];

  const results = await Promise.allSettled(
    feeds.map(feed => parseRSSFeed(feed, maxPerFeed))
  );

  const allSources: FreeSource[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    }
  }

  return allSources;
}

/**
 * Detect query category for intelligent source selection
 */
function detectQueryCategory(query: string): {
  isCrypto: boolean;
  isNews: boolean;
  isTech: boolean;
  isCompetitor: boolean;
  isCompany: boolean;
} {
  return {
    isCrypto: /bitcoin|ethereum|crypto|blockchain|btc|eth|defi|nft|web3/i.test(query),
    isNews: /news|latest|today|breaking|recent|update|happening/i.test(query),
    isTech: /github|repository|code|api|documentation|tech|software|developer/i.test(query),
    isCompetitor: /competitor|alternative|similar|compare|vs|versus/i.test(query),
    isCompany: /company|startup|business|product|service|website|platform/i.test(query)
  };
}

/**
 * Get tech/developer RSS feeds
 */
export async function getTechNewsRSS(maxPerFeed = 3): Promise<FreeSource[]> {
  const feeds = [
    'https://hnrss.org/frontpage', // Hacker News
    'https://www.reddit.com/r/programming/.rss', // Reddit Programming
    'https://changelog.com/feed', // Changelog
  ];

  const results = await Promise.allSettled(
    feeds.map(feed => parseRSSFeed(feed, maxPerFeed))
  );

  const allSources: FreeSource[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    }
  }

  return allSources;
}

/**
 * Get business/startup RSS feeds
 */
export async function getBusinessNewsRSS(maxPerFeed = 3): Promise<FreeSource[]> {
  const feeds = [
    'https://techcrunch.com/feed/', // TechCrunch
    'https://feeds.feedburner.com/venturebeat/SZYF', // VentureBeat
    'https://www.producthunt.com/feed', // Product Hunt
  ];

  const results = await Promise.allSettled(
    feeds.map(feed => parseRSSFeed(feed, maxPerFeed))
  );

  const allSources: FreeSource[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    }
  }

  return allSources;
}

/**
 * Intelligent source selection based on query
 */
export async function getFreeSourcesForQuery(query: string): Promise<FreeSource[]> {
  const sources: FreeSource[] = [];
  const category = detectQueryCategory(query);

  console.log(`[Free Sources] Detected categories: ${Object.entries(category).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'general'}`);

  // 1. Always try Wikipedia for authoritative info
  console.log('[Free Sources] Searching Wikipedia...');
  const wikiResults = await searchWikipedia(query, 2);
  sources.push(...wikiResults);
  console.log(`[Free Sources] Wikipedia: ${wikiResults.length} results`);

  // 2. Get RSS feeds based on detected categories
  if (category.isCrypto && category.isNews) {
    console.log('[Free Sources] Fetching crypto news RSS feeds...');
    const cryptoNews = await getCryptoNewsRSS(4);
    sources.push(...cryptoNews);
    console.log(`[Free Sources] Crypto RSS: ${cryptoNews.length} results`);
  } else if (category.isTech) {
    console.log('[Free Sources] Fetching tech/developer RSS feeds...');
    const techNews = await getTechNewsRSS(4);
    sources.push(...techNews);
    console.log(`[Free Sources] Tech RSS: ${techNews.length} results`);
  } else if (category.isCompany || category.isCompetitor) {
    console.log('[Free Sources] Fetching business/startup RSS feeds...');
    const businessNews = await getBusinessNewsRSS(4);
    sources.push(...businessNews);
    console.log(`[Free Sources] Business RSS: ${businessNews.length} results`);
  } else if (category.isNews) {
    console.log('[Free Sources] Fetching general news RSS feeds...');
    const generalNews = await getGeneralNewsRSS(query, 4);
    sources.push(...generalNews);
    console.log(`[Free Sources] General RSS: ${generalNews.length} results`);
  }

  // 3. If we got very few sources, supplement with general news
  if (sources.length < 3 && !category.isNews) {
    console.log('[Free Sources] Supplementing with general news...');
    const supplemental = await getGeneralNewsRSS(query, 3);
    sources.push(...supplemental);
    console.log(`[Free Sources] Supplemental: ${supplemental.length} results`);
  }

  return sources;
}

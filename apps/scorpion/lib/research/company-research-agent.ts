/**
 * Company Research Agent
 * Specialized agent for comprehensive company intelligence gathering
 */

import { ResearchBrowser } from './browser-pool';
import { LLMAdapter } from '@scorpion/core';
import { RAGStore } from '@scorpion/core';

export interface CompanyProfile {
  name: string;
  domain?: string;
  description?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  employeeCount?: string;
  revenue?: string;
  funding?: {
    total?: string;
    rounds?: FundingRound[];
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  news?: NewsArticle[];
  competitors?: string[];
  keyPeople?: Person[];
  technologies?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  sources: string[];
}

export interface FundingRound {
  date: string;
  amount: string;
  type: string;
  investors?: string[];
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  date: string;
  summary?: string;
}

export interface Person {
  name: string;
  role: string;
  linkedin?: string;
}

export class CompanyResearchAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  async research(
    companyName: string,
    browser: ResearchBrowser
  ): Promise<CompanyProfile> {
    console.log(`🏢 Researching company: ${companyName}`);

    const profile: Partial<CompanyProfile> = { 
      name: companyName,
      sources: []
    };

    try {
      // 1. Find company domain and website
      const websiteData = await this.findCompanyWebsite(companyName, browser);
      Object.assign(profile, websiteData);

      // 2. Gather LinkedIn data
      const linkedinData = await this.gatherLinkedInData(companyName, browser);
      Object.assign(profile, linkedinData);

      // 3. Collect recent news
      profile.news = await this.collectNews(companyName, browser);

      // 4. Analyze sentiment
      if (profile.news && profile.news.length > 0) {
        profile.sentiment = await this.analyzeSentiment(profile.news);
      }

      // 5. Find competitors using LLM
      if (profile.industry) {
        profile.competitors = await this.findCompetitors(companyName, profile.industry);
      }

      // 6. Store in RAG
      await this.storeCompanyProfile(profile as CompanyProfile);

      console.log(`✅ Company research completed for ${companyName}`);
      return profile as CompanyProfile;

    } catch (error: any) {
      console.error(`Company research failed:`, error);
      throw new Error(`Company research failed: ${error.message}`);
    }
  }

  private async findCompanyWebsite(
    companyName: string,
    browser: ResearchBrowser
  ): Promise<Partial<CompanyProfile>> {
    try {
      console.log(`🔍 Finding website for ${companyName}`);
      
      // Search for company website
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(companyName + ' official website')}`;
      await browser.navigate(searchUrl);
      await browser.wait(2000);

      const results = await browser.extract('.result__a');
      
      if (!results || results.length === 0) {
        return {};
      }

      // Get the first result's URL
      const firstResult = results[0];
      const domain = this.extractDomain(firstResult.href);

      if (!domain) {
        return {};
      }

      console.log(`🌐 Found domain: ${domain}`);

      // Visit the website
      try {
        await browser.navigate(`https://${domain}`);
        await browser.wait(3000);

        const content = await browser.getTextContent();
        
        // Extract structured data using LLM
        const extracted = await this.extractCompanyInfo(content);

        return {
          domain,
          sources: [`https://${domain}`],
          ...extracted
        };
      } catch (error) {
        console.error(`Failed to visit ${domain}:`, error);
        return { domain };
      }

    } catch (error) {
      console.error('Website search failed:', error);
      return {};
    }
  }

  private async extractCompanyInfo(content: string): Promise<Partial<CompanyProfile>> {
    try {
      const preview = content.substring(0, 3000);
      
      const prompt = `Extract company information from this website content:

${preview}

Extract and return JSON:
{
  "description": "brief description",
  "industry": "industry/sector",
  "founded": "year if mentioned",
  "headquarters": "location if mentioned",
  "employeeCount": "count if mentioned"
}

Only include fields if you find them. Return empty string for missing fields.`;

      const response = await this.llm.generate({
        system: 'You are a company information extraction expert. Only extract factual information present in the text.',
        user: prompt,
        jsonOutput: true
      });

      const parsed = JSON.parse(response);
      
      // Filter out empty strings
      return Object.fromEntries(
        Object.entries(parsed).filter(([_, v]) => v && v !== '')
      );
    } catch (error) {
      console.error('Info extraction failed:', error);
      return {};
    }
  }

  private async gatherLinkedInData(
    companyName: string,
    browser: ResearchBrowser
  ): Promise<Partial<CompanyProfile>> {
    try {
      console.log(`💼 Gathering LinkedIn data for ${companyName}`);
      
      // Search for LinkedIn company page
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(companyName + ' LinkedIn company page')}`;
      await browser.navigate(searchUrl);
      await browser.wait(2000);

      const results = await browser.extract('.result__a');
      
      const linkedinResult = results.find((r: any) => 
        r.href && r.href.includes('linkedin.com/company/')
      );

      if (!linkedinResult) {
        return {};
      }

      const linkedinUrl = linkedinResult.href;
      console.log(`🔗 Found LinkedIn: ${linkedinUrl}`);

      return {
        socialMedia: { linkedin: linkedinUrl },
        sources: [linkedinUrl]
      };

    } catch (error) {
      console.error('LinkedIn gathering failed:', error);
      return {};
    }
  }

  private async collectNews(
    companyName: string,
    browser: ResearchBrowser
  ): Promise<NewsArticle[]> {
    try {
      console.log(`📰 Collecting news for ${companyName}`);
      
      // Search for recent news
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(companyName + ' news')}`;
      await browser.navigate(searchUrl);
      await browser.wait(2000);

      const results = await browser.extract('.result__a');
      
      const newsArticles = results
        .slice(0, 10)
        .filter((r: any) => r.href && r.text)
        .map((r: any) => ({
          title: r.text || 'Untitled',
          url: r.href,
          source: this.extractDomain(r.href) || 'Unknown',
          date: new Date().toISOString().split('T')[0] // Approximate
        }));

      console.log(`📰 Collected ${newsArticles.length} news articles`);
      return newsArticles;

    } catch (error) {
      console.error('News collection failed:', error);
      return [];
    }
  }

  private async analyzeSentiment(news: NewsArticle[]): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const titles = news.map(n => n.title).join('\n');
      
      const response = await this.llm.generate({
        system: 'Analyze the overall sentiment of these news headlines. Respond with only: positive, neutral, or negative',
        user: `News headlines:\n${titles}`
      });

      const sentiment = response.toLowerCase().trim();
      if (sentiment.includes('positive')) return 'positive';
      if (sentiment.includes('negative')) return 'negative';
      return 'neutral';
    } catch {
      return 'neutral';
    }
  }

  private async findCompetitors(
    companyName: string,
    industry: string
  ): Promise<string[]> {
    try {
      const response = await this.llm.generate({
        system: 'List the top 5-10 competitors for this company. Respond with a JSON array of company names.',
        user: `Company: ${companyName}\nIndustry: ${industry}`,
        jsonOutput: true
      });

      const parsed = JSON.parse(response);
      return parsed.competitors || parsed || [];
    } catch {
      return [];
    }
  }

  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  private async storeCompanyProfile(profile: CompanyProfile) {
    try {
      const content = `Company Profile: ${profile.name}

${profile.description ? `Description: ${profile.description}\n` : ''}
${profile.industry ? `Industry: ${profile.industry}\n` : ''}
${profile.domain ? `Website: ${profile.domain}\n` : ''}
${profile.headquarters ? `Headquarters: ${profile.headquarters}\n` : ''}
${profile.employeeCount ? `Employees: ${profile.employeeCount}\n` : ''}
${profile.founded ? `Founded: ${profile.founded}\n` : ''}

${profile.news && profile.news.length > 0 ? `Recent News:\n${profile.news.map(n => `- ${n.title} (${n.source})`).join('\n')}\n` : ''}

${profile.competitors && profile.competitors.length > 0 ? `Competitors:\n${profile.competitors.map(c => `- ${c}`).join('\n')}\n` : ''}

Sentiment: ${profile.sentiment || 'unknown'}

Sources: ${profile.sources.join(', ')}`;

      await this.ragStore.addDocument({
        content,
        metadata: {
          type: 'company-research',
          company: profile.name,
          industry: profile.industry,
          sentiment: profile.sentiment,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`✅ Company profile stored in RAG`);
    } catch (error) {
      console.error('Failed to store company profile:', error);
    }
  }
}


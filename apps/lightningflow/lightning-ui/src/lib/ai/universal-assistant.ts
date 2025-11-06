import { OpenAI } from 'openai';
import { searchLightningFacts, formatFactForAssistant, type LightningFact } from './lightning-facts';

// Industry context types
export type Industry = 
  | 'auto_finance'
  | 'restaurant'
  | 'freelance'
  | 'consulting'
  | 'retail'
  | 'healthcare'
  | 'real_estate'
  | 'education'
  | 'general';

export type UserRole = 
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'agent'
  | 'freelancer'
  | 'consultant';

export type BusinessGoal = 
  | 'collect_payment'
  | 'create_contract'
  | 'view_financials'
  | 'automate_workflow'
  | 'setup_recurring'
  | 'add_team_member'
  | 'track_status'
  | 'generate_invoice'
  | 'learn_lightning'
  | 'troubleshoot_node';

// Core context interface
export interface AssistantContext {
  industry: Industry;
  role: UserRole;
  tone: 'friendly' | 'professional' | 'technical';
  currency: 'USD' | 'CAD' | 'EUR' | 'BTC';
  btc_display: 'live_price' | 'sats_only' | 'both';
  user_id: string;
  lightning_iq_enabled?: boolean;
  node_status?: {
    active: boolean;
    balance_sats: number;
    liquidity_sats: number;
    recent_payments: number;
  };
}

// Tool template types
export type ToolTemplate = 
  | 'uploader'
  | 'tracker'
  | 'payment_link'
  | 'invoice_builder'
  | 'reminder_bot'
  | 'contract_signer'
  | 'status_board'
  | 'booking_scheduler'
  | 'team_wallet'
  | 'lightning_tutorial'
  | 'node_diagnostics';

export interface ToolConfig {
  type: ToolTemplate;
  name: string;
  description: string;
  config: Record<string, any>;
  industry_specific?: Record<string, any>;
}

// Lightning education keywords for detecting educational questions
const LIGHTNING_KEYWORDS = [
  'lightning', 'channel', 'routing', 'multisig', 'htlc', 'scalability',
  'bitcoin', 'btc', 'satoshi', 'sats', 'fees', 'decentralized',
  'trustless', 'non-custodial', 'security', 'visa', 'tps', 'payment',
  'transaction', 'blockchain', 'layer 2', 'off-chain', 'on-chain'
];

// BTC price context
export interface BTCContext {
  price_usd: number;
  breakdown: (btc: number) => {
    btc: number;
    usd: string;
    sats: number;
  };
}

export class UniversalAssistant {
  private openai: OpenAI;
  private context: AssistantContext;
  private btcContext?: BTCContext;

  constructor(context: AssistantContext, apiKey: string) {
    this.context = context;
    this.openai = new OpenAI({ apiKey });
  }

  // Set BTC price context
  setBTCContext(btcContext: BTCContext) {
    this.btcContext = btcContext;
  }

  // Check if user input contains Lightning Network related questions
  private isLightningEducationQuery(userInput: string): boolean {
    if (!this.context.lightning_iq_enabled) return false;
    
    const input = userInput.toLowerCase();
    return LIGHTNING_KEYWORDS.some(keyword => input.includes(keyword)) ||
           input.includes('how does') ||
           input.includes('what is') ||
           input.includes('why') ||
           input.includes('explain');
  }

  // Generate Lightning Network educational response
  async generateLightningEducationResponse(
    userInput: string
  ): Promise<{
    message: string;
    facts: LightningFact[];
    suggested_actions?: Array<{
      type: 'learn_more' | 'try_demo' | 'visit_trust_center';
      data: any;
    }>;
  }> {
    const relevantFacts = searchLightningFacts(userInput);
    
    if (relevantFacts.length === 0) {
      return {
        message: `I'd be happy to help you learn about Lightning Network! However, I don't have specific information about "${userInput}". 

You can visit our Trust Center for comprehensive Lightning Network education, or ask about:
- How Lightning channels work
- Bitcoin scalability
- Lightning security features
- Routing and liquidity
- Node economics`,
        facts: [],
        suggested_actions: [{
          type: 'visit_trust_center',
          data: { url: '/trust', label: 'Visit Trust Center' }
        }]
      };
    }

    const formattedFacts = relevantFacts.slice(0, 3).map(formatFactForAssistant);
    
    const educationalPrompt = `
You are a Lightning Network expert helping users understand Bitcoin's Layer 2 technology.
User asked: "${userInput}"

Relevant facts:
${formattedFacts.join('\n\n')}

Provide a clear, helpful response that:
1. Directly answers their question
2. Uses simple language appropriate for ${this.context.role} in ${this.context.industry}
3. References the provided facts
4. Encourages further learning

Keep the tone ${this.context.tone} and focus on practical understanding.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: educationalPrompt }],
        temperature: 0.7,
      });

      const message = response.choices[0]?.message?.content || 
        'I can help you learn about Lightning Network! Please check our Trust Center for more information.';

      return {
        message,
        facts: relevantFacts.slice(0, 3),
        suggested_actions: [
          {
            type: 'learn_more',
            data: { 
              component: 'LightningBasics',
              label: 'Take Lightning Tutorial'
            }
          },
          {
            type: 'visit_trust_center',
            data: { url: '/trust', label: 'Visit Trust Center' }
          }
        ]
      };

    } catch (error) {
      console.error('Error generating Lightning education response:', error);
      return {
        message: 'I can help you learn about Lightning Network! Please visit our Trust Center for comprehensive educational content.',
        facts: relevantFacts.slice(0, 3),
        suggested_actions: [{
          type: 'visit_trust_center',
          data: { url: '/trust', label: 'Visit Trust Center' }
        }]
      };
    }
  }

  // Enhanced response generation with Lightning education
  async generateResponse(
    userInput: string,
    context?: Record<string, any>
  ): Promise<{
    message: string;
    actions?: Array<{
      type: 'create_tool' | 'show_info' | 'ask_question' | 'learn_more';
      data: any;
    }>;
    btc_info?: {
      amount_btc: number;
      amount_usd: string;
      amount_sats: number;
    };
    lightning_education?: {
      facts: LightningFact[];
      suggested_actions: Array<{
        type: 'learn_more' | 'visit_trust_center';
        data: any;
      }>;
    };
  }> {
    // Check if this is a Lightning education query first
    if (this.isLightningEducationQuery(userInput)) {
      const educationResponse = await this.generateLightningEducationResponse(userInput);
      
      // Filter suggested_actions to only include compatible types
      const compatibleActions = (educationResponse.suggested_actions?.filter(
        action => action.type === 'learn_more' || action.type === 'visit_trust_center'
      ) || []) as Array<{
        type: 'learn_more' | 'visit_trust_center';
        data: any;
      }>;
      
      return {
        message: educationResponse.message,
        lightning_education: {
          facts: educationResponse.facts,
          suggested_actions: compatibleActions
        },
        actions: educationResponse.suggested_actions?.map(action => ({
          type: 'learn_more' as const,
          data: action.data
        }))
      };
    }

    // Default business assistant response
    const prompt = `
You are an AI assistant for a ${this.context.industry} business using Lightning Bitcoin payments.

User role: ${this.context.role}
User said: "${userInput}"
Context: ${context ? JSON.stringify(context) : 'None'}

Node Status:
${this.context.node_status ? `
- Node active: ${this.context.node_status.active}
- Balance: ${this.context.node_status.balance_sats} sats
- Recent payments: ${this.context.node_status.recent_payments}
` : '- Node status unknown'}

Provide a helpful, actionable response. If they mention amounts, include BTC conversion info.
Keep tone ${this.context.tone} and industry-appropriate.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const message = response.choices[0]?.message?.content || 
        'I\'m here to help with your business needs. What would you like to accomplish?';

      return { message };

    } catch (error) {
      console.error('Error generating response:', error);
      return {
        message: 'I\'m here to help with your business needs. What would you like to accomplish?'
      };
    }
  }
}

export function createAssistant(
  industry: Industry,
  role: UserRole,
  userId: string,
  apiKey: string,
  nodeStatus?: AssistantContext['node_status'],
  lightningIQEnabled: boolean = true
): UniversalAssistant {
  const context: AssistantContext = {
    industry,
    role,
    tone: industry === 'healthcare' || industry === 'real_estate' ? 'professional' : 'friendly',
    currency: 'BTC',
    btc_display: 'both',
    user_id: userId,
    lightning_iq_enabled: lightningIQEnabled,
    node_status: nodeStatus
  };

  return new UniversalAssistant(context, apiKey);
} 
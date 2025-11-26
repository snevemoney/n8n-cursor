import { ToolTemplate, ToolConfig } from '../ai/universal-assistant';

// Base tool interface
export interface BaseTool {
  id: string;
  type: ToolTemplate;
  name: string;
  description: string;
  config: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  industry?: string;
  public: boolean;
  share_url?: string;
}

// Tool-specific configurations
export interface UploaderConfig {
  departments: string[];
  required_fields: string[];
  file_types: string[];
  max_file_size: number;
  auto_notify: boolean;
  notification_emails?: string[];
}

export interface PaymentLinkConfig {
  amount_sats: number;
  amount_usd?: number;
  description: string;
  expiry_hours: number;
  allow_tips: boolean;
  success_message: string;
  redirect_url?: string;
}

export interface ContractConfig {
  template_type: 'service' | 'rental' | 'deposit' | 'recurring';
  parties: Array<{ name: string; role: string; email?: string }>;
  terms: string[];
  payment_schedule: Array<{
    amount_sats: number;
    due_date: string;
    description: string;
  }>;
  auto_reminders: boolean;
  signature_required: boolean;
}

export interface TrackerConfig {
  stages: Array<{ name: string; description: string; auto_advance?: boolean }>;
  notifications: Array<{ stage: string; recipients: string[]; message: string }>;
  client_visible: boolean;
  estimated_duration: string;
}

export interface TeamWalletConfig {
  name: string;
  members: Array<{ user_id: string; role: 'admin' | 'member' | 'viewer'; permissions: string[] }>;
  spending_limits: Record<string, number>;
  approval_required: boolean;
  auto_split_rules?: Array<{ percentage: number; recipient: string }>;
}

// Tool factory class
export class ToolFactory {
  static async createTool(
    type: ToolTemplate,
    config: Record<string, any>,
    userId: string,
    industry?: string
  ): Promise<BaseTool> {
    const toolId = generateToolId();
    const now = new Date();

    const baseTool: BaseTool = {
      id: toolId,
      type,
      name: config.name || getDefaultName(type),
      description: config.description || getDefaultDescription(type),
      config: this.validateAndNormalizeConfig(type, config),
      created_at: now,
      updated_at: now,
      user_id: userId,
      industry,
      public: config.public || false,
      share_url: config.public ? generateShareUrl(toolId, userId) : undefined
    };

    // Store in database (Supabase)
    await this.saveTool(baseTool);

    return baseTool;
  }

  static validateAndNormalizeConfig(type: ToolTemplate, config: Record<string, any>): Record<string, any> {
    switch (type) {
      case 'uploader':
        return this.validateUploaderConfig(config);
      case 'payment_link':
        return this.validatePaymentLinkConfig(config);
      case 'contract_signer':
        return this.validateContractConfig(config);
      case 'tracker':
        return this.validateTrackerConfig(config);
      case 'team_wallet':
        return this.validateTeamWalletConfig(config);
      default:
        return config;
    }
  }

  private static validateUploaderConfig(config: any): UploaderConfig {
    return {
      departments: config.departments || ['general'],
      required_fields: config.required_fields || ['name', 'file'],
      file_types: config.file_types || ['pdf', 'jpg', 'png', 'doc'],
      max_file_size: config.max_file_size || 10485760, // 10MB
      auto_notify: config.auto_notify !== false,
      notification_emails: config.notification_emails || []
    };
  }

  private static validatePaymentLinkConfig(config: any): PaymentLinkConfig {
    return {
      amount_sats: config.amount_sats || 100000,
      amount_usd: config.amount_usd,
      description: config.description || 'Payment request',
      expiry_hours: config.expiry_hours || 24,
      allow_tips: config.allow_tips !== false,
      success_message: config.success_message || 'Payment received successfully!',
      redirect_url: config.redirect_url
    };
  }

  private static validateContractConfig(config: any): ContractConfig {
    return {
      template_type: config.template_type || 'service',
      parties: config.parties || [],
      terms: config.terms || [],
      payment_schedule: config.payment_schedule || [],
      auto_reminders: config.auto_reminders !== false,
      signature_required: config.signature_required !== false
    };
  }

  private static validateTrackerConfig(config: any): TrackerConfig {
    return {
      stages: config.stages || [
        { name: 'Submitted', description: 'Initial submission' },
        { name: 'In Review', description: 'Under review' },
        { name: 'Completed', description: 'Process completed' }
      ],
      notifications: config.notifications || [],
      client_visible: config.client_visible !== false,
      estimated_duration: config.estimated_duration || '3-5 business days'
    };
  }

  private static validateTeamWalletConfig(config: any): TeamWalletConfig {
    return {
      name: config.name || 'Team Wallet',
      members: config.members || [],
      spending_limits: config.spending_limits || {},
      approval_required: config.approval_required !== false,
      auto_split_rules: config.auto_split_rules
    };
  }

  // Save tool to database
  private static async saveTool(tool: BaseTool): Promise<void> {
    try {
      // This would integrate with your Supabase client
      const { supabase } = await import('../supabase');

      const { error } = await supabase
        .from('tools')
        .insert({
          id: tool.id,
          type: tool.type,
          name: tool.name,
          description: tool.description,
          config: tool.config,
          user_id: tool.user_id,
          industry: tool.industry,
          public: tool.public,
          share_url: tool.share_url,
          created_at: tool.created_at.toISOString(),
          updated_at: tool.updated_at.toISOString()
        });

      if (error) {
        throw new Error(`Failed to save tool: ${error.message}`);
      }
    } catch (error) {
      console.error('Tool save failed:', error);
      throw error;
    }
  }

  // Load tool from database
  static async loadTool(toolId: string, userId: string): Promise<BaseTool | null> {
    try {
      const { supabase } = await import('../supabase');

      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Tool load failed:', error);
      return null;
    }
  }

  // List user tools
  static async listUserTools(userId: string): Promise<BaseTool[]> {
    try {
      const { supabase } = await import('../supabase');

      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to load tools: ${error.message}`);
      }

      return (data || []).map(tool => ({
        ...tool,
        created_at: new Date(tool.created_at),
        updated_at: new Date(tool.updated_at)
      }));
    } catch (error) {
      console.error('Tools list failed:', error);
      return [];
    }
  }

  // Update tool
  static async updateTool(toolId: string, userId: string, updates: Partial<BaseTool>): Promise<BaseTool | null> {
    try {
      const { supabase } = await import('../supabase');

      const { data, error } = await supabase
        .from('tools')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', toolId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Tool update failed:', error);
      return null;
    }
  }

  // Delete tool
  static async deleteTool(toolId: string, userId: string): Promise<boolean> {
    try {
      const { supabase } = await import('../supabase');

      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Tool delete failed:', error);
      return false;
    }
  }
}

// Utility functions
function generateToolId(): string {
  return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateShareUrl(toolId: string, userId: string): string {
  // This would be your domain
  return `https://yourapp.com/${userId}/tool/${toolId}`;
}

function getDefaultName(type: ToolTemplate): string {
  const names: Record<ToolTemplate, string> = {
    uploader: 'Document Uploader',
    tracker: 'Status Tracker',
    payment_link: 'Payment Request',
    invoice_builder: 'Invoice Generator',
    reminder_bot: 'Reminder System',
    contract_signer: 'Smart Agreement',
    status_board: 'Status Dashboard',
    booking_scheduler: 'Booking System',
    team_wallet: 'Team Wallet',
    lightning_tutorial: 'Lightning Tutorial',
    node_diagnostics: 'Node Diagnostics'
  };
  return names[type] || 'Business Tool';
}

function getDefaultDescription(type: ToolTemplate): string {
  const descriptions: Record<ToolTemplate, string> = {
    uploader: 'Collect and route documents from clients',
    tracker: 'Track status and progress of requests',
    payment_link: 'Generate payment links for clients',
    invoice_builder: 'Create and send professional invoices',
    reminder_bot: 'Automated reminders and follow-ups',
    contract_signer: 'Digital agreements with Bitcoin payments',
    status_board: 'Real-time status dashboard for clients',
    booking_scheduler: 'Schedule appointments and services',
    team_wallet: 'Shared wallet for team payments',
    lightning_tutorial: 'Interactive Lightning Network learning',
    node_diagnostics: 'Diagnose and monitor node health'
  };
  return descriptions[type] || 'A business automation tool';
} 
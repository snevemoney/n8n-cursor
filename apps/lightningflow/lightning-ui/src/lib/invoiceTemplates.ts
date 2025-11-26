/**
 * Invoice Templates and Types for Lightning AI Business Node Platform
 * 
 * Provides standardized invoice templates with:
 * - Different payment types (one-time, subscription, on-delivery)
 * - Vault routing rules
 * - Cryptographic enforcement
 * - Automated memo generation
 */

import { lnbitsClient } from './lnbits'
import type { VaultRule } from './lnbits'

export type InvoiceType = 'one-time' | 'subscription' | 'on-delivery' | 'milestone' | 'escrow'

export interface InvoiceTemplate {
  id: string
  name: string
  type: InvoiceType
  description: string
  default_amount?: number
  memo_template: string
  vault_routing_enabled: boolean
  vault_rules?: VaultRule[]
  expiry_hours: number
  auto_settle: boolean
  tags: string[]
  metadata: Record<string, any>
}

export interface InvoiceRequest {
  template_id?: string
  type: InvoiceType
  amount: number
  memo?: string
  user_id: string
  client_info?: {
    name?: string
    email?: string
    project?: string
  }
  delivery_info?: {
    expected_date?: string
    milestones?: string[]
    requirements?: string[]
  }
  subscription_info?: {
    billing_cycle: 'weekly' | 'monthly' | 'yearly'
    auto_renew: boolean
    trial_period_days?: number
  }
  vault_override?: {
    enabled: boolean
    min_amount?: number
    vault_address?: string
  }
  custom_expiry?: number
}

export interface GeneratedInvoice {
  invoice_id: string
  payment_request: string
  amount: number
  memo: string
  type: InvoiceType
  expiry_timestamp: number
  vault_routed: boolean
  vault_rules?: VaultRule[]
  qr_code: string
  metadata: {
    template_used?: string
    client_info?: any
    delivery_info?: any
    subscription_info?: any
    cryptographic_proof: string
  }
}

// Predefined invoice templates
export const INVOICE_TEMPLATES: Record<string, InvoiceTemplate> = {
  'freelance-project': {
    id: 'freelance-project',
    name: 'Freelance Project Payment',
    type: 'one-time',
    description: 'Standard payment for completed freelance work',
    memo_template: 'Freelance work: {project_name} - {client_name}',
    vault_routing_enabled: true,
    expiry_hours: 24,
    auto_settle: true,
    tags: ['freelance', 'project', 'work'],
    metadata: {
      category: 'freelance',
      tax_deductible: true
    }
  },

  'monthly-subscription': {
    id: 'monthly-subscription',
    name: 'Monthly Subscription',
    type: 'subscription',
    description: 'Recurring monthly subscription payment',
    default_amount: 10000, // 10k sats
    memo_template: 'Monthly subscription - {service_name} ({billing_month})',
    vault_routing_enabled: false,
    expiry_hours: 72,
    auto_settle: true,
    tags: ['subscription', 'recurring', 'monthly'],
    metadata: {
      category: 'subscription',
      billing_type: 'recurring'
    }
  },

  'content-delivery': {
    id: 'content-delivery',
    name: 'Content Delivery Payment',
    type: 'on-delivery',
    description: 'Payment upon content delivery and approval',
    memo_template: 'Content delivery: {content_type} - {delivery_date}',
    vault_routing_enabled: true,
    expiry_hours: 168, // 1 week
    auto_settle: false, // Manual settlement after delivery
    tags: ['content', 'delivery', 'approval'],
    metadata: {
      category: 'content',
      requires_approval: true
    }
  },

  'milestone-payment': {
    id: 'milestone-payment',
    name: 'Project Milestone',
    type: 'milestone',
    description: 'Payment for reaching project milestone',
    memo_template: 'Milestone {milestone_number}: {milestone_description}',
    vault_routing_enabled: true,
    expiry_hours: 48,
    auto_settle: false,
    tags: ['milestone', 'project', 'progress'],
    metadata: {
      category: 'milestone',
      requires_verification: true
    }
  },

  'escrow-payment': {
    id: 'escrow-payment',
    name: 'Escrow Payment',
    type: 'escrow',
    description: 'Escrowed payment held until conditions are met',
    memo_template: 'Escrow: {agreement_id} - {conditions}',
    vault_routing_enabled: true,
    expiry_hours: 720, // 30 days
    auto_settle: false,
    tags: ['escrow', 'secure', 'conditional'],
    metadata: {
      category: 'escrow',
      requires_conditions: true,
      dispute_resolution: true
    }
  }
}

class InvoiceTemplateManager {
  /**
   * Generate invoice from template
   */
  async generateFromTemplate(request: InvoiceRequest): Promise<GeneratedInvoice> {
    const template = request.template_id ? INVOICE_TEMPLATES[request.template_id] : null
    
    if (request.template_id && !template) {
      throw new Error(`Template not found: ${request.template_id}`)
    }

    // Generate memo from template
    const memo = this.generateMemo(template, request)
    
    // Determine vault routing
    const vaultRouting = this.determineVaultRouting(template, request)
    
    // Calculate expiry
    const expiryHours = request.custom_expiry || template?.expiry_hours || 24
    const expiryTimestamp = Date.now() + (expiryHours * 60 * 60 * 1000)

    // Create Lightning invoice
    const { invoice, metadata } = await lnbitsClient.createInvoice(
      request.amount,
      memo,
      request.user_id,
      expiryHours * 3600 // Convert to seconds
    )

    // Build generated invoice response
    const generatedInvoice: GeneratedInvoice = {
      invoice_id: invoice.checking_id,
      payment_request: invoice.payment_request,
      amount: request.amount,
      memo,
      type: request.type,
      expiry_timestamp: expiryTimestamp,
      vault_routed: vaultRouting.enabled,
      vault_rules: vaultRouting.rules,
      qr_code: invoice.payment_request,
      metadata: {
        template_used: template?.id,
        client_info: request.client_info,
        delivery_info: request.delivery_info,
        subscription_info: request.subscription_info,
        cryptographic_proof: metadata.cryptographic_proof
      }
    }

    return generatedInvoice
  }

  /**
   * Generate memo from template
   */
  private generateMemo(template: InvoiceTemplate | null, request: InvoiceRequest): string {
    if (request.memo) {
      return request.memo
    }

    if (!template) {
      return `${request.type} payment - ${request.amount} sats`
    }

    let memo = template.memo_template

    // Replace template variables
    const replacements: Record<string, string> = {
      '{amount}': request.amount.toString(),
      '{type}': request.type,
      '{client_name}': request.client_info?.name || 'Client',
      '{project_name}': request.client_info?.project || 'Project',
      '{service_name}': request.client_info?.project || 'Service',
      '{billing_month}': new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      '{content_type}': request.delivery_info?.requirements?.[0] || 'Content',
      '{delivery_date}': request.delivery_info?.expected_date || 'TBD',
      '{milestone_number}': request.delivery_info?.milestones?.length?.toString() || '1',
      '{milestone_description}': request.delivery_info?.milestones?.[0] || 'Milestone',
      '{agreement_id}': `AGR-${Date.now()}`,
      '{conditions}': request.delivery_info?.requirements?.join(', ') || 'Standard conditions'
    }

    for (const [placeholder, value] of Object.entries(replacements)) {
      memo = memo.replace(placeholder, value)
    }

    return memo
  }

  /**
   * Determine vault routing configuration
   */
  private determineVaultRouting(template: InvoiceTemplate | null, request: InvoiceRequest) {
    // Override takes precedence
    if (request.vault_override) {
      return {
        enabled: request.vault_override.enabled,
        rules: request.vault_override.enabled ? [{
          id: `override-${Date.now()}`,
          user_id: request.user_id,
          min_amount: request.vault_override.min_amount || 0,
          max_amount: request.amount * 2,
          vault_address: request.vault_override.vault_address || 'default-vault',
          auto_route: true,
          created_at: new Date().toISOString()
        }] : undefined
      }
    }

    // Use template configuration
    if (template?.vault_routing_enabled) {
      return {
        enabled: true,
        rules: template.vault_rules || [{
          id: `template-${template.id}-${Date.now()}`,
          user_id: request.user_id,
          min_amount: template.default_amount || 1000,
          max_amount: request.amount * 2,
          vault_address: 'default-vault',
          auto_route: true,
          created_at: new Date().toISOString()
        }]
      }
    }

    return { enabled: false }
  }

  /**
   * Get available templates
   */
  getTemplates(): InvoiceTemplate[] {
    return Object.values(INVOICE_TEMPLATES)
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): InvoiceTemplate | null {
    return INVOICE_TEMPLATES[id] || null
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: InvoiceType): InvoiceTemplate[] {
    return Object.values(INVOICE_TEMPLATES).filter(template => template.type === type)
  }

  /**
   * Create custom template
   */
  createCustomTemplate(template: Omit<InvoiceTemplate, 'id'>): InvoiceTemplate {
    const id = `custom-${Date.now()}`
    const customTemplate: InvoiceTemplate = {
      ...template,
      id
    }
    
    // In production, this would save to database
    INVOICE_TEMPLATES[id] = customTemplate
    
    return customTemplate
  }

  /**
   * Validate invoice request
   */
  validateRequest(request: InvoiceRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (!request.user_id) {
      errors.push('User ID is required')
    }

    if (request.template_id && !INVOICE_TEMPLATES[request.template_id]) {
      errors.push(`Template not found: ${request.template_id}`)
    }

    if (request.type === 'subscription' && !request.subscription_info) {
      errors.push('Subscription info is required for subscription invoices')
    }

    if (request.type === 'on-delivery' && !request.delivery_info) {
      errors.push('Delivery info is required for on-delivery invoices')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const invoiceTemplateManager = new InvoiceTemplateManager()

export default invoiceTemplateManager 
// Webhook request/response types for all 20 n8n workflows

export interface WebhookResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ChatAssetsRequest {
  action: 'chat';
  tenantId: string;
  userEmail: string;
  chatInput: string;
  test?: boolean;
  timestamp?: string;
  actor?: string;
  request_id?: string;
  session_id?: string;
  origin?: string;
  env?: string;
}

export interface AssetManagementRequest {
  action: 'create' | 'update' | 'get' | 'delete';
  tenantId: string;
  assetType?: string;
  assetName?: string;
  assetCategory?: string;
  location?: string | object;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  conditionStatus?: string;
  status?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assetId?: string;
  test?: boolean;
  timestamp?: string;
}

export interface WorkOrderRequest {
  action: 'create' | 'update' | 'get' | 'delete';
  tenantId: string;
  assetId?: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  requestedBy?: string;
  scheduledDate?: string;
  dueDate?: string;
  workOrderId?: string;
  test?: boolean;
  timestamp?: string;
}

export interface SustainabilityRequest {
  action: 'track' | 'get';
  tenantId: string;
  metricType?: 'energy' | 'water' | 'waste' | 'carbon';
  measurementDate?: string;
  value?: number | string;
  unit?: string;
  source?: string;
  test?: boolean;
  timestamp?: string;
}

export interface TenantOnboardingRequest {
  action: 'onboard';
  tenantId: string;
  businessName?: string;
  contactEmail?: string;
  contactName?: string;
  test?: boolean;
  timestamp?: string;
}

export interface EmailNotificationRequest {
  action: 'send';
  type: 'alert' | 'reminder' | 'report' | 'welcome';
  tenantId: string;
  recipientEmail: string;
  subject?: string;
  body?: string;
  test?: boolean;
  timestamp?: string;
}

export interface SecurityMonitoringRequest {
  action: 'create' | 'check' | 'validate';
  tenantId: string;
  securityType?: string;
  ipAddress?: string;
  test?: boolean;
  timestamp?: string;
}

export interface ComplianceAuditRequest {
  action: 'audit' | 'check';
  tenantId: string;
  complianceType?: string;
  test?: boolean;
  timestamp?: string;
}

// Workflow endpoint mapping
export type WorkflowEndpoint =
  | '/chat-assets'
  | '/assets'
  | '/work-orders'
  | '/sustainability-metrics'
  | '/tenant-onboard'
  | '/notifications/email'
  | '/security'
  | '/compliance'
  | '/knowledge'
  | '/payment'
  | '/analytics'
  | '/testing'
  | '/features'
  | '/audit'
  | '/api-keys'
  | '/backup'
  | '/refunds'
  | '/emergency'
  | '/recovery'
  | '/health';


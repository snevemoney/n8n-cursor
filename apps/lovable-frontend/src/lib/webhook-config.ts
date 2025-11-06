import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  WebhookResponse,
  ChatAssetsRequest,
  AssetManagementRequest,
  WorkOrderRequest,
  SustainabilityRequest,
  TenantOnboardingRequest,
  EmailNotificationRequest,
  SecurityMonitoringRequest,
  ComplianceAuditRequest,
} from './types';
import { getN8nBaseUrl, getDefaultTenantId } from '@lightningflow/shared-config';

const BASE_URL = getN8nBaseUrl();
const DEFAULT_TENANT_ID = getDefaultTenantId();

// Create axios instance with default config
const webhookClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': DEFAULT_TENANT_ID,
  },
});

// Helper to flatten payload and add metadata
function preparePayload(data: any): any {
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;

  return {
    ...data,
    test: data.test ?? true,
    timestamp: data.timestamp ?? timestamp,
    actor: data.actor ?? 'system',
    request_id: data.request_id ?? requestId,
    session_id: data.session_id ?? sessionId,
    origin: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  };
}

// Webhook API functions for all 20 workflows

export const webhookApi = {
  // 1. Chat AI Agent
  async chatAssets(data: ChatAssetsRequest): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/chat-assets', preparePayload({
        ...data,
        action: 'chat',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      }));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 2. Asset Management API
  async assetManagement(data: AssetManagementRequest): Promise<WebhookResponse> {
    try {
      const endpoint = '/assets';
      const payload = preparePayload({
        ...data,
        action: data.action || 'create',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      });

      let response;
      switch (data.action) {
        case 'create':
          response = await webhookClient.post(endpoint, payload);
          break;
        case 'update':
          response = await webhookClient.put(endpoint, payload);
          break;
        case 'get':
          response = await webhookClient.get(endpoint, { params: { tenantId: payload.tenantId } });
          break;
        case 'delete':
          response = await webhookClient.delete(endpoint, { data: payload });
          break;
        default:
          response = await webhookClient.post(endpoint, payload);
      }
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 3. Work Order Management
  async workOrders(data: WorkOrderRequest): Promise<WebhookResponse> {
    try {
      const endpoint = '/work-orders';
      const payload = preparePayload({
        ...data,
        action: data.action || 'create',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      });

      let response;
      if (data.action === 'get') {
        response = await webhookClient.get(endpoint, { params: { tenantId: payload.tenantId } });
      } else {
        response = await webhookClient.post(endpoint, payload);
      }
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 4. Sustainability Dashboard
  async sustainability(data: SustainabilityRequest): Promise<WebhookResponse> {
    try {
      const endpoint = '/sustainability-metrics';
      const payload = preparePayload({
        ...data,
        action: data.action || 'track',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      });

      let response;
      if (data.action === 'get') {
        response = await webhookClient.get(endpoint, { params: { tenantId: payload.tenantId } });
      } else {
        response = await webhookClient.post(endpoint, payload);
      }
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 5. Tenant Onboarding
  async tenantOnboarding(data: TenantOnboardingRequest): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/tenant-onboard', preparePayload({
        ...data,
        action: 'onboard',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      }));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 6. Email Notifications
  async emailNotifications(data: EmailNotificationRequest): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/notifications/email', preparePayload({
        ...data,
        action: 'send',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      }));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 7. Security Monitoring
  async securityMonitoring(data: SecurityMonitoringRequest): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/security', preparePayload({
        ...data,
        action: data.action || 'create',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      }));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 8. Compliance Audit
  async complianceAudit(data: ComplianceAuditRequest): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/compliance', preparePayload({
        ...data,
        action: data.action || 'audit',
        tenantId: data.tenantId || DEFAULT_TENANT_ID,
      }));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // 9-20. Additional workflows (placeholders for now)
  async knowledgeBase(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/knowledge', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async paymentProcessing(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/payment', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async analyticsReporting(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/analytics', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async testingQA(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/testing', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async advancedFeatures(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/features', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async apiKeyManagement(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/api-keys', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async backupRestore(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/backup', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async refundManagement(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/refunds', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async emergencyResponse(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/emergency', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async errorRecovery(data: any): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.post('/recovery', preparePayload(data));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Health check
  async healthCheck(): Promise<WebhookResponse> {
    try {
      const response = await webhookClient.get('/health');
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

// Error handler
function handleError(error: unknown): WebhookResponse {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      success: false,
      error: axiosError.response?.data
        ? JSON.stringify(axiosError.response.data)
        : axiosError.message || 'Unknown error',
    };
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

// Export default instance
export default webhookClient;


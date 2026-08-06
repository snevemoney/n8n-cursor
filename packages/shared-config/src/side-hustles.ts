/**
 * Side hustle configuration
 * Defines all side hustles that can be launched from Scorpion
 * 
 * Strategy: Build side hustles → Monetize → Extract features → Integrate into Scorpion → Train model
 */

export interface ExtractedFeature {
  id: string;
  name: string;
  description: string;
  extractedAt: string; // ISO date
  status: 'extracted' | 'integrated' | 'enhanced';
  scorpionToolPath?: string; // e.g., '/tools/chat', '/tools/rag'
}

export interface SideHustle {
  id: string;
  tenantId: string;  // Links to tenants table in database
  name: string;
  description: string;
  domain: string;
  localDomain: string;
  icon: string;
  status: 'active' | 'inactive' | 'development' | 'archived';
  category?: string;
  
  // Feature extraction tracking
  features?: ExtractedFeature[];
  
  // Learning/experience data for model training
  learnings?: {
    technical: string[]; // Technical insights
    product: string[]; // Product insights
    userBehavior: string[]; // User behavior patterns
    painPoints: string[]; // Common pain points solved
  };
}

export const sideHustles: SideHustle[] = [
  {
    id: 'lightningflow',
    tenantId: 'lightningflow',
    name: 'LightningFlow',
    description: 'Lightning Network platform for businesses',
    domain: 'https://lightningflow.online',
    localDomain: 'http://lightningflow.local',
    icon: '⚡',
    status: 'active',
    category: 'payment',
    features: [
      {
        id: 'lightning-payments',
        name: 'Lightning Payment Processing',
        description: 'Secure Lightning Network payment handling',
        extractedAt: '2024-01-15',
        status: 'integrated',
        scorpionToolPath: '/tools/lightning'
      }
    ],
    learnings: {
      technical: ['How to handle Lightning Network payments securely', 'Multi-tenant payment routing'],
      product: ['Businesses need simple payment integration', 'SaaS model works well for B2B'],
      userBehavior: ['Users prefer self-service onboarding', 'Documentation is critical'],
      painPoints: ['Traditional payment processors are slow', 'High fees for small transactions']
    }
  },
  {
    id: 'n8n-cursor',
    tenantId: 'n8n-cursor',
    name: 'n8n-cursor',
    description: 'Multi-tenant SaaS platform with n8n workflow automation',
    domain: 'https://evenslouis.ca/n8n',
    localDomain: 'http://n8n.local',
    icon: '🔄',
    status: 'active',
    category: 'automation',
    features: [
      {
        id: 'workflow-orchestration',
        name: 'Workflow Orchestration',
        description: 'Multi-tenant workflow management system',
        extractedAt: '2024-02-01',
        status: 'extracted',
        scorpionToolPath: '/tools/workflows'
      },
      {
        id: 'multi-tenant-architecture',
        name: 'Multi-Tenant Architecture',
        description: 'Row-level security and tenant isolation patterns',
        extractedAt: '2024-02-01',
        status: 'extracted',
        scorpionToolPath: '/tools/architecture'
      }
    ],
    learnings: {
      technical: ['Multi-tenant architecture patterns', 'Workflow state management', 'Row-level security implementation'],
      product: ['Developers need workflow tools', 'Self-hosted is important for enterprise'],
      userBehavior: ['Users want visual workflow builders', 'Templates accelerate adoption'],
      painPoints: ['Complex integrations are time-consuming', 'Workflow debugging is hard']
    }
  },
  // Future side hustles can be added here
];

/**
 * Get side hustle by ID
 */
export function getSideHustle(id: string): SideHustle | undefined {
  return sideHustles.find(sh => sh.id === id);
}

/**
 * Get active side hustles
 */
export function getActiveSideHustles(): SideHustle[] {
  return sideHustles.filter(sh => sh.status === 'active');
}

/**
 * Get side hustle URL based on environment
 */
export function getSideHustleUrl(sideHustle: SideHustle, isLocal: boolean = false): string {
  return isLocal ? sideHustle.localDomain : sideHustle.domain;
}

/**
 * Get both cloud and local URLs for a side hustle
 * Useful for displaying both options in UI
 */
export function getSideHustleUrls(sideHustle: SideHustle): { cloud: string; local: string } {
  return {
    cloud: sideHustle.domain,
    local: sideHustle.localDomain,
  };
}

/**
 * Get features extracted from a side hustle
 */
export function getExtractedFeatures(sideHustleId: string): ExtractedFeature[] {
  const hustle = sideHustles.find(sh => sh.id === sideHustleId);
  return hustle?.features || [];
}

/**
 * Get all extracted features across all side hustles
 */
export function getAllExtractedFeatures(): ExtractedFeature[] {
  return sideHustles.flatMap(sh => sh.features || []);
}

/**
 * Get features ready to integrate into Scorpion
 */
export function getFeaturesToIntegrate(): ExtractedFeature[] {
  return getAllExtractedFeatures().filter(f => f.status === 'extracted');
}

/**
 * Get all learnings for model training
 */
export function getAllLearnings(): {
  technical: string[];
  product: string[];
  userBehavior: string[];
  painPoints: string[];
} {
  const learnings = {
    technical: [] as string[],
    product: [] as string[],
    userBehavior: [] as string[],
    painPoints: [] as string[]
  };

  sideHustles.forEach(sh => {
    if (sh.learnings) {
      learnings.technical.push(...(sh.learnings.technical || []));
      learnings.product.push(...(sh.learnings.product || []));
      learnings.userBehavior.push(...(sh.learnings.userBehavior || []));
      learnings.painPoints.push(...(sh.learnings.painPoints || []));
    }
  });

  return learnings;
}


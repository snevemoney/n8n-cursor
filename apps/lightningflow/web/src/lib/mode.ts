/**
 * Lightning AI Node Platform - Mode Management (Apple-Style)
 * 
 * Handles switching between Preview Mode (testing) and Active Mode (production)
 * with proper workspace identity and state isolation.
 */

import { CONCEPT_LABELS, DESCRIPTIONS, getModeLabel, getModeDescription } from './labels';

export const isMockMode = process.env.NEXT_PUBLIC_NODE_MODE === 'mock';

export const getNodeLabel = () => {
  if (isMockMode) return `🧪 ${CONCEPT_LABELS.mockMode} ${CONCEPT_LABELS.node}`;
  return process.env.NEXT_PUBLIC_NODE_NAME || `Unnamed ${CONCEPT_LABELS.node}`;
};

export const getNodeStatus = () => {
  if (isMockMode) {
    return {
      mode: 'mock' as const,
      label: `🧪 ${CONCEPT_LABELS.mockMode} ${CONCEPT_LABELS.node}`,
      description: DESCRIPTIONS.previewMode,
      canReset: true,
      trustLevel: 'testing' as const
    };
  }
  
  return {
    mode: 'live' as const,
    label: getNodeLabel(),
    description: DESCRIPTIONS.activeMode,
    canReset: false,
    trustLevel: 'production' as const
  };
};

export const getBalanceDisplay = (balanceSats: number) => {
  const isZeroBalance = balanceSats === 0;
  
  if (isMockMode) {
    return {
      balance: balanceSats,
      display: `₿ ${(balanceSats / 100000000).toFixed(8)} / ${balanceSats.toLocaleString()} sats`,
      status: `${CONCEPT_LABELS.mockMode} data - not real Bitcoin`,
      trustLevel: 'testing' as const
    };
  }
  
  if (isZeroBalance) {
    return {
      balance: 0,
      display: '₿ 0.00 / 0 sats',
      status: `${CONCEPT_LABELS.node} ready, unfunded`,
      trustLevel: 'pending' as const
    };
  }
  
  return {
    balance: balanceSats,
    display: `₿ ${(balanceSats / 100000000).toFixed(8)} / ${balanceSats.toLocaleString()} sats`,
    status: `${CONCEPT_LABELS.liveMode} ${CONCEPT_LABELS.node.toLowerCase()} active`,
    trustLevel: 'confirmed' as const
  };
};

export const resetMockMode = () => {
  if (!isMockMode) {
    throw new Error(`Cannot reset in ${CONCEPT_LABELS.liveMode.toLowerCase()}`);
  }
  
  // Clear mock data from localStorage
  const mockKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('mock_') || 
    key.startsWith('lightning_') ||
    key.startsWith('earnings_')
  );
  
  mockKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage
  sessionStorage.clear();
  
  console.log(`🧪 ${CONCEPT_LABELS.mockMode} storage reset`);
  return true;
};

export const getStoragePrefix = () => {
  return isMockMode ? 'mock_' : 'live_';
};

export const getModeConfig = () => {
  const nodeStatus = getNodeStatus();
  
  return {
    ...nodeStatus,
    storagePrefix: getStoragePrefix(),
    apiEndpoint: isMockMode ? '/api/mock' : '/api/lightning',
    webhookEnabled: !isMockMode,
    cryptoEnforcement: !isMockMode,
    vaultRouting: !isMockMode
  };
}; 
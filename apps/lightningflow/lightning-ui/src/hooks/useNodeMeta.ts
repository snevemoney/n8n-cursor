/**
 * Lightning AI Node Platform - Node Metadata Hook
 * 
 * Provides reusable access to node mode, state, trust level, and configuration
 * across all components in the application.
 */

import { useState, useEffect } from 'react';
import { 
  isMockMode, 
  getNodeLabel, 
  getNodeStatus, 
  getBalanceDisplay, 
  getModeConfig,
  resetMockMode 
} from '../lib/mode';

export interface NodeMetadata {
  mode: 'mock' | 'live';
  label: string;
  description: string;
  trustLevel: 'testing' | 'pending' | 'confirmed' | 'production';
  canReset: boolean;
  storagePrefix: string;
  apiEndpoint: string;
  webhookEnabled: boolean;
  cryptoEnforcement: boolean;
  vaultRouting: boolean;
}

export interface BalanceMetadata {
  balance: number;
  display: string;
  status: string;
  trustLevel: 'testing' | 'pending' | 'confirmed';
}

export const useNodeMeta = () => {
  const [metadata, setMetadata] = useState<NodeMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = () => {
      try {
        const config = getModeConfig();
        setMetadata(config);
      } catch (error) {
        console.error('Failed to load node metadata:', error);
        // Fallback to safe defaults
        setMetadata({
          mode: 'mock',
          label: '🧪 Emergency Mock Node',
          description: 'Safe testing environment',
          trustLevel: 'testing',
          canReset: true,
          storagePrefix: 'mock_',
          apiEndpoint: '/api/mock',
          webhookEnabled: false,
          cryptoEnforcement: false,
          vaultRouting: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, []);

  const getBalance = (balanceSats: number): BalanceMetadata => {
    return getBalanceDisplay(balanceSats);
  };

  const resetNode = async (): Promise<boolean> => {
    if (!metadata?.canReset) {
      throw new Error('Cannot reset live node');
    }

    try {
      const success = resetMockMode();
      if (success) {
        // Reload metadata after reset
        const config = getModeConfig();
        setMetadata(config);
      }
      return success;
    } catch (error) {
      console.error('Failed to reset node:', error);
      return false;
    }
  };

  const updateNodeName = (newName: string) => {
    if (!metadata) return;

    // In mock mode, update localStorage
    if (metadata.mode === 'mock') {
      localStorage.setItem('mock_node_name', newName);
      setMetadata({
        ...metadata,
        label: `🧪 ${newName} (Mock)`
      });
      return;
    }

    // In live mode, this would update Supabase
    // For now, just update local state
    setMetadata({
      ...metadata,
      label: newName
    });
  };

  const getStorageKey = (key: string): string => {
    return `${metadata?.storagePrefix || 'mock_'}${key}`;
  };

  const setStorageValue = (key: string, value: any) => {
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(value));
  };

  const getStorageValue = <T>(key: string, defaultValue: T): T => {
    try {
      const storageKey = getStorageKey(key);
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return {
    metadata,
    isLoading,
    isMockMode: metadata?.mode === 'mock',
    isLiveMode: metadata?.mode === 'live',
    getBalance,
    resetNode,
    updateNodeName,
    getStorageKey,
    setStorageValue,
    getStorageValue
  };
};

export default useNodeMeta; 
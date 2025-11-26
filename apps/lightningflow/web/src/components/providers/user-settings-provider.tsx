'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserSettings } from '../../lib/useUserSettings';

// Create context with empty initial values
const UserSettingsContext = createContext<ReturnType<typeof useUserSettings> | null>(null);

// Provider component
export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useUserSettings();
  
  return (
    <UserSettingsContext.Provider value={settings}>
      {children}
    </UserSettingsContext.Provider>
  );
}

// Hook to use the settings context
export function useUserSettingsContext() {
  const context = useContext(UserSettingsContext);
  
  if (!context) {
    throw new Error('useUserSettingsContext must be used within a UserSettingsProvider');
  }
  
  return context;
} 
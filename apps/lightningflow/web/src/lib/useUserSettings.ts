'use client';

import { useState, useEffect } from 'react';

// Default user settings
const defaultSettings = {
  advancedMode: false,
  darkMode: true,
  reducedMotion: false,
  compactView: false,
};

type UserSettings = typeof defaultSettings;

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        setLoaded(true);
      } catch (error) {
        console.error('Error loading user settings:', error);
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Update a specific setting
  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      
      // Save to localStorage
      try {
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving user settings:', error);
      }
      
      return newSettings;
    });
  };

  // Toggle a boolean setting
  const toggleSetting = (key: keyof Pick<UserSettings, 'advancedMode' | 'darkMode' | 'reducedMotion' | 'compactView'>) => {
    updateSetting(key, !settings[key]);
  };

  return {
    ...settings,
    loaded,
    updateSetting,
    toggleSetting,
  };
} 
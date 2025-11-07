import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'scorpion', 'settings.json');

interface Settings {
  ollamaUrl: string;
  ollamaModel: string;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:latest',
  autoRefresh: true,
  refreshInterval: 30,
  theme: 'dark',
  notifications: true,
  soundEnabled: false
};

/**
 * GET /api/settings - Load user settings
 */
export async function GET() {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    
    // Try to read existing settings
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data);
      return NextResponse.json(settings);
    } catch (error) {
      // File doesn't exist, return defaults
      return NextResponse.json(DEFAULT_SETTINGS);
    }
  } catch (error: any) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings - Save user settings
 */
export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Validate required fields
    if (!settings.ollamaUrl || !settings.ollamaModel) {
      return NextResponse.json(
        { error: 'Missing required settings' },
        { status: 400 }
      );
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    
    // Merge with existing settings to preserve any we didn't send
    let existingSettings = DEFAULT_SETTINGS;
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      existingSettings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, use defaults
    }
    
    const mergedSettings = {
      ...existingSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    // Save to file
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(mergedSettings, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({
      success: true,
      settings: mergedSettings
    });
    
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings - Reset to defaults
 */
export async function DELETE() {
  try {
    try {
      await fs.unlink(SETTINGS_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
    
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS
    });
    
  } catch (error: any) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset settings' },
      { status: 500 }
    );
  }
}


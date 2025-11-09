'use client';

import React from 'react';

export function ASCIILogo() {
  const logo = `═══════════════════════════════════════
                  🦂
      █▀ █▀▀ █▀█ █▀█ █▀█ █ █▀█ █▄ █
      ▄█ █▄▄ █▄█ █▀▄ █▀▀ █ █▄█ █ ▀█
═══════════════════════════════════════

    [ CLASSIFIED ACCESS ONLY ]
    Tactical Operations Network
    Security Level: OMEGA

═══════════════════════════════════════`.trim();

  return (
    <div 
      className="sc-mono text-xs leading-snug text-emerald-400/80 whitespace-pre"
      suppressHydrationWarning
    >
      {logo}
    </div>
  );
}

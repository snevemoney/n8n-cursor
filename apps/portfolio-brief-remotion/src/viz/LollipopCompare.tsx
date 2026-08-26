import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {signedPct} from '../data/compute';
import {color, fonts} from '../engine/theme';

export type LollipopRow = {label: string; pct: number; tone?: string};

/** Honest two-scalar compare. Not a fake daily path. */
export const LollipopCompare: React.FC<{
  rows: LollipopRow[];
  width?: number;
}> = ({rows, width = 1100}) => {
  const frame = useCurrentFrame();
  if (rows.length === 0) return null;
  const max = Math.max(4, ...rows.map((r) => Math.abs(r.pct)));
  const tones = [color.nvda, color.muted, color.gold, color.aapl, color.long];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 28, width, maxWidth: width}}>
      {rows.map((row, i) => {
        const t = interpolate(frame, [6 + i * 8, 22 + i * 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const c = tones[i % tones.length];
        const x = Math.min(92, (Math.abs(row.pct) / max) * 92) * t;
        return (
          <div key={row.label}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span style={{fontFamily: fonts.mono, fontSize: 16, color: color.muted}}>{row.label}</span>
              <span style={{fontFamily: fonts.mono, fontSize: 20, color: c, fontWeight: 600}}>
                {signedPct(row.pct, Math.abs(row.pct) >= 10 ? 1 : 2)}
              </span>
            </div>
            <div style={{position: 'relative', height: 22}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 10, height: 2, background: color.line}} />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: `${x}%`,
                  top: 10,
                  height: 2,
                  background: c,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: 2,
                  width: 18,
                  height: 18,
                  marginLeft: -9,
                  borderRadius: 99,
                  background: c,
                  boxShadow: `0 0 12px ${c}66`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {signedPct} from '../data/compute';
import {color, fonts} from '../engine/theme';

export type RelBar = {ticker: string; pct: number};

/** Horizontal relative performance for tickers that already have a sourced return. */
export const RelativePerfBars: React.FC<{
  rows: RelBar[];
  width?: number;
}> = ({rows, width = 1680}) => {
  const frame = useCurrentFrame();
  if (rows.length === 0) return null;
  const max = Math.max(8, ...rows.map((r) => Math.abs(r.pct)));
  const ranked = [...rows].sort((a, b) => b.pct - a.pct);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, width}}>
      {ranked.map((row, i) => {
        const t = interpolate(frame, [4 + i * 4, 16 + i * 4], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const up = row.pct >= 0;
        const fill = up ? color.long : color.short;
        const w = Math.min(100, (Math.abs(row.pct) / max) * 100) * t;
        return (
          <div key={row.ticker} style={{display: 'grid', gridTemplateColumns: '140px 1fr 120px', alignItems: 'center', gap: 16}}>
            <span style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 26, color: color.text}}>{row.ticker}</span>
            <div style={{height: 14, background: color.bgLift, borderRadius: 99, overflow: 'hidden'}}>
              <div style={{width: `${w}%`, height: '100%', background: fill, borderRadius: 99}} />
            </div>
            <span style={{fontFamily: fonts.mono, fontSize: 22, color: fill, fontWeight: 600, textAlign: 'right'}}>
              {signedPct(row.pct, 1)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

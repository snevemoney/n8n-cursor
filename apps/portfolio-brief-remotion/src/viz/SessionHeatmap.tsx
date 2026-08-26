import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {signedPct} from '../data/compute';
import {color, fonts} from '../engine/theme';

/**
 * Sequential session cells. A 21-length array fills a 21-session grid.
 * A 7-length streak lights those 7 cells only — never invent the other 14.
 */
export const SessionHeatmap: React.FC<{
  values: number[];
  width?: number;
}> = ({values, width = 1680}) => {
  const frame = useCurrentFrame();
  if (values.length === 0) return null;
  const n = values.length;
  const gap = 10;
  const cell = Math.min(132, Math.floor((width - gap * (n - 1)) / n));

  return (
    <div style={{display: 'flex', gap, alignItems: 'flex-end', width}}>
      {values.map((v, i) => {
        const t = interpolate(frame, [4 + i * 5, 14 + i * 5], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const up = v >= 0;
        const fill = up ? color.long : color.short;
        return (
          <div key={`s-${i}`} style={{width: cell, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div
              style={{
                ...{fontFamily: fonts.mono, fontSize: 13, color: fill, fontWeight: 600, opacity: 0.35 + 0.65 * t},
              }}
            >
              {signedPct(v, Math.abs(v) >= 10 ? 1 : 2)}
            </div>
            <div
              style={{
                width: cell,
                height: cell,
                borderRadius: 10,
                background: fill,
                opacity: 0.18 + 0.72 * t,
                boxShadow: t > 0.8 ? `0 0 16px ${fill}55` : 'none',
              }}
            />
            <div style={{fontFamily: fonts.mono, fontSize: 12, color: color.faint}}>
              {i === n - 1 ? 'LAST' : `T−${n - 1 - i}`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

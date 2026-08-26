import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, fonts} from '../engine/theme';

export type PriceSeries = {label: string; points: number[]; stroke?: string};

/**
 * Normalized (first point = 100) lines. Renders nothing without a real series.
 * Two YTD scalars are not a path — use LollipopCompare instead.
 */
export const NormalizedPriceLines: React.FC<{
  series: PriceSeries[];
  width?: number;
  height?: number;
}> = ({series, width = 1600, height = 420}) => {
  const frame = useCurrentFrame();
  const usable = series.filter((s) => s.points.length >= 2);
  if (usable.length === 0) return null;

  const normalized = usable.map((s) => {
    const origin = s.points[0] === 0 ? 1 : s.points[0];
    return {...s, norm: s.points.map((p) => (p / origin) * 100)};
  });
  const all = normalized.flatMap((s) => s.norm);
  const min = Math.min(...all, 96);
  const max = Math.max(...all, 104);
  const pad = 8;
  const t = interpolate(frame, [8, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const strokes = [color.nvda, color.muted, color.gold, color.aapl];

  const xy = (values: number[], i: number) => {
    const x = (i / Math.max(1, values.length - 1)) * (width - 40);
    const y = height - ((values[i] - min) / (max - min || 1)) * (height - pad * 2) - pad;
    return {x: x + 20, y};
  };

  return (
    <svg width={width} height={height}>
      {normalized.map((s, si) => {
        const shown = Math.max(2, Math.ceil(s.norm.length * t));
        const d = s.norm
          .slice(0, shown)
          .map((_, i) => {
            const p = xy(s.norm, i);
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
          })
          .join(' ');
        return (
          <g key={s.label}>
            <path d={d} fill="none" stroke={s.stroke ?? strokes[si % strokes.length]} strokeWidth={2.5} />
            <text x={width - 8} y={20 + si * 22} fill={s.stroke ?? strokes[si % strokes.length]} fontSize={14} fontFamily={fonts.mono} textAnchor="end">
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

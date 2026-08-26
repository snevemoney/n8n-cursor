import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {OverlapEdge} from '../data/compute';
import {color, fonts} from '../engine/theme';

/**
 * ETF look-through. Draws sourced overlap edges.
 * Weights missing → UNKNOWN stack, never a fake allocation.
 */
export const LookThroughStack: React.FC<{
  tickers: string[];
  edges: OverlapEdge[];
  weightsUnknown: boolean;
  width?: number;
  height?: number;
}> = ({tickers, edges, weightsUnknown, width = 820, height = 620}) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const n = Math.max(1, tickers.length);
  const pos = tickers.map((ticker, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {ticker, x: width / 2 + Math.cos(a) * (width * 0.32), y: height / 2 + Math.sin(a) * (height * 0.32)};
  });
  const find = (t: string) => pos.find((p) => p.ticker.toUpperCase() === t.toUpperCase());

  return (
    <div style={{position: 'relative', width, height, opacity: appear}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        {edges.map((e) => {
          const a = find(e.from);
          const b = find(e.to);
          if (!a || !b) return null;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={color.caution}
              strokeWidth={1.6}
              opacity={0.55}
            />
          );
        })}
        {pos.map((p) => (
          <g key={p.ticker}>
            <circle cx={p.x} cy={p.y} r={28} fill={color.panel} stroke={color.gold} strokeWidth={2} />
            <text x={p.x} y={p.y + 5} fill={color.text} fontSize={13} fontFamily={fonts.sans} fontWeight={700} textAnchor="middle">
              {p.ticker}
            </text>
          </g>
        ))}
      </svg>
      {weightsUnknown ? (
        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            fontFamily: fonts.mono,
            fontSize: 14,
            letterSpacing: 1.4,
            color: color.watch,
            background: color.bgLift,
            border: `1px solid ${color.line}`,
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          WEIGHTS · UNKNOWN
        </div>
      ) : null}
    </div>
  );
};

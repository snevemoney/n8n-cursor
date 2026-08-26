import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {NameBlock, Polarity} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, display} from './ui';

const polarityColor = (p: Polarity): string => {
  switch (p) {
    case 'confirmed':
      return color.long;
    case 'concern':
      return color.short;
    case 'inference':
      return color.watch;
    case 'neutral':
      return color.gold;
    default: {
      const _n: never = p;
      return _n;
    }
  }
};

export const CausalNetwork: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const frame = useCurrentFrame();
  const net = name.network;
  if (!net) return null;

  const W = 1760;
  const H = 640;
  const pulse = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(frame / 10));

  const pos = (id: string) => {
    const node = net.nodes.find((n) => n.id === id);
    if (!node) return {x: 0, y: 0};
    return {x: node.x * W, y: node.y * H};
  };

  const appear = interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={net.title ?? `${name.ticker} chain`} />
      {net.headline ? (
        <p style={{...display, fontSize: 32, margin: '0 0 12px', maxWidth: 1500}}>{net.headline}</p>
      ) : null}
      <svg width={W} height={H} style={{opacity: appear}}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color.lineHot} />
          </marker>
        </defs>
        {net.edges.map((e) => {
          const a = pos(e.from);
          const b = pos(e.to);
          return (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color.lineHot}
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
              {e.label ? (
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 10}
                  fill={color.faint}
                  fontSize={14}
                  fontFamily={fonts.mono}
                  textAnchor="middle"
                >
                  {e.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {net.nodes.map((node) => {
          const p = pos(node.id);
          const c = polarityColor(node.polarity);
          const r = node.id === 'nvda' || node.label === name.ticker ? 28 : 18;
          return (
            <g key={node.id}>
              <circle cx={p.x} cy={p.y} r={r + 10} fill={c} opacity={0.12 * pulse} />
              <circle cx={p.x} cy={p.y} r={r} fill={color.panel} stroke={c} strokeWidth={2.5} opacity={0.55 + 0.45 * pulse} />
              <text
                x={p.x}
                y={p.y + r + 22}
                fill={color.text}
                fontSize={16}
                fontFamily={fonts.sans}
                fontWeight={600}
                textAnchor="middle"
              >
                {node.label}
              </text>
              <text
                x={p.x}
                y={p.y + r + 40}
                fill={c}
                fontSize={12}
                fontFamily={fonts.mono}
                textAnchor="middle"
              >
                {node.polarity}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{display: 'flex', gap: 18, fontFamily: fonts.mono, fontSize: 13, color: color.faint}}>
        <span style={{color: color.long}}>● confirmed</span>
        <span style={{color: color.short}}>● concern</span>
        <span style={{color: color.watch}}>● inference</span>
        <span style={{color: color.gold}}>● watch / hub</span>
      </div>
    </Stage>
  );
};

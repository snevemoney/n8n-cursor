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
  const H = 680;
  const hasBull = net.nodes.some((n) => n.polarity === 'confirmed');
  const hasBear = net.nodes.some((n) => n.polarity === 'concern');
  const compete = hasBull && hasBear;
  const bullPulse = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(frame / 9));
  const bearPulse = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(frame / 9 + Math.PI));
  const sharedPulse = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(frame / 10));
  const sourcedImportance = net.nodes.some((n) => n.importance !== undefined);
  const maxImp = Math.max(1, ...net.nodes.map((n) => n.importance ?? 0));

  const pos = (id: string) => {
    const node = net.nodes.find((n) => n.id === id);
    if (!node) return {x: 0, y: 0};
    return {x: node.x * W, y: node.y * H};
  };

  const appear = interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dash = -((frame * 2.2) % 28);

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={net.title ?? `${name.ticker} chain`} />
      {net.headline ? (
        <p style={{...display, fontSize: 30, margin: '0 0 8px', maxWidth: 1500}}>{net.headline}</p>
      ) : null}
      <svg width={W} height={H} style={{opacity: appear}}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
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
                strokeWidth={2.2}
                markerEnd="url(#arrow)"
                strokeDasharray="10 8"
                strokeDashoffset={dash}
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
          const pulse =
            compete && node.polarity === 'confirmed'
              ? bullPulse
              : compete && node.polarity === 'concern'
                ? bearPulse
                : sharedPulse;
          const hub = node.id === 'nvda' || node.label === name.ticker;
          const r = sourcedImportance && node.importance !== undefined ? 14 + 16 * (node.importance / maxImp) : hub ? 28 : 20;
          return (
            <g key={node.id}>
              <circle cx={p.x} cy={p.y} r={r + 12} fill={c} opacity={0.12 * pulse} />
              <circle cx={p.x} cy={p.y} r={r} fill={color.panel} stroke={c} strokeWidth={2.5} opacity={0.55 + 0.45 * pulse} />
              <text
                x={p.x}
                y={p.y + r + 20}
                fill={color.text}
                fontSize={15}
                fontFamily={fonts.sans}
                fontWeight={600}
                textAnchor="middle"
              >
                {node.label}
              </text>
              <text x={p.x} y={p.y + r + 36} fill={c} fontSize={11} fontFamily={fonts.mono} textAnchor="middle">
                {node.polarity}
              </text>
              {node.evidence ? (
                <g>
                  <rect
                    x={p.x - 70}
                    y={p.y - r - 28}
                    width={140}
                    height={20}
                    rx={6}
                    fill={color.bgLift}
                    stroke={c}
                    strokeWidth={1}
                  />
                  <text x={p.x} y={p.y - r - 14} fill={c} fontSize={11} fontFamily={fonts.mono} textAnchor="middle">
                    {node.evidence}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={{display: 'flex', gap: 18, fontFamily: fonts.mono, fontSize: 13, color: color.faint}}>
        <span style={{color: color.long}}>● confirmed</span>
        <span style={{color: color.short}}>● concern</span>
        <span style={{color: color.watch}}>● inference</span>
        <span style={{color: color.gold}}>● watch / hub</span>
        {!sourcedImportance ? <span>node size equal — no sourced weights</span> : null}
        {compete ? <span>competing pulses · both sides on tape</span> : null}
      </div>
    </Stage>
  );
};

import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {RatingTone} from '../data/schema';
import {color, fonts} from '../engine/theme';

export const kicker: React.CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 15,
  letterSpacing: 2.4,
  textTransform: 'uppercase',
  color: color.gold,
  fontWeight: 500,
};

export const display: React.CSSProperties = {
  fontFamily: fonts.display,
  color: color.text,
  fontWeight: 400,
  lineHeight: 1.05,
  letterSpacing: -0.6,
};

export const body: React.CSSProperties = {
  fontFamily: fonts.sans,
  color: color.muted,
  fontSize: 28,
  lineHeight: 1.35,
  fontWeight: 400,
};

export const mono: React.CSSProperties = {
  fontFamily: fonts.mono,
  fontVariantNumeric: 'tabular-nums',
};

const toneMap: Record<RatingTone, {fg: string; bg: string}> = {
  long: {fg: color.long, bg: color.longDim},
  watch: {fg: color.watch, bg: color.watchDim},
  caution: {fg: color.caution, bg: 'rgba(255,138,61,0.14)'},
  short: {fg: color.short, bg: color.shortDim},
};

export const toneColor = (tone: RatingTone): string => toneMap[tone].fg;

export const Pill: React.FC<{
  tone: RatingTone;
  children: React.ReactNode;
}> = ({tone, children}) => {
  const t = toneMap[tone];
  return (
    <span
      style={{
        ...mono,
        fontSize: 16,
        letterSpacing: 0.6,
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.fg}33`,
        padding: '6px 12px',
        borderRadius: 999,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
};

export const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}> = ({children, style, accent}) => (
  <div
    style={{
      background: color.panel,
      border: `1px solid ${color.line}`,
      borderRadius: 18,
      padding: 28,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    {accent ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accent,
        }}
      />
    ) : null}
    {children}
  </div>
);

export const Bar: React.FC<{
  label: string;
  valueLabel: string;
  pct: number;
  max?: number;
  color: string;
  delay?: number;
}> = ({label, valueLabel, pct, max = 100, color: barColor, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = delay;
  const t = Math.max(0, Math.min(1, (frame - start) / (fps * 0.7)));
  const eased = 1 - (1 - t) * (1 - t);
  const width = Math.min(100, (Math.abs(pct) / max) * 100) * eased;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <span style={{...mono, fontSize: 18, color: color.muted}}>{label}</span>
        <span style={{...mono, fontSize: 22, color: barColor, fontWeight: 600}}>{valueLabel}</span>
      </div>
      <div style={{height: 8, background: color.bgLift, borderRadius: 99, overflow: 'hidden'}}>
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            background: barColor,
            borderRadius: 99,
          }}
        />
      </div>
    </div>
  );
};

export const Chapter: React.FC<{n: string; title: string}> = ({n, title}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 18}}>
    <span style={{...kicker, color: color.faint}}>{n}</span>
    <span style={{...kicker}}>{title}</span>
  </div>
);

export const ChapterFromLabel: React.FC<{chapter: string; fallback: string}> = ({chapter, fallback}) => {
  const [n, ...rest] = chapter.split('  ');
  const title = rest.join('  ') || fallback;
  return <Chapter n={n} title={title} />;
};

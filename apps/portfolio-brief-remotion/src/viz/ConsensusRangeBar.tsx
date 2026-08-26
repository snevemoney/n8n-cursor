import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {ConsensusRange} from '../data/schema';
import {color, fonts} from '../engine/theme';

/**
 * Consensus vs guide. Whisper zone only if sourced.
 * Missing whisper → label UNKNOWN — do not draw a fake band.
 */
export const ConsensusRangeBar: React.FC<{
  range: ConsensusRange;
  width?: number;
}> = ({range, width = 1680}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [8, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const marks = [
    range.low,
    range.high,
    range.consensus,
    range.guide,
    range.whisper,
  ].filter((n): n is number => n !== undefined);
  if (marks.length === 0) return null;

  const min = Math.min(...marks);
  const max = Math.max(...marks);
  const span = max - min || 1;
  const pad = span * 0.18;
  const lo = min - pad;
  const hi = max + pad;
  const x = (n: number) => ((n - lo) / (hi - lo)) * 100;
  const unit = range.unit ? ` ${range.unit}` : '';

  const ticks: {n: number; label: string; c: string}[] = [];
  if (range.low !== undefined) ticks.push({n: range.low, label: `Low ${range.low}${unit}`, c: color.muted});
  if (range.high !== undefined) ticks.push({n: range.high, label: `High ${range.high}${unit}`, c: color.muted});
  if (range.consensus !== undefined) ticks.push({n: range.consensus, label: `Street ${range.consensus}${unit}`, c: color.gold});
  if (range.guide !== undefined) ticks.push({n: range.guide, label: `Guide ${range.guide}${unit}`, c: color.long});
  if (range.whisper !== undefined) ticks.push({n: range.whisper, label: `Whisper ${range.whisper}${unit}`, c: color.watch});

  const streetLo = range.low ?? range.consensus;
  const streetHi = range.high ?? range.consensus;

  return (
    <div style={{width}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
        <span style={{fontFamily: fonts.mono, fontSize: 14, color: color.gold, letterSpacing: 1.4}}>
          {range.metric.toUpperCase()}
        </span>
        <span style={{fontFamily: fonts.mono, fontSize: 13, color: range.whisper === undefined ? color.watch : color.muted}}>
          WHISPER · {range.whisper === undefined ? 'UNKNOWN' : `${range.whisper}${unit}`}
          {range.guide === undefined ? '   GUIDE · UNKNOWN' : ''}
        </span>
      </div>
      <div style={{position: 'relative', height: 88, background: color.bgLift, borderRadius: 10, border: `1px solid ${color.line}`}}>
        {streetLo !== undefined && streetHi !== undefined ? (
          <div
            style={{
              position: 'absolute',
              left: `${x(streetLo)}%`,
              width: `${Math.max(1.2, x(streetHi) - x(streetLo)) * t}%`,
              top: 22,
              height: 44,
              background: color.goldDim,
              opacity: 0.55,
              borderRadius: 6,
            }}
          />
        ) : null}
        {ticks.map((tick) => (
          <div
            key={`${tick.label}-${tick.n}`}
            style={{
              position: 'absolute',
              left: `${x(tick.n)}%`,
              top: 12,
              width: 3,
              height: 64,
              marginLeft: -1.5,
              background: tick.c,
              opacity: t,
            }}
          />
        ))}
      </div>
      <div style={{display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap'}}>
        {ticks.map((tick) => (
          <span key={tick.label} style={{fontFamily: fonts.mono, fontSize: 14, color: tick.c}}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
};

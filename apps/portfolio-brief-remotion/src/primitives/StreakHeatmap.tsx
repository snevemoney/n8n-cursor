import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {signedPct} from '../data/compute';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, display, mono} from './ui';
import {Rise} from './motion';

export const StreakHeatmap: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const frame = useCurrentFrame();
  const streak = name.streak ?? [];
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} streak`} />
      {name.streakHeadline ? (
        <Rise>
          <p style={{...display, fontSize: 42, margin: '0 0 36px', maxWidth: 1400}}>{name.streakHeadline}</p>
        </Rise>
      ) : null}
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 420}}>
        {streak.map((d, i) => {
          const t = interpolate(frame, [6 + i * 5, 18 + i * 5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const up = d >= 0;
          const h = Math.max(36, Math.abs(d) * 110) * t;
          const last = i === streak.length - 1;
          return (
            <div key={`${name.ticker}-${i}`} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div style={{...mono, fontSize: 22, color: up ? color.long : color.short, fontWeight: 600}}>
                {signedPct(d)}
              </div>
              <div
                style={{
                  width: '100%',
                  height: h,
                  background: up ? color.long : color.short,
                  borderRadius: 10,
                  opacity: 0.35 + 0.65 * t,
                }}
              />
              <div style={{...mono, fontSize: 14, color: color.faint}}>{last ? 'TODAY' : `T−${streak.length - 1 - i}`}</div>
            </div>
          );
        })}
      </div>
      {name.streakNote ? (
        <Rise delay={48}>
          <p style={{fontFamily: fonts.sans, color: color.muted, fontSize: 26, marginTop: 28}}>{name.streakNote}</p>
        </Rise>
      ) : null}
    </Stage>
  );
};

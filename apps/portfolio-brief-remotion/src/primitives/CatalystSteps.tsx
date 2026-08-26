import React from 'react';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

export const CatalystSteps: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const c = name.catalyst;
  if (!c) return null;
  const steps = c.steps ?? [];
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} catalyst`} />
      <Rise>
        <h2 style={{...display, fontSize: 52, maxWidth: 1500, margin: '0 0 32px'}}>{c.headline}</h2>
      </Rise>
      {steps.length > 0 ? (
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, steps.length)}, 1fr)`, gap: 16}}>
          {steps.map((step, i) => (
            <Rise key={step} delay={8 + i * 6}>
              <Panel style={{minHeight: 220}}>
                <div style={{...mono, color: color.gold, fontSize: 18}}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{fontFamily: fonts.sans, fontSize: 26, color: color.text, marginTop: 16, lineHeight: 1.35}}>
                  {step}
                </div>
              </Panel>
            </Rise>
          ))}
        </div>
      ) : null}
      {c.note ? (
        <Rise delay={36}>
          <p style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, marginTop: 28}}>{c.note}</p>
        </Rise>
      ) : null}
    </Stage>
  );
};

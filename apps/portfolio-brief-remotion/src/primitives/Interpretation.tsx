import React from 'react';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill} from './ui';
import {Rise} from './motion';

export const Interpretation: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const block = name.interpretation;
  if (!block) return null;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} read`} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
        {block.chips.map((chip, i) => (
          <Rise key={`${chip.label}-${chip.text}`} delay={i * 8}>
            <Panel>
              <div style={{display: 'flex', gap: 20, alignItems: 'flex-start'}}>
                <Pill tone={chip.tone}>{chip.label}</Pill>
                <div style={{fontFamily: fonts.sans, fontSize: 30, color: color.text, lineHeight: 1.35}}>{chip.text}</div>
              </div>
            </Panel>
          </Rise>
        ))}
        {block.note ? (
          <Rise delay={28}>
            <p style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, marginTop: 8}}>{block.note}</p>
          </Rise>
        ) : null}
      </div>
    </Stage>
  );
};

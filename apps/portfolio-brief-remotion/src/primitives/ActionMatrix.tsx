import React from 'react';
import type {ActionRow, NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill, display, mono, toneColor} from './ui';
import {Rise} from './motion';

export const ActionRows: React.FC<{rows: ActionRow[]; delay?: number; stagger?: number}> = ({
  rows,
  delay = 6,
  stagger = 6,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
    {rows.map((row, i) => (
      <Rise key={`${row.if}-${row.then}`} delay={delay + i * stagger}>
        <Panel accent={toneColor(row.tone)}>
          <div style={{display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: 20, alignItems: 'center'}}>
            <div>
              <div style={{...mono, fontSize: 13, color: color.faint}}>IF</div>
              <div style={{fontFamily: fonts.sans, fontSize: 24, color: color.text, marginTop: 4}}>{row.if}</div>
            </div>
            <div>
              <Pill tone={row.tone}>{row.then}</Pill>
            </div>
          </div>
        </Panel>
      </Rise>
    ))}
  </div>
);

export const ActionMatrix: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const block = name.actionMatrix;
  if (!block) return null;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} action`} />
      {block.headline ? (
        <Rise>
          <p style={{...display, fontSize: 36, margin: '0 0 28px'}}>{block.headline}</p>
        </Rise>
      ) : null}
      <ActionRows rows={block.rows} />
    </Stage>
  );
};

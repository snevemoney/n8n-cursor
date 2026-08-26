import React from 'react';
import {consensusRangeFromBlock} from '../data/formulas';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {ConsensusRangeBar} from '../viz/ConsensusRangeBar';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill, display, mono} from './ui';
import {Rise} from './motion';

export const ConsensusScreen: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const rows = name.consensus?.rows ?? [];
  const range = consensusRangeFromBlock(name.consensus);
  const cols = rows.length === 4 ? 2 : rows.length <= 3 ? rows.length || 1 : 3;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Consensus" />
      {name.rating && name.tone ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
          <div style={{...display, fontSize: 48}}>{name.ticker}</div>
          <Pill tone={name.tone}>{name.rating}</Pill>
        </div>
      ) : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 28}}>
        {rows.map((row, i) => (
          <Rise key={row.label} delay={4 + i * 5}>
            <Panel style={{minHeight: 168}}>
              <div style={{...mono, color: color.faint, fontSize: 14}}>{row.label.toUpperCase()}</div>
              <div style={{...display, fontSize: 36, marginTop: 14}}>{row.value}</div>
            </Panel>
          </Rise>
        ))}
      </div>
      {range ? (
        <Rise delay={18}>
          <ConsensusRangeBar range={range} />
        </Rise>
      ) : (
        <p style={{fontFamily: fonts.sans, color: color.faint, fontSize: 22}}>No sourced consensus range to chart.</p>
      )}
      {name.consensus?.note ? (
        <p style={{fontFamily: fonts.sans, color: color.muted, fontSize: 22, marginTop: 20}}>{name.consensus.note}</p>
      ) : null}
    </Stage>
  );
};

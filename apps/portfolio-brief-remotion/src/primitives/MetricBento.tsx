import React from 'react';
import type {Metric, NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill, display, mono} from './ui';
import {Rise} from './motion';

export const MetricBento: React.FC<{
  name: NameBlock;
  chapter: string;
  metrics: Metric[];
  title?: string;
  note?: string;
}> = ({name, chapter, metrics, title, note}) => {
  const cols = metrics.length <= 3 ? metrics.length : metrics.length === 4 ? 2 : 3;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={title ?? `${name.ticker} metrics`} />
      {name.rating && name.tone ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20}}>
          <div style={{...display, fontSize: 56}}>{name.ticker}</div>
          <Pill tone={name.tone}>{name.rating}</Pill>
        </div>
      ) : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20}}>
        {metrics.map((row, i) => (
          <Rise key={row.label} delay={4 + i * 5}>
            <Panel style={{minHeight: 200}}>
              <div style={{...mono, color: color.faint, fontSize: 15}}>{row.label.toUpperCase()}</div>
              <div style={{...display, fontSize: 40, marginTop: 16}}>{row.value}</div>
              {row.hint ? (
                <div style={{fontFamily: fonts.sans, color: color.muted, marginTop: 10, fontSize: 20}}>{row.hint}</div>
              ) : null}
            </Panel>
          </Rise>
        ))}
      </div>
      {note ? (
        <Rise delay={28}>
          <p style={{fontFamily: fonts.sans, color: color.muted, fontSize: 26, marginTop: 24}}>{note}</p>
        </Rise>
      ) : null}
    </Stage>
  );
};

import React from 'react';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill, display} from './ui';
import {Rise} from './motion';

export const NameAction: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const a = name.action;
  if (!a) return null;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} action`} />
      <Rise>
        <h2 style={{...display, fontSize: 72, margin: 0}}>{a.headline}</h2>
      </Rise>
      {a.body ? (
        <Rise delay={8}>
          <p style={{fontFamily: fonts.sans, fontSize: 32, color: color.muted, maxWidth: 1200, marginTop: 28}}>{a.body}</p>
        </Rise>
      ) : null}
    </Stage>
  );
};

export const NameBoard: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const metrics = name.metrics ?? [];
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={name.chapterTitle ?? name.ticker} />
      <Rise>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24}}>
          <div style={{...display, fontSize: 64}}>{name.ticker}</div>
          {name.rating && name.tone ? <Pill tone={name.tone}>{name.rating}</Pill> : null}
        </div>
      </Rise>
      {name.copy?.headline ? (
        <p style={{...display, fontSize: 36, margin: '0 0 24px', maxWidth: 1400}}>{name.copy.headline}</p>
      ) : null}
      {metrics.length > 0 ? (
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, metrics.length)}, 1fr)`, gap: 16}}>
          {metrics.map((row, i) => (
            <Rise key={row.label} delay={6 + i * 5}>
              <Panel>
                <div style={{fontFamily: fonts.mono, color: color.faint, fontSize: 14}}>{row.label}</div>
                <div style={{...display, fontSize: 40, marginTop: 10}}>{row.value}</div>
              </Panel>
            </Rise>
          ))}
        </div>
      ) : null}
      {name.copy?.body ? (
        <Rise delay={28}>
          <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.muted, marginTop: 28, maxWidth: 1400}}>
            {name.copy.body}
          </p>
        </Rise>
      ) : null}
    </Stage>
  );
};

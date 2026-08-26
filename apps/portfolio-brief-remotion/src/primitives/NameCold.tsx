import React from 'react';
import {brokenRedStreakLength} from '../data/compute';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill, display, mono} from './ui';
import {Count, Rise} from './motion';

export const NameCold: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const broken = name.streak ? brokenRedStreakLength(name.streak) : null;
  const dayColor = name.dayPct === undefined ? color.text : name.dayPct >= 0 ? color.long : color.short;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={name.chapterTitle ?? name.ticker} />
      <Rise>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 28}}>
          <div style={{...display, fontSize: 128, lineHeight: 0.9}}>{name.ticker}</div>
          {name.rating && name.tone ? <Pill tone={name.tone}>{name.rating}</Pill> : null}
        </div>
      </Rise>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginTop: 48}}>
        <Rise delay={8}>
          <Panel>
            <div style={{...mono, color: color.faint, fontSize: 15}}>CLOSE</div>
            <div style={{...display, fontSize: 72, marginTop: 8}}>
              {name.price !== undefined ? (
                <>
                  $<Count value={name.price} decimals={2} />
                </>
              ) : (
                'n/a'
              )}
            </div>
          </Panel>
        </Rise>
        <Rise delay={14}>
          <Panel accent={dayColor}>
            <div style={{...mono, color: color.faint, fontSize: 15}}>TODAY</div>
            <div style={{...display, fontSize: 72, marginTop: 8, color: dayColor}}>
              {name.dayPct !== undefined ? <Count value={name.dayPct} decimals={2} suffix="%" signed /> : 'n/a'}
            </div>
            {broken !== null ? (
              <div style={{fontFamily: fonts.sans, color: color.muted, marginTop: 10, fontSize: 22}}>
                Broke a {broken}-session losing streak
              </div>
            ) : null}
          </Panel>
        </Rise>
        <Rise delay={20}>
          <Panel>
            <div style={{...mono, color: color.faint, fontSize: 15}}>HOLD TONIGHT</div>
            <div style={{...display, fontSize: 44, marginTop: 16}}>{name.holdNote ?? name.rating ?? 'n/a'}</div>
          </Panel>
        </Rise>
      </div>
    </Stage>
  );
};

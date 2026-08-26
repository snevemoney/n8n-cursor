import React from 'react';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

export const OptionsBand: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const opt = name.options;
  if (!opt) return null;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} options`} />
      <Rise>
        <div style={{...display, fontSize: 88}}>±{opt.movePct}%</div>
      </Rise>
      {opt.note ? (
        <Rise delay={8}>
          <p style={{fontFamily: fonts.sans, fontSize: 32, color: color.muted, marginTop: 8}}>{opt.note}</p>
        </Rise>
      ) : null}
      <Rise delay={18}>
        <div style={{display: 'flex', gap: 20, marginTop: 48}}>
          <Panel accent={color.short} style={{flex: 1}}>
            <div style={{...mono, color: color.short}}>DOWNSIDE BAND</div>
            <div style={{...display, fontSize: 64, marginTop: 8}}>${opt.range[0]}</div>
          </Panel>
          <Panel style={{flex: 1}}>
            <div style={{...mono, color: color.muted}}>SPOT</div>
            <div style={{...display, fontSize: 64, marginTop: 8}}>
              {name.price !== undefined ? `$${name.price.toFixed(0)}` : 'n/a'}
            </div>
          </Panel>
          <Panel accent={color.long} style={{flex: 1}}>
            <div style={{...mono, color: color.long}}>UPSIDE BAND</div>
            <div style={{...display, fontSize: 64, marginTop: 8}}>${opt.range[1]}</div>
          </Panel>
        </div>
      </Rise>
    </Stage>
  );
};

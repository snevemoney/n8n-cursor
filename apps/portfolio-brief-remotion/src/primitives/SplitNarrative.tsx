import React from 'react';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

export const SplitNarrative: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const n = name.narrative;
  if (!n) return null;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Narrative vs reality" />
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: 700}}>
        <Rise>
          <Panel accent={color.short} style={{height: '100%'}}>
            <div style={{...mono, color: color.short, fontSize: 15}}>{n.leftTitle}</div>
            <h3 style={{...display, fontSize: 40, margin: '16px 0'}}>{n.leftHeadline}</h3>
            <p style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, lineHeight: 1.45}}>{n.leftBody}</p>
          </Panel>
        </Rise>
        <Rise delay={10}>
          <Panel accent={color.long} style={{height: '100%'}}>
            <div style={{...mono, color: color.long, fontSize: 15}}>{n.rightTitle}</div>
            <h3 style={{...display, fontSize: 40, margin: '16px 0'}}>{n.rightHeadline}</h3>
            <p style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, lineHeight: 1.45}}>{n.rightBody}</p>
          </Panel>
        </Rise>
      </div>
    </Stage>
  );
};

import React from 'react';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

export const RiskTrio: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const risks = report.risks ?? [];
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Risks" />
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, risks.length)}, 1fr)`, gap: 20}}>
        {risks.map((r, i) => (
          <Rise key={r.n} delay={i * 8}>
            <Panel style={{minHeight: 520}}>
              <div style={{...mono, color: color.gold, fontSize: 18}}>{r.n}</div>
              <div style={{...display, fontSize: 36, marginTop: 18}}>{r.title}</div>
              <p style={{fontFamily: fonts.sans, fontSize: 24, color: color.muted, lineHeight: 1.4, marginTop: 20}}>{r.body}</p>
            </Panel>
          </Rise>
        ))}
      </div>
    </Stage>
  );
};

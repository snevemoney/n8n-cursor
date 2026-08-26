import React from 'react';
import type {DailyReport, Scenario} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {Bar, ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

const kindColor = (kind: Scenario['kind']): string => {
  switch (kind) {
    case 'bear':
      return color.short;
    case 'base':
      return color.watch;
    case 'bull':
      return color.long;
    default: {
      const _n: never = kind;
      return _n;
    }
  }
};

export const ScenarioCards: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => (
  <Stage>
    <ChapterFromLabel chapter={chapter} fallback="Scenarios" />
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, report.scenarios.length)}, 1fr)`, gap: 20}}>
      {report.scenarios.map((s, i) => (
        <Rise key={s.kind} delay={i * 8}>
          <Panel accent={kindColor(s.kind)} style={{minHeight: 420}}>
            <div style={{...mono, color: kindColor(s.kind), fontSize: 14}}>{s.kind.toUpperCase()}</div>
            <div style={{...display, fontSize: 36, marginTop: 14}}>{s.title}</div>
            <p style={{fontFamily: fonts.sans, fontSize: 24, color: color.muted, lineHeight: 1.4, marginTop: 16}}>{s.body}</p>
            {s.probability !== undefined ? (
              <div style={{marginTop: 28}}>
                <Bar
                  label="Probability"
                  valueLabel={`${s.probability}%`}
                  pct={s.probability}
                  max={100}
                  color={kindColor(s.kind)}
                />
              </div>
            ) : (
              <div style={{...mono, color: color.faint, marginTop: 28, fontSize: 16}}>probability n/a</div>
            )}
          </Panel>
        </Rise>
      ))}
    </div>
  </Stage>
);

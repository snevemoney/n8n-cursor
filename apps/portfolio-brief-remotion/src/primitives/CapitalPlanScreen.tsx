import React from 'react';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {ActionRows} from './ActionMatrix';
import {Rise} from './motion';

export const CapitalPlanScreen: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const p = report.capitalPlan;
  const rows: {k: string; v: string}[] = [
    {k: 'Existing portfolio', v: p.existingPortfolio},
    {k: 'Fresh capital', v: p.freshCapital},
    {k: 'Best current add', v: p.bestAdd},
    {k: 'Highest-upside watch', v: p.highestUpsideWatch},
    {k: 'Biggest portfolio risk', v: p.biggestRisk},
    {k: 'Next decision trigger', v: p.nextTrigger},
  ];
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Capital plan" />
      <Rise>
        <h2 style={{...display, fontSize: 52, margin: '0 0 22px'}}>TODAY’S CAPITAL PLAN</h2>
      </Rise>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18}}>
        {rows.map((row, i) => (
          <Rise key={row.k} delay={4 + i * 3}>
            <Panel style={{padding: '16px 20px'}}>
              <div style={{...mono, fontSize: 13, color: color.gold, letterSpacing: 1.2}}>{row.k.toUpperCase()}</div>
              <div style={{fontFamily: fonts.sans, fontSize: 24, color: color.text, marginTop: 6, lineHeight: 1.3}}>
                {row.v}
              </div>
            </Panel>
          </Rise>
        ))}
      </div>
      <ActionRows rows={p.ifThen} delay={10} stagger={4} />
    </Stage>
  );
};

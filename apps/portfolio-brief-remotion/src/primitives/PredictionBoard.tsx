import React from 'react';
import {buildPredictionBoard} from '../data/formulas';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

export const PredictionBoard: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const rows = buildPredictionBoard(report);
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Board" />
      <Rise>
        <h2 style={{...display, fontSize: 48, margin: '0 0 8px'}}>Prediction board</h2>
        <p style={{fontFamily: fonts.sans, fontSize: 22, color: color.muted, margin: '0 0 22px'}}>
          Named formulas only. Missing inputs stay UNKNOWN.
        </p>
      </Rise>
      <div style={{display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1fr 1.4fr', gap: 0, padding: '0 8px 10px', borderBottom: `1px solid ${color.line}`}}>
        {['ROW', 'READ', 'STATUS', 'INPUTS'].map((h) => (
          <div key={h} style={{...mono, fontSize: 13, letterSpacing: 1.6, color: color.faint}}>
            {h}
          </div>
        ))}
      </div>
      {rows.map((row, i) => {
        const unknown = row.status !== 'ok';
        return (
          <Rise key={row.id} delay={4 + i * 4} from={12}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.4fr 1fr 1.4fr',
                alignItems: 'center',
                padding: '16px 8px',
                borderBottom: `1px solid ${color.line}`,
              }}
            >
              <div style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 24}}>{row.label}</div>
              <div style={{...mono, fontSize: 22, color: unknown ? color.faint : color.gold}}>
                {unknown ? 'UNKNOWN' : `${row.value}${row.unit ? ` ${row.unit}` : ''}`}
              </div>
              <div style={{...mono, fontSize: 14, color: unknown ? color.watch : color.long}}>
                {unknown ? 'INPUTS MISSING' : row.formulaId}
              </div>
              <div style={{fontFamily: fonts.mono, fontSize: 14, color: color.faint}}>{row.inputs.join(' · ')}</div>
            </div>
          </Rise>
        );
      })}
      <Rise delay={32}>
        <Panel style={{marginTop: 18, padding: '14px 18px'}}>
          <div style={{...mono, fontSize: 13, color: color.gold}}>NO DECORATIVE SCORES</div>
          <div style={{fontFamily: fonts.sans, fontSize: 20, color: color.muted, marginTop: 6}}>
            A score does not exist unless a named formula and its inputs are on this episode.
          </div>
        </Panel>
      </Rise>
    </Stage>
  );
};

import React from 'react';
import {signedPct} from '../data/compute';
import type {DailyReport} from '../data/schema';
import {worldTapeLanes, type TapeRow} from '../data/view';
import {Stage} from '../chrome/Stage';
import {color, fonts} from '../engine/theme';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

const rowLine = (row: TapeRow) => {
  const bits: string[] = [];
  if (row.value) bits.push(row.value);
  if (row.dayPct !== undefined) bits.push(signedPct(row.dayPct));
  if (row.note && bits.length === 0) bits.push(row.note);
  return bits.join('  ');
};

export const WorldTape: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const lanes = worldTapeLanes(report);
  const cols = lanes.length <= 1 ? '1fr' : lanes.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr';

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="World tape" />
      {lanes.length === 0 ? (
        <Rise>
          <h2 style={{...display, fontSize: 56, margin: 0}}>No sourced world tape today.</h2>
          <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.muted, marginTop: 16}}>
            GLOBAL / US / CA lanes stay collapsed until a filing or index page is written in. Do not invent a TSX print.
          </p>
        </Rise>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: cols, gap: 18, height: 720}}>
          {lanes.map((lane, i) => (
            <Rise key={lane.key} delay={i * 6} style={{height: '100%'}}>
              <Panel style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{...mono, color: color.gold, fontSize: 16, letterSpacing: 2}}>{lane.key}</div>
                <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
                  {lane.rows.map((row) => (
                    <div key={`${lane.key}-${row.label}`}>
                      <div style={{...mono, fontSize: 14, color: color.faint, letterSpacing: 1.2}}>{row.label}</div>
                      <div style={{...display, fontSize: 36, marginTop: 4}}>
                        {rowLine(row) || 'sourced note only'}
                      </div>
                      {row.note && row.value ? (
                        <div style={{fontFamily: fonts.sans, fontSize: 18, color: color.muted, marginTop: 4}}>
                          {row.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                {lane.note ? (
                  <p style={{fontFamily: fonts.sans, fontSize: 22, color: color.muted, margin: '16px 0 0', lineHeight: 1.35}}>
                    {lane.note}
                  </p>
                ) : null}
              </Panel>
            </Rise>
          ))}
        </div>
      )}
    </Stage>
  );
};

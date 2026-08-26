import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {DailyReport} from '../data/schema';
import {opportunityFunnel} from '../data/view';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

export const OpportunityRadar: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const frame = useCurrentFrame();
  const funnel = opportunityFunnel(report);
  const max = Math.max(1, ...funnel.gates.map((g) => g.count));

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Radar" />
      <div style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 28, height: 700}}>
        <div>
          <Rise>
            <h2 style={{...display, fontSize: 52, margin: '0 0 8px'}}>Candidate funnel</h2>
            <p style={{fontFamily: fonts.sans, fontSize: 22, color: color.muted, margin: '0 0 22px'}}>
              {funnel.passed} passed. Closest fails only if they sit on the scout tape.
            </p>
          </Rise>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
            {funnel.gates.map((gate, i) => {
              const t = interpolate(frame, [6 + i * 6, 18 + i * 6], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const width = 36 + (gate.count / max) * 64;
              const last = i === funnel.gates.length - 1;
              return (
                <div key={gate.id} style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: t}}>
                  <div
                    style={{
                      width: `${width}%`,
                      minWidth: 220,
                      background: last ? color.panelHot : color.panel,
                      border: `1px solid ${last ? color.gold : color.line}`,
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{fontFamily: fonts.sans, fontSize: 22, color: color.text}}>{gate.label}</span>
                    <span style={{...mono, fontSize: 28, color: last ? color.gold : color.text}}>{gate.count}</span>
                  </div>
                  {i < funnel.gates.length - 1 ? (
                    <div style={{width: 1, height: 12, background: color.lineHot}} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <Rise delay={16}>
          <Panel style={{height: '100%'}}>
            <div style={{...mono, color: color.gold, fontSize: 14, letterSpacing: 1.6}}>CLOSEST FAILS</div>
            {funnel.closestFails.length === 0 ? (
              <p style={{...display, fontSize: 40, marginTop: 20, lineHeight: 1.15}}>No close fails on book</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18}}>
                {funnel.closestFails.map((fail) => (
                  <div key={fail.ticker}>
                    <div style={{...display, fontSize: 36}}>{fail.ticker}</div>
                    <div style={{fontFamily: fonts.sans, fontSize: 20, color: color.muted, marginTop: 6}}>{fail.reason}</div>
                  </div>
                ))}
              </div>
            )}
            <p style={{fontFamily: fonts.sans, fontSize: 20, color: color.faint, marginTop: 28}}>
              We will not invent a Next-NVDA name to fill this pane.
            </p>
          </Panel>
        </Rise>
      </div>
    </Stage>
  );
};

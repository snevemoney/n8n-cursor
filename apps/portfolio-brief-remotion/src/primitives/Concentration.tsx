import React from 'react';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display} from './ui';
import {Rise} from './motion';

export const Concentration: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const p = report.portfolio;
  if (!p) return null;
  const stack = p.factorStack ?? [];
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Concentration" />
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, height: 700}}>
        <Rise>
          <h2 style={{...display, fontSize: 58, margin: 0, maxWidth: 760}}>{p.concentrationThesis}</h2>
          {p.concentrationBody ? (
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 28,
                color: color.muted,
                lineHeight: 1.45,
                marginTop: 28,
                maxWidth: 740,
              }}
            >
              {p.concentrationBody}
            </p>
          ) : null}
        </Rise>
        <Rise delay={10}>
          <Panel style={{height: '100%'}}>
            <div style={{fontFamily: fonts.mono, color: color.gold, letterSpacing: 1.6, fontSize: 14}}>SHARED FACTOR</div>
            <div style={{...display, fontSize: 36, margin: '12px 0 28px'}}>{p.factorLabel ?? 'Factor stack'}</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              {stack.map((t, i) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: color.bgLift,
                    border: `1px solid ${color.line}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginLeft: i * 18,
                  }}
                >
                  <span style={{fontFamily: fonts.mono, color: color.gold, fontSize: 16}}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 26, color: color.text}}>{t}</span>
                  <span style={{marginLeft: 'auto', fontFamily: fonts.sans, color: color.faint, fontSize: 18}}>
                    {p.overlapNote ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </Rise>
      </div>
    </Stage>
  );
};

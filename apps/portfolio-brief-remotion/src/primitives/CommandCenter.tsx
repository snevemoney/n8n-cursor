import React from 'react';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {Pill, display, mono} from './ui';
import {Rise} from './motion';

export const CommandCenter: React.FC<{report: DailyReport}> = ({report}) => {
  const c = report.close;
  return (
    <Stage>
      <Rise>
        <div style={display}>
          {c.kicker ? (
            <div style={{fontSize: 22, fontFamily: fonts.mono, color: color.gold, letterSpacing: 2, marginBottom: 18}}>
              {c.kicker}
            </div>
          ) : null}
          <h2 style={{...display, fontSize: 64, maxWidth: 1500, margin: 0}}>{c.headline}</h2>
        </div>
      </Rise>
      <Rise delay={10}>
        <p style={{fontFamily: fonts.sans, fontSize: 30, color: color.muted, maxWidth: 1300, marginTop: 24, lineHeight: 1.4}}>
          {c.body}
        </p>
      </Rise>
      {c.pills && c.pills.length > 0 ? (
        <Rise delay={18}>
          <div style={{display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap'}}>
            {c.pills.map((p) => (
              <Pill key={p.label} tone={p.tone}>
                {p.label}
              </Pill>
            ))}
          </div>
        </Rise>
      ) : null}
      {c.followThrough && c.followThrough.length > 0 ? (
        <Rise delay={24}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 28}}>
            {c.followThrough.map((row) => (
              <div
                key={row.if}
                style={{
                  background: color.panel,
                  border: `1px solid ${color.line}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div style={{...mono, color: color.gold, fontSize: 12}}>IF</div>
                <div style={{fontFamily: fonts.sans, fontSize: 20, color: color.text, margin: '6px 0 10px'}}>{row.if}</div>
                <div style={{...mono, color: color.faint, fontSize: 12}}>THEN</div>
                <div style={{fontFamily: fonts.sans, fontSize: 18, color: color.muted, marginTop: 4}}>{row.then}</div>
              </div>
            ))}
          </div>
        </Rise>
      ) : null}
    </Stage>
  );
};

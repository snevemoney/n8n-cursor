import React from 'react';
import type {DailyReport, UnknownStatus} from '../data/schema';
import {flagMissing, pickUnknowns} from '../data/unknowns';
import {Stage} from '../chrome/Stage';
import {color, fonts} from '../engine/theme';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

const statusColor = (status: UnknownStatus): string => {
  switch (status) {
    case 'unknown':
      return color.watch;
    case 'partial':
      return color.caution;
    case 'blocked':
      return color.short;
    default: {
      const _n: never = status;
      return _n;
    }
  }
};

export const KnownUnknowns: React.FC<{
  report: DailyReport;
  chapter: string;
  limit?: number;
}> = ({report, chapter, limit}) => {
  const rows = pickUnknowns(report, limit);
  const gaps = flagMissing(report);

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Unknowns" />
      <Rise>
        <h2 style={{...display, fontSize: rows.length > 3 ? 44 : 52, margin: '0 0 14px'}}>What we cannot claim tonight</h2>
      </Rise>
      {rows.length === 0 ? (
        <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.muted}}>No open questions written.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: rows.length > 3 ? '1fr 1fr' : '1fr',
            gap: 10,
          }}
        >
          {rows.map((row, i) => (
            <Rise key={row.id} delay={4 + i * 4}>
              <Panel accent={statusColor(row.status)} style={{padding: '14px 18px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4}}>
                  <span style={{...mono, fontSize: 12, color: statusColor(row.status), letterSpacing: 1.2}}>
                    {row.status.toUpperCase()}
                  </span>
                  <span style={{...mono, fontSize: 12, color: color.gold}}>{row.area.toUpperCase()}</span>
                  {row.ticker ? <span style={{...mono, fontSize: 12, color: color.muted}}>{row.ticker}</span> : null}
                </div>
                <div style={{fontFamily: fonts.sans, fontSize: rows.length > 3 ? 22 : 26, color: color.text, lineHeight: 1.25}}>
                  {row.question}
                </div>
                <div style={{fontFamily: fonts.sans, fontSize: 18, color: color.muted, marginTop: 4, lineHeight: 1.3}}>
                  Why it matters · {row.whyItMatters}
                </div>
                <div style={{...mono, fontSize: 14, color: color.faint, marginTop: 6}}>
                  We would need · {row.neededToKnow}
                </div>
                {row.confidence ? (
                  <div style={{...mono, fontSize: 13, color: color.gold, marginTop: 6}}>
                    {row.confidence.label} {row.confidence.value}/{row.confidence.max} · {row.confidence.source}
                  </div>
                ) : null}
              </Panel>
            </Rise>
          ))}
        </div>
      )}
      {gaps.length > 0 ? (
        <Rise delay={20}>
          <div style={{...mono, fontSize: 13, color: color.faint, marginTop: 16, letterSpacing: 0.6}}>
            MISSING FIELDS · {gaps.join(' · ')}
          </div>
        </Rise>
      ) : null}
    </Stage>
  );
};

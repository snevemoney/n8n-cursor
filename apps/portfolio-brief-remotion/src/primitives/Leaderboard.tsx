import React from 'react';
import {hasOverlap, signedPct} from '../data/compute';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Pill, mono} from './ui';
import {Rise} from './motion';

export const Leaderboard: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => (
  <Stage>
    <ChapterFromLabel chapter={chapter} fallback="Holdings" />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 160px 340px 160px 1fr',
        gap: 0,
        borderBottom: `1px solid ${color.line}`,
        paddingBottom: 12,
        marginBottom: 6,
      }}
    >
      {['#', 'HOLDING', 'MY RATING', 'YTD', 'WHAT MATTERS NOW'].map((h) => (
        <div key={h} style={{...mono, fontSize: 13, letterSpacing: 1.8, color: color.faint}}>
          {h}
        </div>
      ))}
    </div>
    {report.holdings.map((h, i) => (
      <Rise key={h.ticker} delay={4 + i * 5} from={16}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '72px 160px 340px 160px 1fr',
            alignItems: 'center',
            padding: '16px 0',
            borderBottom: `1px solid ${color.line}`,
          }}
        >
          <div style={{...mono, fontSize: 18, color: color.gold}}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 30, color: color.text}}>
            {h.ticker}
            {hasOverlap(h) ? (
              <span style={{...mono, fontSize: 12, color: color.caution, marginLeft: 8}}>OVERLAP</span>
            ) : null}
          </div>
          <div>
            <Pill tone={h.tone}>{h.rating}</Pill>
          </div>
          <div style={{...mono, fontSize: 20, color: h.ytd === undefined ? color.faint : h.ytd >= 0 ? color.long : color.short}}>
            {h.ytd === undefined ? 'n/a' : signedPct(h.ytd, 1)}
          </div>
          <div style={{fontFamily: fonts.sans, fontSize: 24, color: color.muted}}>{h.whatMatters}</div>
        </div>
      </Rise>
    ))}
  </Stage>
);

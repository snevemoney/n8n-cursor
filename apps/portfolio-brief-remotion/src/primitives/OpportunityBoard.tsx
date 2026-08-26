import React from 'react';
import type {DailyReport} from '../data/schema';
import {visibleOpportunities} from '../data/view';
import {Stage} from '../chrome/Stage';
import {color, fonts} from '../engine/theme';
import {ChapterFromLabel, Panel, Pill, display, mono} from './ui';
import {Rise} from './motion';

export const OpportunityBoard: React.FC<{
  report: DailyReport;
  chapter: string;
  limit?: number;
}> = ({report, chapter, limit}) => {
  const all = visibleOpportunities(report);
  const rows = limit === undefined ? all : all.slice(0, limit);

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Opportunity" />
      {rows.length === 0 ? (
        <Rise>
          <h2 style={{...display, fontSize: 64, margin: 0, maxWidth: 1400}}>No new names today.</h2>
          <p style={{fontFamily: fonts.sans, fontSize: 30, color: color.muted, marginTop: 24, maxWidth: 1100}}>
            The scout board stays empty until a sourced name that is not already in the book is written into
            opportunities.candidates. Do not invent a ticker.
          </p>
        </Rise>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          {rows.map((c, i) => (
            <Rise key={c.ticker} delay={i * 6}>
              <Panel>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10}}>
                  <div style={{...display, fontSize: 40}}>{c.ticker}</div>
                  <span style={{...mono, fontSize: 14, color: color.gold}}>{c.market}</span>
                  <Pill tone={c.tone}>{c.tone.toUpperCase()}</Pill>
                </div>
                <div style={{fontFamily: fonts.sans, fontSize: 26, color: color.text, lineHeight: 1.35}}>{c.thesis}</div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14}}>
                  <div>
                    <div style={{...mono, fontSize: 13, color: color.gold}}>WHY NOW</div>
                    <div style={{fontFamily: fonts.sans, fontSize: 22, color: color.muted, marginTop: 4}}>{c.whyNow}</div>
                  </div>
                  <div>
                    <div style={{...mono, fontSize: 13, color: color.short}}>WHAT KILLS IT</div>
                    <div style={{fontFamily: fonts.sans, fontSize: 22, color: color.muted, marginTop: 4}}>{c.whatKillsIt}</div>
                  </div>
                </div>
                {c.relativeToBook ? (
                  <div style={{fontFamily: fonts.sans, fontSize: 20, color: color.faint, marginTop: 12}}>
                    vs book · {c.relativeToBook}
                  </div>
                ) : null}
              </Panel>
            </Rise>
          ))}
        </div>
      )}
    </Stage>
  );
};

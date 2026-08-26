import React from 'react';
import type {DailyReport} from '../data/schema';
import {featuredScout} from '../data/view';
import {Stage} from '../chrome/Stage';
import {color, fonts} from '../engine/theme';
import {ChapterFromLabel, Panel, Pill, display, mono} from './ui';
import {Rise} from './motion';

export const ScoutCard: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const card = featuredScout(report);

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Scout" />
      {!card ? (
        <Rise>
          <h2 style={{...display, fontSize: 64, margin: 0}}>No scout card today.</h2>
          <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.muted, marginTop: 20, maxWidth: 1100}}>
            Empty is correct. A player card renders only when nextNvda[] or opportunities.candidates has a sourced row.
          </p>
        </Rise>
      ) : (
        <Rise>
          <Panel
            accent={color.gold}
            style={{
              border: `1px solid ${color.gold}`,
              background: color.panelHot,
              padding: 40,
              minHeight: 620,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{...mono, color: color.gold, fontSize: 16, letterSpacing: 2}}>
              {card.source === 'opportunity' ? 'OPPORTUNITY' : 'NEXT NVDA'}
              {card.market ? ` · ${card.market}` : ''}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 12}}>
              <h2 style={{...display, fontSize: 96, margin: 0}}>{card.ticker}</h2>
              {card.tone ? <Pill tone={card.tone}>{card.tone.toUpperCase()}</Pill> : null}
            </div>
            <p style={{fontFamily: fonts.sans, fontSize: 32, color: color.text, marginTop: 20, maxWidth: 1400, lineHeight: 1.35}}>
              {card.thesis}
            </p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 36}}>
              <div>
                <div style={{...mono, fontSize: 14, color: color.gold, letterSpacing: 1.4}}>WHY NOW</div>
                <div style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, marginTop: 8, lineHeight: 1.35}}>
                  {card.whyNow ?? 'n/a'}
                </div>
              </div>
              <div>
                <div style={{...mono, fontSize: 14, color: color.short, letterSpacing: 1.4}}>WHAT KILLS IT</div>
                <div style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, marginTop: 8, lineHeight: 1.35}}>
                  {card.whatKillsIt ?? 'n/a'}
                </div>
              </div>
            </div>
            {card.relativeToBook ? (
              <div style={{...mono, fontSize: 16, color: color.faint, marginTop: 28}}>VS BOOK · {card.relativeToBook}</div>
            ) : null}
          </Panel>
        </Rise>
      )}
    </Stage>
  );
};

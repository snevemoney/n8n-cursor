import React from 'react';
import type {DailyReport, MarketVenue} from '../data/schema';
import {calendarItems} from '../data/view';
import {Stage} from '../chrome/Stage';
import {color, fonts} from '../engine/theme';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Rise} from './motion';

const venueColor = (where: MarketVenue): string => {
  switch (where) {
    case 'US':
      return color.watch;
    case 'CA':
      return color.long;
    case 'GLOBAL':
      return color.gold;
    default: {
      const _n: never = where;
      return _n;
    }
  }
};

export const CatalystCalendar: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const items = calendarItems(report);
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Calendar" />
      <Rise>
        <h2 style={{...display, fontSize: 52, margin: '0 0 22px'}}>Next sessions</h2>
      </Rise>
      {items.length === 0 ? (
        <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.muted}}>No sourced calendar rows today.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          {items.map((item, i) => (
            <Rise key={`${item.when}-${item.label}`} delay={i * 6}>
              <div style={{display: 'flex', gap: 18, alignItems: 'stretch'}}>
                <div style={{width: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 99,
                      background: venueColor(item.where),
                      boxShadow: `0 0 10px ${venueColor(item.where)}`,
                      marginTop: 22,
                      flexShrink: 0,
                    }}
                  />
                  {i < items.length - 1 ? (
                    <div style={{width: 2, flex: 1, background: color.lineHot, marginTop: 8}} />
                  ) : null}
                </div>
                <Panel style={{flex: 1, padding: '18px 22px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8}}>
                    <span style={{...mono, fontSize: 15, color: color.gold, letterSpacing: 1.4}}>{item.when.toUpperCase()}</span>
                    <span style={{...mono, fontSize: 13, color: venueColor(item.where), letterSpacing: 1.2}}>{item.where}</span>
                  </div>
                  <div style={{...display, fontSize: 40}}>{item.label}</div>
                  <p style={{fontFamily: fonts.sans, fontSize: 24, color: color.muted, margin: '8px 0 0', lineHeight: 1.35}}>
                    {item.why}
                  </p>
                </Panel>
              </div>
            </Rise>
          ))}
        </div>
      )}
    </Stage>
  );
};

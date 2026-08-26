import React from 'react';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, display, mono} from './ui';
import {Count, Rise} from './motion';

export const MarketTape: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const m = report.market;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Market tape" />
      <div style={{display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 28, height: 720}}>
        <Rise>
          <Panel style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <div style={{...mono, color: color.muted, fontSize: 18, letterSpacing: 1.6}}>S&P 500</div>
            <div style={{...display, fontSize: 108, marginTop: 8}}>
              {m.spxClose !== undefined ? <Count value={m.spxClose} decimals={2} /> : 'n/a'}
            </div>
            <div style={{display: 'flex', gap: 28, marginTop: 20}}>
              {m.spxDayPct !== undefined ? (
                <div>
                  <div style={{...mono, color: color.faint, fontSize: 14}}>TODAY</div>
                  <div style={{...mono, color: m.spxDayPct >= 0 ? color.long : color.short, fontSize: 36, fontWeight: 600}}>
                    <Count value={m.spxDayPct} decimals={2} suffix="%" signed />
                  </div>
                </div>
              ) : null}
              {m.spxYtdPct !== undefined ? (
                <div>
                  <div style={{...mono, color: color.faint, fontSize: 14}}>YTD</div>
                  <div style={{...mono, color: m.spxYtdPct >= 0 ? color.long : color.short, fontSize: 36, fontWeight: 600}}>
                    <Count value={m.spxYtdPct} decimals={1} suffix="%" signed />
                  </div>
                </div>
              ) : null}
              {m.nasdaqDayPct !== undefined ? (
                <div>
                  <div style={{...mono, color: color.faint, fontSize: 14}}>NASDAQ</div>
                  <div
                    style={{
                      ...mono,
                      color: m.nasdaqDayPct >= 0 ? color.long : color.short,
                      fontSize: 36,
                      fontWeight: 600,
                    }}
                  >
                    <Count value={m.nasdaqDayPct} decimals={2} suffix="%" delay={6} signed />
                  </div>
                </div>
              ) : null}
              {m.tenYearYield !== undefined ? (
                <div>
                  <div style={{...mono, color: color.faint, fontSize: 14}}>10Y</div>
                  <div style={{...mono, color: color.text, fontSize: 36, fontWeight: 600}}>{m.tenYearYield}%</div>
                </div>
              ) : null}
            </div>
          </Panel>
        </Rise>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
          {m.note ? (
            <Rise delay={8}>
              <Panel>
                <div style={{...mono, color: color.gold, fontSize: 15, letterSpacing: 1.5}}>WHAT HELPED</div>
                <p style={{fontFamily: fonts.sans, fontSize: 30, color: color.text, lineHeight: 1.4, margin: '14px 0 0'}}>
                  {m.note}
                </p>
              </Panel>
            </Rise>
          ) : null}
          {m.nextCalendar ? (
            <Rise delay={16}>
              <Panel accent={color.watch} style={{flex: 1}}>
                <div style={{...mono, color: color.watch, fontSize: 15, letterSpacing: 1.5}}>NEXT</div>
                <p style={{...display, fontSize: 46, color: color.text, margin: '16px 0 0'}}>{m.nextCalendar.label}</p>
                {m.nextCalendar.detail ? (
                  <p style={{fontFamily: fonts.sans, fontSize: 24, color: color.muted, marginTop: 16}}>
                    {m.nextCalendar.detail}
                  </p>
                ) : null}
              </Panel>
            </Rise>
          ) : null}
        </div>
      </div>
    </Stage>
  );
};

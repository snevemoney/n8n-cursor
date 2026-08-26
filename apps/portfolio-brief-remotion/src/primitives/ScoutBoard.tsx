import React from 'react';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, Panel, Pill, display} from './ui';
import {Rise} from './motion';

export const ScoutBoard: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => (
  <Stage>
    <ChapterFromLabel chapter={chapter} fallback="Next NVDA" />
    {report.nextNvda.length === 0 ? (
      <Rise>
        <h2 style={{...display, fontSize: 64, margin: 0, maxWidth: 1400}}>No Next-NVDA candidate named today.</h2>
        <p style={{fontFamily: fonts.sans, fontSize: 30, color: color.muted, marginTop: 24, maxWidth: 1100}}>
          The sleeve stays empty until the report names an asymmetric name. Do not invent one in the render.
        </p>
      </Rise>
    ) : (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {report.nextNvda.map((c, i) => (
          <Rise key={c.ticker} delay={i * 6}>
            <Panel>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10}}>
                <div style={{...display, fontSize: 40}}>{c.ticker}</div>
                {c.tone ? <Pill tone={c.tone}>WATCH</Pill> : null}
              </div>
              <div style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted}}>{c.thesis}</div>
            </Panel>
          </Rise>
        ))}
      </div>
    )}
  </Stage>
);

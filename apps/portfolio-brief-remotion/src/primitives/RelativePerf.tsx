import React from 'react';
import {holdingsWithYtd} from '../data/compute';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {RelativePerfBars} from '../viz/RelativePerfBars';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, display} from './ui';
import {Rise} from './motion';

export const RelativePerf: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const rows = holdingsWithYtd(report.holdings).map((h) => ({ticker: h.ticker, pct: h.ytd}));
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Relative" />
      <Rise>
        <h2 style={{...display, fontSize: 52, margin: '0 0 10px'}}>Relative performance</h2>
        <p style={{fontFamily: fonts.sans, fontSize: 22, color: color.muted, margin: '0 0 28px'}}>
          Sourced YTD only. Missing lines stay off the chart.
        </p>
      </Rise>
      {rows.length === 0 ? (
        <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.faint}}>No sourced YTD prints tonight.</p>
      ) : (
        <RelativePerfBars rows={rows} />
      )}
    </Stage>
  );
};

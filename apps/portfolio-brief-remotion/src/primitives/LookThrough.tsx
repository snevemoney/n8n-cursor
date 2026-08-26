import React from 'react';
import {allWeightsUnknown, overlapEdges} from '../data/compute';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {LookThroughStack} from '../viz/LookThroughStack';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, display} from './ui';
import {Rise} from './motion';

export const LookThrough: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const tickers = report.holdings.map((h) => h.ticker);
  const edges = overlapEdges(report.holdings);
  const unknown = allWeightsUnknown(report.holdings);
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Look-through" />
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, height: 700}}>
        <Rise>
          <h2 style={{...display, fontSize: 56, margin: 0}}>Look-through</h2>
          <p style={{fontFamily: fonts.sans, fontSize: 26, color: color.muted, marginTop: 20, lineHeight: 1.4, maxWidth: 720}}>
            {edges.length === 0
              ? 'No sourced overlap edges tonight. The stack stays empty.'
              : `${edges.length} sourced overlap edges. Several lines buy the same names.`}
          </p>
          <p style={{fontFamily: fonts.sans, fontSize: 22, color: color.faint, marginTop: 18}}>
            {unknown
              ? 'Account weights are UNKNOWN — no fake allocation stack.'
              : 'Weights on the tape. Overlap still shown as edges, not invented shares.'}
          </p>
        </Rise>
        <LookThroughStack tickers={tickers} edges={edges} weightsUnknown={unknown} />
      </div>
    </Stage>
  );
};

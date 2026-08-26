import React from 'react';
import {signedPct} from '../data/compute';
import type {ComparisonBlock, NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {Bar, ChapterFromLabel, Panel, display, mono} from './ui';

const barTone = (tone: ComparisonBlock['bars'][number]['tone']): string => {
  switch (tone) {
    case 'long':
      return color.long;
    case 'watch':
      return color.watch;
    case 'caution':
      return color.caution;
    case 'short':
      return color.short;
    case 'gold':
      return color.gold;
    case 'nvda':
      return color.nvda;
    case 'aapl':
      return color.aapl;
    case 'muted':
      return color.muted;
    case undefined:
      return color.text;
    default: {
      const _n: never = tone;
      return _n;
    }
  }
};

export const ComparisonBars: React.FC<{
  name: NameBlock;
  chapter: string;
  block: ComparisonBlock;
}> = ({name, chapter, block}) => {
  const max = Math.max(20, ...block.bars.map((b) => Math.abs(b.pct) + 4));
  const split = Boolean(block.panelTitle || block.panelBody);
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={`${name.ticker} vs benchmark`} />
      {block.headline ? (
        <h2 style={{...display, fontSize: 48, maxWidth: 1400, margin: '0 0 36px'}}>{block.headline}</h2>
      ) : null}
      <div style={{display: split ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: 40}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, maxWidth: split ? undefined : 1100}}>
          {block.bars.map((b, i) => (
            <Bar
              key={b.label}
              label={b.label}
              valueLabel={b.valueLabel ?? signedPct(b.pct, Math.abs(b.pct) >= 10 ? 1 : 2)}
              pct={b.pct}
              max={max}
              color={barTone(b.tone)}
              delay={i * 6}
            />
          ))}
        </div>
        {split ? (
          <Panel>
            {block.panelTitle ? <div style={{...mono, color: color.watch}}>{block.panelTitle}</div> : null}
            {block.panelBody ? (
              <p style={{...display, fontSize: 42, marginTop: 16}}>{block.panelBody}</p>
            ) : null}
          </Panel>
        ) : null}
      </div>
      {block.note ? (
        <p style={{fontFamily: fonts.sans, color: color.muted, fontSize: 26, marginTop: 36}}>{block.note}</p>
      ) : null}
    </Stage>
  );
};

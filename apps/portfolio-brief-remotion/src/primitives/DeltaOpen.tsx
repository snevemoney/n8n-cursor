import React from 'react';
import {diffEpisodes} from '../data/delta';
import {previousEpisode} from '../data/loadEpisode';
import type {DailyReport} from '../data/schema';
import {Stage} from '../chrome/Stage';
import {color, fonts} from '../engine/theme';
import {ChapterFromLabel, Panel, Pill, display, mono} from './ui';
import {Rise} from './motion';

export const DeltaOpen: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const delta = diffEpisodes(previousEpisode(report.meta.date), report);

  if (!delta.hasPrior) {
    return (
      <Stage>
        <ChapterFromLabel chapter={chapter} fallback="First tape" />
        <Rise>
          <div style={{...mono, color: color.gold, fontSize: 16, letterSpacing: 1.8}}>FIRST EPISODE · NO PRIOR TAPE</div>
          <h1 style={{...display, fontSize: 72, maxWidth: 1500, margin: '18px 0 0'}}>
            {report.meta.dateLabel}
          </h1>
        </Rise>
        <Rise delay={10}>
          <p style={{fontFamily: fonts.sans, fontSize: 30, color: color.muted, maxWidth: 1200, marginTop: 22, lineHeight: 1.4}}>
            No overnight delta — this is the first registered session. The kinetic open still carries the thesis. Do not
            invent a prior print.
          </p>
        </Rise>
        <Rise delay={18}>
          <Panel accent={color.watch} style={{marginTop: 28, maxWidth: 1200}}>
            <div style={{...mono, color: color.watch, fontSize: 14, letterSpacing: 1.4}}>TODAY’S CATALYST</div>
            <p style={{fontFamily: fonts.sans, fontSize: 28, color: color.text, margin: '10px 0 0', lineHeight: 1.35}}>
              {delta.currCatalyst}
            </p>
          </Panel>
        </Rise>
      </Stage>
    );
  }

  const chips: {label: string; body: string}[] = [];
  for (const flip of delta.ratingFlips) {
    chips.push({label: `${flip.ticker} rating`, body: `${flip.from} → ${flip.to}`});
  }
  if (delta.addedTickers.length) chips.push({label: 'New in book', body: delta.addedTickers.join(' · ')});
  if (delta.removedTickers.length) chips.push({label: 'Removed', body: delta.removedTickers.join(' · ')});
  if (delta.catalystChanged) chips.push({label: 'Catalyst', body: delta.currCatalyst});
  for (const move of delta.tapeMoves) {
    chips.push({label: move.field, body: `${move.prev} → ${move.curr}`});
  }
  const newScouts = [...new Set([...delta.addedScouts, ...delta.addedOpportunities])];
  if (newScouts.length) chips.push({label: 'New scout names', body: newScouts.join(' · ')});
  if (delta.thesisChanged) chips.push({label: 'Thesis', body: report.meta.thesis});

  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback="Overnight delta" />
      <Rise>
        <div style={{...mono, color: color.gold, fontSize: 16, letterSpacing: 1.8}}>
          OVERNIGHT DELTA · VS {delta.priorDate}
        </div>
        <h1 style={{...display, fontSize: 64, maxWidth: 1500, margin: '14px 0 0'}}>What changed</h1>
      </Rise>
      {chips.length === 0 ? (
        <Rise delay={8}>
          <p style={{fontFamily: fonts.sans, fontSize: 30, color: color.muted, marginTop: 24}}>
            Prior tape exists. No rating, ticker, catalyst, or scout change vs {delta.priorDate}.
          </p>
        </Rise>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22}}>
          {chips.slice(0, 6).map((row, i) => (
            <Rise key={`${row.label}-${row.body}`} delay={6 + i * 3}>
              <Panel style={{padding: '16px 20px'}}>
                <div style={{...mono, fontSize: 13, color: color.gold, letterSpacing: 1.2}}>{row.label.toUpperCase()}</div>
                <div style={{fontFamily: fonts.sans, fontSize: 24, color: color.text, marginTop: 6, lineHeight: 1.3}}>
                  {row.body}
                </div>
              </Panel>
            </Rise>
          ))}
        </div>
      )}
      {delta.ratingFlips[0] ? (
        <Rise delay={28}>
          <div style={{marginTop: 16}}>
            <Pill tone={delta.ratingFlips[0].toTone}>{delta.ratingFlips[0].ticker}</Pill>
          </div>
        </Rise>
      ) : null}
    </Stage>
  );
};

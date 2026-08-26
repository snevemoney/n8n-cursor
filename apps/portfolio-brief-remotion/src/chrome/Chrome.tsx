import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {DailyReport} from '../data/schema';
import {signedPct} from '../data/compute';
import {color, fonts, layout} from '../engine/theme';
import {mono} from '../primitives/ui';

export const Chrome: React.FC<{report: DailyReport; chapter: string}> = ({report, chapter}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width} = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapeX = -((frame * 1.6) % 2400);
  const tape = report.tickerTape.length > 0 ? report.tickerTape : ['NO TAPE STRINGS IN REPORT'];
  const spx = report.market.spxClose;
  const spxDay = report.market.spxDayPct;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: color.line,
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: color.gold,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 18,
          left: layout.padX,
          right: layout.padX,
          height: layout.chromeH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              background: color.gold,
              boxShadow: `0 0 12px ${color.gold}`,
            }}
          />
          <span
            style={{
              fontFamily: fonts.sans,
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: 1.4,
              color: color.text,
            }}
          >
            {report.meta.title.toUpperCase()}
          </span>
          <span style={{...mono, fontSize: 14, color: color.faint}}>{report.meta.dateLabel}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <span style={{...mono, fontSize: 15, color: color.muted}}>{chapter}</span>
          {spx !== undefined ? (
            <span style={{...mono, fontSize: 15, color: color.long}}>
              SPX {spx.toLocaleString('en-US')}
              {spxDay !== undefined ? ` ${signedPct(spxDay)}` : ''}
            </span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: layout.tickerH,
          background: color.bgLift,
          borderTop: `1px solid ${color.line}`,
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 48,
            alignItems: 'center',
            height: '100%',
            width: width * 3,
            transform: `translateX(${tapeX}px)`,
            paddingLeft: 40,
          }}
        >
          {[...tape, ...tape, ...tape].map((t, i) => (
            <span key={`${t}-${i}`} style={{...mono, fontSize: 16, color: color.muted, whiteSpace: 'nowrap'}}>
              <span style={{color: color.gold, marginRight: 12}}>●</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

import React from 'react';
import {openKicker} from '../data/compute';
import type {DailyReport} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {Stage} from '../chrome/Stage';
import {display, kicker} from './ui';
import {Fade, Rise} from './motion';

export const KineticOpen: React.FC<{report: DailyReport}> = ({report}) => (
  <Stage>
    <Rise>
      <div style={kicker}>{openKicker(report)}</div>
    </Rise>
    <Rise delay={6}>
      <h1 style={{...display, fontSize: 96, maxWidth: 1500, margin: '22px 0 0'}}>
        {report.meta.thesisLead ?? report.meta.thesis}
      </h1>
    </Rise>
    {report.meta.thesisAccent ? (
      <Rise delay={14}>
        <h2
          style={{
            ...display,
            fontSize: 64,
            color: color.gold,
            maxWidth: 1400,
            margin: '14px 0 0',
          }}
        >
          {report.meta.thesisAccent}
        </h2>
      </Rise>
    ) : null}
    {report.meta.thesisLead ? (
      <Rise delay={24}>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 30,
            color: color.muted,
            maxWidth: 1180,
            lineHeight: 1.4,
            marginTop: 36,
          }}
        >
          {report.meta.thesis}
        </p>
      </Rise>
    ) : null}
    <Rise delay={34}>
      <div style={{marginTop: 40, display: 'flex', gap: 10, flexWrap: 'wrap'}}>
        {report.meta.universe.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: fonts.mono,
              fontSize: 20,
              color: color.text,
              border: `1px solid ${color.lineHot}`,
              background: color.panel,
              padding: '10px 16px',
              borderRadius: 10,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </Rise>
    <Fade delay={50}>
      <div
        style={{
          marginTop: 48,
          fontFamily: fonts.sans,
          fontSize: 28,
          color: color.text,
          borderLeft: `3px solid ${color.watch}`,
          paddingLeft: 20,
        }}
      >
        {report.meta.catalyst}
      </div>
    </Fade>
  </Stage>
);

import React from 'react';
import {redDaysInWindow} from '../data/compute';
import type {NameBlock} from '../data/schema';
import {color, fonts} from '../engine/theme';
import {SessionHeatmap} from '../viz/SessionHeatmap';
import {Stage} from '../chrome/Stage';
import {ChapterFromLabel, display, mono} from './ui';
import {Rise} from './motion';

const sessionWords = (n: number): string => {
  const named = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return n === 21 ? '21 sessions' : `${named[n] ?? String(n)} sessions`;
};

export const StreakHeatmap: React.FC<{name: NameBlock; chapter: string}> = ({name, chapter}) => {
  const streak = name.streak ?? [];
  const red = streak.length ? redDaysInWindow(streak) : 0;
  return (
    <Stage>
      <ChapterFromLabel chapter={chapter} fallback={sessionWords(streak.length)} />
      <Rise>
        <div style={{...mono, color: color.gold, fontSize: 15, letterSpacing: 1.6, marginBottom: 8}}>
          {sessionWords(streak.length).toUpperCase()}
          {streak.length !== 21 ? ' · NOT A 21-DAY GRID' : ''}
        </div>
        <p style={{...display, fontSize: 44, margin: '0 0 36px', maxWidth: 1400}}>
          {name.streakHeadline ?? `${red} red of ${streak.length}`}
        </p>
      </Rise>
      <SessionHeatmap values={streak} />
      {name.streakNote ? (
        <Rise delay={40}>
          <p style={{fontFamily: fonts.sans, color: color.muted, fontSize: 24, marginTop: 36}}>{name.streakNote}</p>
        </Rise>
      ) : null}
    </Stage>
  );
};

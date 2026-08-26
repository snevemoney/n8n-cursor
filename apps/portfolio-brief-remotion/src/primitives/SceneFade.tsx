import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {color} from '../engine/theme';
import {FADE_FRAMES} from '../engine/timing';

export const SceneFade: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fade = Math.min(FADE_FRAMES, Math.floor(durationInFrames / 6));
  const opacity = interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flash = interpolate(frame, [0, 3], [0.28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity}}>
      {children}
      {frame < 4 ? (
        <AbsoluteFill
          style={{
            backgroundColor: color.gold,
            opacity: flash,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

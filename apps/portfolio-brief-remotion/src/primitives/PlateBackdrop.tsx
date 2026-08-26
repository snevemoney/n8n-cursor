import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {plateForScene} from '../data/plates';
import type {SceneKind} from '../engine/selectScenes';
import {color} from '../engine/theme';

export const PlateBackdrop: React.FC<{kind: SceneKind}> = ({kind}) => {
  const plate = plateForScene(kind);
  const frame = useCurrentFrame();
  if (!plate) return null;
  const opacity = interpolate(frame, [0, 10], [0, 0.26], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{zIndex: 0, pointerEvents: 'none'}}>
      <Img
        src={staticFile(plate.file)}
        style={{width: '100%', height: '100%', objectFit: 'cover', opacity}}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${color.bg}ee 0%, ${color.bg}99 40%, ${color.bg}e6 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

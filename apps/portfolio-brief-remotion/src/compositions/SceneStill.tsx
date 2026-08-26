import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Chrome} from '../chrome/Chrome';
import {Grid} from '../chrome/Grid';
import {DEFAULT_EPISODE_ID, loadEpisode, previousEpisode} from '../data/loadEpisode';
import {color} from '../engine/theme';
import {selectScenes, type CutKind, type SceneKind} from '../engine/selectScenes';
import {renderScene} from '../primitives/renderScene';

export type SceneStillProps = {
  episodeId: string;
  kind: SceneKind;
  cut?: CutKind;
};

export const SceneStill: React.FC<SceneStillProps> = ({episodeId, kind, cut = 'full'}) => {
  const report = loadEpisode(episodeId);
  const plan = selectScenes(report, {cut, previous: previousEpisode(episodeId)});
  const scene = plan.scenes.find((s) => s.kind === kind);
  if (!scene) {
    return (
      <AbsoluteFill style={{backgroundColor: color.bg, color: color.text, padding: 80, fontSize: 42}}>
        No scene of kind {kind}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{backgroundColor: color.bg, color: color.text}}>
      <Grid />
      {renderScene(scene, report)}
      <Chrome report={report} chapter={scene.chapter} />
    </AbsoluteFill>
  );
};

export const defaultSceneStillProps: SceneStillProps = {
  episodeId: DEFAULT_EPISODE_ID,
  kind: 'delta',
  cut: 'full',
};

import type {SceneKind} from '../engine/selectScenes';
import platesFile from '../../public/plates/plates.json';

export type PlateRecord = {
  beatId: string;
  file: string;
  caption: string;
  usedOnScenes: string[];
};

const plates: PlateRecord[] = platesFile.plates;

export function plateForScene(kind: SceneKind): PlateRecord | undefined {
  return plates.find((p) => p.usedOnScenes.includes(kind));
}

export function listPlates(): PlateRecord[] {
  return plates;
}

import {useCurrentFrame, useVideoConfig} from 'remotion';
import {buildSequentialTimeline, entranceAt, sceneOpacityAt, sceneProgressAt} from './timeline';

type Options = {
  tailSeconds?: number;
  fadeSeconds?: number;
  entranceDistance?: number;
  entranceScale?: number;
};

export const createRemotionTimeline = <Id extends string>(
  ids: readonly Id[],
  durations: readonly number[],
  options: Options = {},
) => {
  const {
    tailSeconds = 0,
    fadeSeconds = 0.38,
    entranceDistance = 36,
    entranceScale = 0.88,
  } = options;
  const timeline = buildSequentialTimeline(ids, durations, tailSeconds);
  const byId = new Map(timeline.scenes.map((scene) => [scene.id, scene]));
  const scene = (id: Id) => {
    const value = byId.get(id);
    if (!value) throw new Error(`Unknown scene: ${id}`);
    return value;
  };
  const useTime = () => useCurrentFrame() / useVideoConfig().fps;

  return {
    ...timeline,
    sceneById: scene,
    useSceneProgress: (id: Id) => sceneProgressAt(scene(id), useTime()),
    useSceneOpacity: (id: Id) => sceneOpacityAt(scene(id), useTime(), fadeSeconds),
    useEntrance: (id: Id, offset = 0, duration = 0.65) =>
      entranceAt(scene(id), useTime(), offset, duration, entranceDistance, entranceScale),
  };
};

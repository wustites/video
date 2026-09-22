export type TimelineScene<Id extends string> = {
  id: Id;
  start: number;
  end: number;
};

export type Entrance = {
  opacity: number;
  y: number;
  scale: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const buildSequentialTimeline = <Id extends string>(
  ids: readonly Id[],
  durations: readonly number[],
  tailSeconds = 0,
) => {
  if (ids.length !== durations.length) {
    throw new Error(`Scene count (${ids.length}) does not match duration count (${durations.length})`);
  }
  if (!Number.isFinite(tailSeconds) || tailSeconds < 0) throw new Error('tailSeconds must be non-negative');

  let cursor = 0;
  const seenIds = new Set<Id>();
  const scenes = ids.map((id, index): TimelineScene<Id> => {
    if (seenIds.has(id)) throw new Error(`Duplicate scene ID: ${id}`);
    seenIds.add(id);
    const duration = durations[index];
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error(`Duration for scene ${id} must be positive`);
    }
    const start = cursor;
    cursor += duration;
    if (!Number.isFinite(cursor)) throw new Error('Timeline duration exceeds the finite number range');
    return {id, start, end: cursor};
  });

  if (!Number.isFinite(cursor + tailSeconds)) throw new Error('Timeline duration exceeds the finite number range');

  return {
    scenes,
    audioEnd: cursor,
    totalSeconds: Math.ceil(cursor + tailSeconds),
  };
};

export const sceneProgressAt = <Id extends string>(scene: TimelineScene<Id>, time: number) =>
  clamp01((time - scene.start) / (scene.end - scene.start));

export const sceneOpacityAt = <Id extends string>(scene: TimelineScene<Id>, time: number, fadeSeconds: number) => {
  if (!Number.isFinite(fadeSeconds) || fadeSeconds < 0) throw new Error('fadeSeconds must be non-negative');
  if (time >= scene.start && time <= scene.end) return 1;
  if (time >= scene.start - fadeSeconds && time < scene.start) {
    return (time - scene.start + fadeSeconds) / fadeSeconds;
  }
  if (time > scene.end && time <= scene.end + fadeSeconds) {
    return 1 - (time - scene.end) / fadeSeconds;
  }
  return 0;
};

export const entranceAt = <Id extends string>(
  scene: TimelineScene<Id>,
  time: number,
  offset: number,
  duration: number,
  distance: number,
  initialScale: number,
): Entrance => {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Entrance duration must be positive');
  const progress = clamp01((time - scene.start - offset) / duration);
  const eased = 1 - Math.pow(1 - progress, 3);
  return {
    opacity: eased,
    y: (1 - eased) * distance,
    scale: initialScale + eased * (1 - initialScale),
  };
};

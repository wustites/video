import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Top500} from './Top500';
import {DURATION_IN_FRAMES, FPS} from './data';
import {loadFonts} from './fonts';

export const RemotionRoot: React.FC = () => {
  const [handle] = useState(() => delayRender('Noto Sans SC'));
  useEffect(() => {
    loadFonts()
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <>
      <Composition
        id="Top500"
        component={Top500}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

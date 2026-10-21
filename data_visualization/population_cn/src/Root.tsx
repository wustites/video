import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {PopulationCn} from './PopulationCn';
import {DURATION_IN_FRAMES, FPS} from './timing';
import {notoSansSC} from './fonts';

const fontHandle = delayRender('Loading Noto Sans SC');
notoSansSC
  .waitUntilDone()
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PopulationCn"
        component={PopulationCn}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

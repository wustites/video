import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Apple} from './Apple';
import {FPS, TOTAL_FRAMES} from './data';
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
        id="Apple"
        component={Apple}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

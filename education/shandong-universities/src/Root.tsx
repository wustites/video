import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {ShandongAtlas} from './ShandongAtlas';
import {notoSansSC} from './fonts';
import {FPS, TOTAL_FRAMES} from './timing';

const fontHandle = delayRender('Loading Noto Sans SC');
notoSansSC
  .waitUntilDone()
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ShandongAtlas"
      component={ShandongAtlas}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
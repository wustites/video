import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {CloudflareHistory} from './CloudflareHistory';
import {notoSansSC} from './fonts';
import {FPS, TOTAL_SECONDS} from './timing';

const fontHandle = delayRender('Loading Noto Sans SC');
notoSansSC.waitUntilDone().then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CloudflareHistory"
        component={CloudflareHistory}
        durationInFrames={TOTAL_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

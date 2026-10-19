import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {ClaudeMHS} from './ClaudeMHS';
import {notoSansSC} from './fonts';
import {FPS, TOTAL_SECONDS} from './timing';

const fontHandle = delayRender('Loading Noto Sans SC');
notoSansSC.waitUntilDone().then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ClaudeMHS"
    component={ClaudeMHS}
    durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

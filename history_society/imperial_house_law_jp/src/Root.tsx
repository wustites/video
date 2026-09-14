import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {notoSansJP} from './fonts';
import {ImperialHouseLaw} from './ImperialHouseLaw';
import {FPS, TOTAL_SECONDS} from './timing';

const fontHandle = delayRender('Loading Noto Sans JP');
notoSansJP.waitUntilDone().then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ImperialHouseLaw"
    component={ImperialHouseLaw}
    durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

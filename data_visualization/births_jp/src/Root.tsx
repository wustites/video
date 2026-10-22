import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {BirthsJp} from './BirthsJp';
import {FPS, getTimeline} from './timing';
import {notoSansJP, notoSansSC} from './fonts';

const fontHandle = delayRender('Loading Noto Sans SC / JP');
Promise.all([notoSansSC.waitUntilDone(), notoSansJP.waitUntilDone()])
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BirthsJpZh"
      component={BirthsJp}
      defaultProps={{locale: 'zh' as const}}
      durationInFrames={getTimeline('zh').duration}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="BirthsJpJa"
      component={BirthsJp}
      defaultProps={{locale: 'ja' as const}}
      durationInFrames={getTimeline('ja').duration}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);

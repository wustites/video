import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {OpenrouterRankings} from './OpenrouterRankings';
import {FPS, getTimeline} from './timing';
import {fontFamily, notoSansSC} from './fonts';

const fontHandle = delayRender('Loading Noto Sans SC');
notoSansSC
  .waitUntilDone()
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));
export const RemotionRoot: React.FC = () => {
  return (
    <div style={{fontFamily}}>
      <Composition
        id="OpenrouterRankingsEn"
        component={OpenrouterRankings}
        defaultProps={{locale: 'en' as const}}
        durationInFrames={getTimeline('en').duration}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="OpenrouterRankingsZh"
        component={OpenrouterRankings}
        defaultProps={{locale: 'zh' as const}}
        durationInFrames={getTimeline('zh').duration}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </div>
  );
};

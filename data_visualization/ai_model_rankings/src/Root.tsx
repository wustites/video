import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {AiModelRankings} from './AiModelRankings';
import {FPS, getTimeline} from './timing';
import {notoSansJPInfo, notoSansSCInfo} from './fonts';

const fontHandle = delayRender('Loading Noto Sans SC + JP');
Promise.all([notoSansSCInfo.waitUntilDone(), notoSansJPInfo.waitUntilDone()])
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AiModelRankingsEn"
        component={AiModelRankings}
        durationInFrames={getTimeline('en').duration}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{locale: 'en'}}
      />
      <Composition
        id="AiModelRankingsZh"
        component={AiModelRankings}
        durationInFrames={getTimeline('zh').duration}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{locale: 'zh'}}
      />
      <Composition
        id="AiModelRankingsJa"
        component={AiModelRankings}
        durationInFrames={getTimeline('ja').duration}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{locale: 'ja'}}
      />
    </>
  );
};

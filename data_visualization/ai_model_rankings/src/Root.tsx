import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {AiModelRankings, DURATION_IN_FRAMES, FPS} from './AiModelRankings';
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
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{locale: 'en'}}
      />
      <Composition
        id="AiModelRankingsZh"
        component={AiModelRankings}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{locale: 'zh'}}
      />
      <Composition
        id="AiModelRankingsJa"
        component={AiModelRankings}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{locale: 'ja'}}
      />
    </>
  );
};

import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {QsUniversities, DURATION_IN_FRAMES, FPS} from './QsUniversities';
import {notoSansSC} from './fonts';

const fontHandle = delayRender('Loading Google Noto Sans SC');
notoSansSC.waitUntilDone().then(() => continueRender(fontHandle)).catch((error) => {
  console.warn('Google Noto Sans SC failed to load; continuing with fallback fonts.', error);
  continueRender(fontHandle);
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QsUniversities"
        component={QsUniversities}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

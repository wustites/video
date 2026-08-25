import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {SapporoSubway} from './SapporoSubway';
import {notoSansJP} from './fonts';
import {FPS, TOTAL_SECONDS} from './timing';

const fontHandle = delayRender('Loading Google Noto Sans JP');
notoSansJP.waitUntilDone().then(() => continueRender(fontHandle)).catch((error) => {
  console.warn('Google Noto Sans JP failed to load; continuing with fallback fonts.', error);
  continueRender(fontHandle);
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SapporoSubway"
        component={SapporoSubway}
        durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {SaintPetersburgMetro} from './SaintPetersburgMetro';
import {notoSans} from './fonts';
import {FPS, TOTAL_SECONDS} from './timing';

const DRAFT_FPS = 15;

const fontHandle = delayRender('Loading Google Noto Sans');
notoSans.waitUntilDone().then(() => continueRender(fontHandle)).catch((error) => {
  console.warn('Google Noto Sans failed to load; continuing with fallback fonts.', error);
  continueRender(fontHandle);
});

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SaintPetersburgMetro"
      component={SaintPetersburgMetro}
      durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="SaintPetersburgMetroDraft"
      component={SaintPetersburgMetro}
      durationInFrames={Math.round(TOTAL_SECONDS * DRAFT_FPS)}
      fps={DRAFT_FPS}
      width={1080}
      height={1920}
    />
  </>
);

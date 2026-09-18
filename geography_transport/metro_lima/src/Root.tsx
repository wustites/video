import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {notoSans} from './fonts';
import {MetroLima} from './MetroLima';
import {FPS, TOTAL_SECONDS} from './timing';

const fontHandle = delayRender('Loading Noto Sans');
notoSans.waitUntilDone().then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MetroLima"
        component={MetroLima}
        durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

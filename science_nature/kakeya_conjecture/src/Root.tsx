import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {notoSansSC, notoSerifSC} from './fonts';
import {FPS, HEIGHT, Kakeya, WIDTH} from './Kakeya';
import {DURATION_IN_FRAMES} from './timing';

const KakeyaWithFontGate: React.FC = () => {
  const [handle] = useState(() => delayRender('loading Noto Sans SC + Noto Serif SC'));
  useEffect(() => {
    let alive = true;
    Promise.all([notoSansSC.waitUntilDone(), notoSerifSC.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        if (alive) continueRender(handle);
      });
    return () => {
      alive = false;
    };
  }, [handle]);
  return <Kakeya />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Kakeya"
        component={KakeyaWithFontGate}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};

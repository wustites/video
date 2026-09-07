import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {notoSansSC, notoSerifSC} from './fonts';
import {DURATION_SECONDS, FPS, HEIGHT, Kakeya, WIDTH} from './Kakeya';

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
        durationInFrames={Math.round(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};

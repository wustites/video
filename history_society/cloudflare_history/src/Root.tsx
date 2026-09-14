import React from 'react';
import {Composition} from 'remotion';
import {CloudflareHistory} from './CloudflareHistory';
import {FPS, TOTAL_SECONDS} from './timing';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CloudflareHistory"
        component={CloudflareHistory}
        durationInFrames={TOTAL_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
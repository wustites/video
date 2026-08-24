import React from 'react';
import {Composition} from 'remotion';
import {SapporoSubway} from './SapporoSubway';
import {FPS, TOTAL_SECONDS} from './timing';

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

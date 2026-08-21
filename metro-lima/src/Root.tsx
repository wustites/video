import React from 'react';
import {Composition} from 'remotion';
import {MetroLima} from './MetroLima';
import {FPS, TOTAL_SECONDS} from './timing';

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

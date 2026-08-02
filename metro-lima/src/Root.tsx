import React from 'react';
import {Composition} from 'remotion';
import {MetroLima} from './MetroLima';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MetroLima"
        component={MetroLima}
        durationInFrames={56 * 30}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

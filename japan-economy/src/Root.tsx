import React from 'react';
import {Composition} from 'remotion';
import {JapanEconomy} from './JapanEconomy';
import {FPS, TOTAL_SECONDS} from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="JapanEconomy"
    component={JapanEconomy}
    durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

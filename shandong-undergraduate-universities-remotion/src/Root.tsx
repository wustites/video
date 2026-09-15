import React from 'react';
import {Composition} from 'remotion';
import {ShandongAtlas} from './ShandongAtlas';
import {FPS, TOTAL_FRAMES} from './timing';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShandongAtlas" component={ShandongAtlas} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);

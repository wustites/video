import {Config} from '@remotion/cli/config';

type Renderer = Parameters<typeof Config.setChromiumOpenGlRenderer>[0];

export const configureRemotion = (renderer: Renderer | false = 'angle') => {
  Config.setVideoImageFormat('jpeg');
  Config.setOverwriteOutput(true);
  if (renderer) Config.setChromiumOpenGlRenderer(renderer);
};

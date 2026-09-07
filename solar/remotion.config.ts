import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Three.js scene needs software WebGL in headless environments (CI, containers):
// chrome-headless-shell has no GPU, so render through SwiftShader ANGLE.
// Verified locally: 'angle' fails with "Error creating WebGL context", 'swangle' renders.
Config.setChromiumOpenGlRenderer('swangle');

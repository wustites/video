import {registerRoot} from 'remotion';
import {Composition, continueRender, delayRender} from 'remotion';
import {BrexitReferendum} from './BrexitReferendum';
import {inter} from './fonts';
import {FPS, TOTAL_SECONDS} from './timing';

const fontHandle = delayRender('Loading Google Inter');
inter.waitUntilDone().then(() => continueRender(fontHandle)).catch((error) => {
  console.warn('Google Inter failed to load; continuing with fallback fonts.', error);
  continueRender(fontHandle);
});

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BrexitReferendum"
    component={BrexitReferendum}
    durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

import {Composition} from 'remotion';
import {Top500Video} from './Top500Video';

export const Root = () => {
  return (
    <Composition
      id="Top500Video"
      component={Top500Video}
      durationInFrames={870}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        cachedAudioPath: 'audio/network-audio.mp3',
        audioStartFromSeconds: 10,
      }}
    />
  );
};

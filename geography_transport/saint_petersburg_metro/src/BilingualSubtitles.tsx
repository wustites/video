import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import subtitleData from '../public/voiceover/subtitles.ru-en.json';
import {getSceneAtTime, SCENES, type SceneId} from './timing';
import {notoSans} from './fonts';

type Caption = {
  scene: SceneId;
  ru: string;
  en: string;
};

const captions = subtitleData as Caption[];
if (
  captions.length !== SCENES.length ||
  captions.some((caption, index) => caption.scene !== SCENES[index].id)
) {
  throw new Error(
    `字幕数量(${captions.length})或场景顺序与 timing.ts 不一致，请同步 subtitles.ru-en.json`,
  );
}
const captionByScene = new Map<SceneId, Caption>(captions.map((caption) => [caption.scene, caption]));

const font = {
  fontFamily: `${notoSans.fontFamily}, sans-serif`,
};

/**
 * Burned-in Russian / English captions. The Russian line is the spoken
 * narration; the English line is a translation shown beneath it.
 */
export const BilingualSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const scene = getSceneAtTime(time);
  const caption = scene ? captionByScene.get(scene.id) : undefined;

  if (!scene || !caption) return null;

  const fadeIn = Math.max(0, Math.min(1, (time - scene.start) / 0.24));
  const fadeOut = Math.max(0, Math.min(1, (scene.end - time) / 0.24));
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        zIndex: 30,
        pointerEvents: 'none',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 58px 68px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          boxSizing: 'border-box',
          padding: '17px 26px 19px',
          borderRadius: 18,
          border: '1px solid rgba(150, 184, 220, 0.34)',
          background: 'linear-gradient(135deg, rgba(5, 10, 21, 0.93), rgba(11, 22, 40, 0.88))',
          boxShadow: '0 12px 38px rgba(0, 0, 0, 0.32)',
          opacity,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            ...font,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 7,
            color: '#f4c86a',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
          }}
        >
          <span>RU</span>
          <span style={{width: 22, height: 1, background: 'rgba(244, 200, 106, 0.55)'}} />
          <span>EN</span>
        </div>
        <div
          lang="ru"
          style={{
            ...font,
            color: '#ffffff',
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: 0.1,
          }}
        >
          {caption.ru}
        </div>
        <div
          lang="en"
          style={{
            ...font,
            marginTop: 6,
            color: '#b9c9df',
            fontSize: 23,
            fontWeight: 500,
            lineHeight: 1.28,
          }}
        >
          {caption.en}
        </div>
      </div>
    </AbsoluteFill>
  );
};

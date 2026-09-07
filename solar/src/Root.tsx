import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Solar} from './Solar';
import {FPS, LOCALES, durationInFrames, type SolarLocale} from './cues';
import {loadSolarFonts} from './fonts';

const COMPOSITION_IDS: Record<SolarLocale, string> = {
  en: 'solar-en',
  zh: 'solar-zh',
  ja: 'solar-ja',
  ko: 'solar-ko',
};

export const RemotionRoot: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading Noto Sans variants'));
  useEffect(() => {
    loadSolarFonts()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error('Failed to load solar fonts', err);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <>
      {LOCALES.map((locale) => (
        <Composition
          key={locale}
          id={COMPOSITION_IDS[locale]}
          component={Solar}
          defaultProps={{locale}}
          durationInFrames={durationInFrames(locale)}
          fps={FPS}
          width={1080}
          height={1920}
        />
      ))}
    </>
  );
};

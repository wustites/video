import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {notoSansJP} from './fonts';
import {AUDIO_END, SceneId, useEntrance, useSceneOpacity, useSceneProgress} from './timing';

const C = {
  bg: '#150608',
  panel: 'rgba(58,16,22,.72)',
  text: '#f6ece7',
  muted: '#c2a5a2',
  red: '#e2493f',
  deepRed: '#a8232b',
  gold: '#e0a34a',
  steel: '#7f8ea3',
  line: 'rgba(226,73,63,.28)',
};

const font: React.CSSProperties = {fontFamily: `${notoSansJP.fontFamily}, sans-serif`};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.18;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 78% 16%, rgba(168,35,43,.35), transparent 36%), linear-gradient(160deg, ${C.bg}, #26090c 55%, #0c0304)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: -120, transform: `translateY(${drift % 72}px)`, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.14}} />
      <div style={{position: 'absolute', top: -300, right: -220, width: 760, height: 760, borderRadius: '50%', border: '1px solid rgba(224,163,74,.14)', transform: `rotate(${frame / 46}deg)`}} />
      <div style={{position: 'absolute', bottom: -420, left: -260, width: 860, height: 860, borderRadius: '50%', border: '1px dashed rgba(226,73,63,.18)', transform: `rotate(${-frame / 60}deg)`}} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{id: SceneId; children: React.ReactNode}> = ({id, children}) => {
  const opacity = useSceneOpacity(id);
  return (
    <AbsoluteFill style={{opacity, visibility: opacity > 0 ? 'visible' : 'hidden', padding: '118px 78px 110px', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{...font, color: C.gold, fontSize: 26, letterSpacing: 7, fontWeight: 800, marginBottom: 34}}>{children}</div>
);

const BigTitle: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 88}) => (
  <div style={{...font, color: C.text, fontSize: size, lineHeight: 1.18, letterSpacing: -2, fontWeight: 900}}>{children}</div>
);

const Intro: React.FC = () => {
  const a = useEntrance('intro', 0.2, 0.8);
  const b = useEntrance('intro', 1.0, 0.9);
  const c = useEntrance('intro', 2.0, 0.8);
  return (
    <Scene id="intro">
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><Kicker>JAPAN · 1970s</Kicker></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px) scale(${b.scale})`}}>
        <BigTitle size={100}>日本赤軍</BigTitle>
        <div style={{...font, fontSize: 31, fontWeight: 700, color: C.muted, marginTop: 24}}>にほんせきぐん ／ JRA</div>
      </div>
      <div style={{width: 560, height: 5, background: `linear-gradient(90deg, transparent, ${C.red}, transparent)`, margin: '46px 0', opacity: c.opacity}} />
      <div style={{...font, fontSize: 37, fontWeight: 600, lineHeight: 1.6, color: C.text, opacity: c.opacity}}>学生運動が生んだ過激派組織は<br/>なぜ海を越えたのか</div>
      <div style={{position: 'absolute', right: 90, bottom: 150, opacity: a.opacity, ...font, color: 'rgba(226,73,63,.55)', fontSize: 200, fontWeight: 900, lineHeight: 1}}>赤</div>
    </Scene>
  );
};

const Formation: React.FC = () => {
  const items = [
    ['1969', '運動の過激化', '学生運動の分派が武装化へ'],
    ['1971', '海外へ拠点移動', '重信房子らがレバノンへ'],
    ['1971', '国際連帯', 'パレスチナの闘争組織と手を結ぶ'],
  ];
  return (
    <Scene id="formation">
      <div style={{position: 'absolute', top: 120, left: 70, textAlign: 'left'}}>
        <Kicker>ORIGINS</Kicker>
      </div>
      <BigTitle size={62}>運動の海を越えて</BigTitle>
      <div style={{position: 'relative', width: '100%', marginTop: 72}}>
        <div style={{position: 'absolute', left: 104, top: 14, bottom: 14, width: 4, background: `linear-gradient(${C.gold}, ${C.red})`}} />
        {items.map((item, i) => {
          const a = useEntrance('formation', 0.7 + i * 0.7, 0.65);
          return (
            <div key={i} style={{position: 'relative', display: 'grid', gridTemplateColumns: '180px 1fr', textAlign: 'left', marginBottom: 54, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
              <div style={{...font, color: C.gold, fontSize: 36, fontWeight: 900}}>{item[0]}</div>
              <div style={{paddingLeft: 32}}>
                <div style={{...font, color: C.text, fontSize: 33, fontWeight: 900}}>{item[1]}</div>
                <div style={{...font, color: C.muted, fontSize: 24, fontWeight: 600, lineHeight: 1.45, marginTop: 8}}>{item[2]}</div>
              </div>
              <div style={{position: 'absolute', left: 94, top: 12, width: 24, height: 24, borderRadius: '50%', background: C.bg, border: `5px solid ${i === 2 ? C.red : C.gold}`}} />
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const Lod: React.FC = () => {
  const p = useSceneProgress('lod');
  const a = useEntrance('lod', 0.5, 0.8);
  const b = useEntrance('lod', 1.3, 0.8);
  const c = useEntrance('lod', 2.2, 0.8);
  return (
    <Scene id="lod">
      <Kicker>MAY 30, 1972</Kicker>
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><BigTitle size={68}>テルアビブ<br/>ロッド空港乱射事件</BigTitle></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`, marginTop: 62, width: '100%', background: C.panel, border: `2px solid ${C.line}`, borderRadius: 32, padding: '44px 30px'}}>
        <div style={{...font, fontSize: 130, fontWeight: 900, color: C.red, letterSpacing: -4}}>{Math.round(interpolate(p, [0.1, 0.55], [0, 24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))}<span style={{fontSize: 52, letterSpacing: 0}}> 人以上</span></div>
        <div style={{...font, fontSize: 27, fontWeight: 700, color: C.muted, marginTop: 14}}>死亡した犠牲者</div>
      </div>
      <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted, lineHeight: 1.6, marginTop: 56, opacity: c.opacity, transform: `translateY(${c.y}px)`}}>
        メンバー三人による無差別発砲。<br/><span style={{color: C.text}}>世界に衝撃が走り、組織の名は一躍知られた</span>
      </div>
    </Scene>
  );
};

const Hijack: React.FC = () => {
  const events = [
    ['1973', '日航機ハイジャック', 'アムステルダム発の旅客機を乗っ取り'],
    ['1975', '大使館占拠', 'クアラルンプールで人質事件'],
    ['1977', 'ダッカ事件', '政府が超法規的措置で六人を釈放'],
  ];
  return (
    <Scene id="hijack">
      <div style={{position: 'absolute', top: 120, left: 70, textAlign: 'left'}}><Kicker>CHAIN OF INCIDENTS</Kicker></div>
      <BigTitle size={62}>事件は止まらなかった</BigTitle>
      <div style={{marginTop: 64, width: '100%', display: 'grid', gap: 24}}>
        {events.map((e, i) => {
          const a = useEntrance('hijack', 0.8 + i * 0.7, 0.7);
          return (
            <div key={i} style={{opacity: a.opacity, transform: `translateY(${a.y}px)`, display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', textAlign: 'left', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: '30px 32px'}}>
              <div style={{...font, fontSize: 40, fontWeight: 900, color: C.red}}>{e[0]}</div>
              <div>
                <div style={{...font, fontSize: 32, fontWeight: 900, color: C.text}}>{e[1]}</div>
                <div style={{...font, fontSize: 24, fontWeight: 600, color: C.muted, marginTop: 6}}>{e[2]}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{...font, fontSize: 25, fontWeight: 700, color: C.steel, marginTop: 50}}>国際的な請求を背景に、たびたび実力行使に出た</div>
    </Scene>
  );
};

const Dissolve: React.FC = () => {
  const a = useEntrance('dissolve', 0.4, 0.8);
  const b = useEntrance('dissolve', 1.2, 0.8);
  return (
    <Scene id="dissolve">
      <Kicker>END OF THE COLD WAR</Kicker>
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><BigTitle size={74}>2001年<br/>解散を宣言</BigTitle></div>
      <div style={{width: 520, height: 4, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, margin: '52px 0', opacity: b.opacity}} />
      <div style={{...font, fontSize: 33, fontWeight: 700, color: C.muted, lineHeight: 1.65, opacity: b.opacity}}>
        冷戦の終結とともに<br/>海外の拠点を失い<br/><span style={{color: C.text}}>約三十年の歴史に幕を下ろした</span>
      </div>
    </Scene>
  );
};

const Justice: React.FC = () => {
  const cards = [
    ['2000', '逮捕', '潜伏中の重信房子が大阪で逮捕される'],
    ['2006', '実刑判決', '禁錮二十年の判決が確定'],
    ['2022', '出所', '刑期を終え、五月に釈放された'],
  ];
  return (
    <Scene id="justice">
      <div style={{position: 'absolute', top: 120, left: 70, textAlign: 'left'}}><Kicker>JUSTICE DELAYED</Kicker></div>
      <BigTitle size={62}>指導者のゆくえ</BigTitle>
      <div style={{marginTop: 64, width: '100%', display: 'grid', gap: 26}}>
        {cards.map((card, i) => {
          const a = useEntrance('justice', 0.8 + i * 0.75, 0.7);
          return (
            <div key={i} style={{opacity: a.opacity, transform: `translateY(${a.y}px)`, display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', textAlign: 'left', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: '30px 32px'}}>
              <div style={{...font, fontSize: 40, fontWeight: 900, color: i === 2 ? C.gold : C.red}}>{card[0]}</div>
              <div>
                <div style={{...font, fontSize: 32, fontWeight: 900, color: C.text}}>{card[1]}</div>
                <div style={{...font, fontSize: 24, fontWeight: 600, color: C.muted, marginTop: 6}}>{card[2]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const Outro: React.FC = () => {
  const a = useEntrance('outro', 0.3, 0.8);
  const b = useEntrance('outro', 1.3, 0.8);
  return (
    <Scene id="outro">
      <div style={{opacity: a.opacity}}><Kicker>LEGACY OF VIOLENCE</Kicker></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`}}><BigTitle size={70}>過激化は<br/>何を残したのか</BigTitle></div>
      <div style={{width: 110, height: 6, background: C.red, margin: '52px auto', opacity: b.opacity}} />
      <div style={{...font, fontSize: 33, fontWeight: 700, color: C.muted, lineHeight: 1.65, opacity: b.opacity}}>
        半世紀にわたるその軌跡は<br/><span style={{color: C.text}}>国内外に多くの犠牲を広げた歴史として</span><br/>記録され続けています
      </div>
    </Scene>
  );
};

export const RedArmy: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame / fps, [AUDIO_END + 0.5, AUDIO_END + 2.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Background />
      <Intro />
      <Formation />
      <Lod />
      <Hijack />
      <Dissolve />
      <Justice />
      <Outro />
      <div style={{position: 'absolute', left: 50, bottom: 48, ...font, color: 'rgba(194,165,162,.5)', fontSize: 20, fontWeight: 600, letterSpacing: 1}}>JAPANESE RED ARMY · HISTORY</div>
      <Audio src={staticFile('voiceover/narration.ja.mp3')} />
      <AbsoluteFill style={{background: '#060101', opacity: fade}} />
    </AbsoluteFill>
  );
};

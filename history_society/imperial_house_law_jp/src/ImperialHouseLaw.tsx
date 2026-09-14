import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {notoSansJP} from './fonts';
import {AUDIO_END, SceneId, useEntrance, useSceneOpacity, useSceneProgress} from './timing';

const C = {
  bg: '#0c0714',
  panel: 'rgba(44,26,58,.72)',
  text: '#f5efe4',
  muted: '#c3b3a2',
  gold: '#d4a94e',
  vermilion: '#c8452f',
  purple: '#7a5ba6',
  steel: '#8d93a6',
  line: 'rgba(212,169,78,.28)',
};

const font: React.CSSProperties = {fontFamily: `${notoSansJP.fontFamily}, sans-serif`};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.18;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 76% 14%, rgba(122,91,166,.32), transparent 36%), linear-gradient(160deg, ${C.bg}, #1a0f24 55%, #060308)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: -120, transform: `translateY(${drift % 72}px)`, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.13}} />
      <div style={{position: 'absolute', top: -300, right: -220, width: 760, height: 760, borderRadius: '50%', border: '1px solid rgba(212,169,78,.16)', transform: `rotate(${frame / 46}deg)`}} />
      <div style={{position: 'absolute', bottom: -420, left: -260, width: 860, height: 860, borderRadius: '50%', border: '1px dashed rgba(200,69,47,.18)', transform: `rotate(${-frame / 60}deg)`}} />
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
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><Kicker>JAPAN · 2026</Kicker></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px) scale(${b.scale})`}}>
        <BigTitle size={92}>皇室典范<br/>改正案</BigTitle>
        <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted, marginTop: 24}}>こしつてんぱん かいせいあん</div>
      </div>
      <div style={{width: 560, height: 5, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, margin: '46px 0', opacity: c.opacity}} />
      <div style={{...font, fontSize: 37, fontWeight: 600, lineHeight: 1.6, color: C.text, opacity: c.opacity}}>七十九年ぶりの本格改正は<br/>皇室をどう変えるのか</div>
      <div style={{position: 'absolute', right: 90, bottom: 150, opacity: a.opacity, ...font, color: 'rgba(212,169,78,.4)', fontSize: 200, fontWeight: 900, lineHeight: 1}}>典</div>
    </Scene>
  );
};

const ShrinkingHouse: React.FC = () => {
  const a = useEntrance('background', 0.3, 0.8);
  const b = useEntrance('background', 1.2, 0.8);
  const p = useSceneProgress('background');
  const count = Math.round(interpolate(p, [0.15, 0.6], [18, 16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <Scene id="background">
      <div style={{position: 'absolute', top: 120, left: 70, textAlign: 'left'}}><Kicker>SHRINKING HOUSE</Kicker></div>
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><BigTitle size={66}>縮小し続ける<br/>皇室</BigTitle></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`, marginTop: 62, width: '100%', background: C.panel, border: `2px solid ${C.line}`, borderRadius: 32, padding: '44px 30px'}}>
        <div style={{...font, fontSize: 130, fontWeight: 900, color: C.gold, letterSpacing: -4}}>{count}<span style={{fontSize: 52, letterSpacing: 0}}> 人</span></div>
        <div style={{...font, fontSize: 27, fontWeight: 700, color: C.muted, marginTop: 14}}>皇族の数は年々減少</div>
      </div>
      <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted, lineHeight: 1.6, marginTop: 56, opacity: b.opacity}}>
        女性皇族は結婚と同時に<br/><span style={{color: C.text}}>皇籍を離れるのが現行のルール</span>
      </div>
    </Scene>
  );
};

const Article12: React.FC = () => {
  const a = useEntrance('article12', 0.4, 0.8);
  const b = useEntrance('article12', 1.4, 0.8);
  const c = useEntrance('article12', 2.4, 0.8);
  return (
    <Scene id="article12">
      <Kicker>CORE OF THE BILL</Kicker>
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><BigTitle size={66}>第十二条の<br/>削除</BigTitle></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`, marginTop: 58, width: '100%', background: C.panel, border: `2px solid ${C.line}`, borderRadius: 32, padding: '42px 34px'}}>
        <div style={{...font, fontSize: 40, fontWeight: 900, color: C.text, lineHeight: 1.45}}>女性皇族は結婚後も<br/><span style={{color: C.gold}}>皇族の身分を保てる</span></div>
        <div style={{...font, fontSize: 25, fontWeight: 700, color: C.muted, marginTop: 20}}>残るかどうかは、本人の意思による</div>
      </div>
      <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted, lineHeight: 1.6, marginTop: 54, opacity: c.opacity, transform: `translateY(${c.y}px)`}}>
        「婚姻で皇籍を離れる」とする<br/><span style={{color: C.text}}>旧来の規定が取り除かれた</span>
      </div>
    </Scene>
  );
};

const Adoption: React.FC = () => {
  const a = useEntrance('adoption', 0.4, 0.8);
  const conds = [
    '旧宮家の男系男子',
    '十五歳以上であること',
    '未婚で子どもがいないこと',
  ];
  return (
    <Scene id="adoption">
      <div style={{position: 'absolute', top: 120, left: 70, textAlign: 'left'}}><Kicker>NEW SYSTEM</Kicker></div>
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><BigTitle size={64}>旧宮家からの<br/>養子縁組</BigTitle></div>
      <div style={{marginTop: 60, width: '100%', display: 'grid', gap: 24}}>
        {conds.map((cond, i) => {
          const e = useEntrance('adoption', 1.2 + i * 0.7, 0.7);
          return (
            <div key={i} style={{opacity: e.opacity, transform: `translateY(${e.y}px)`, display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: '30px 32px'}}>
              <div style={{width: 52, height: 52, borderRadius: '50%', background: 'rgba(212,169,78,.14)', border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 26, fontWeight: 900, color: C.gold, flexShrink: 0}}>{i + 1}</div>
              <div style={{...font, fontSize: 31, fontWeight: 900, color: C.text}}>{cond}</div>
            </div>
          );
        })}
      </div>
      <div style={{...font, fontSize: 25, fontWeight: 700, color: C.steel, marginTop: 50}}>一九四七年に皇籍を離れた十一宮家の<br/>男系男子が対象となる</div>
    </Scene>
  );
};

const Limits: React.FC = () => {
  const a = useEntrance('limits', 0.4, 0.8);
  const b = useEntrance('limits', 1.4, 0.8);
  const c = useEntrance('limits', 2.4, 0.8);
  const rows = [
    ['配偶者・子ども', '一般国民のまま、皇位継承の資格なし'],
    ['皇位継承', '男系男子による継承の伝統を維持'],
  ];
  return (
    <Scene id="limits">
      <Kicker>WHAT STAYS UNCHANGED</Kicker>
      <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><BigTitle size={66}>変わらない<br/>こともある</BigTitle></div>
      <div style={{marginTop: 62, width: '100%', display: 'grid', gap: 26}}>
        {rows.map((row, i) => {
          const e = i === 0 ? b : c;
          return (
            <div key={i} style={{opacity: e.opacity, transform: `translateY(${e.y}px)`, textAlign: 'left', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: '34px 34px'}}>
              <div style={{...font, fontSize: 34, fontWeight: 900, color: i === 0 ? C.vermilion : C.gold}}>{row[0]}</div>
              <div style={{...font, fontSize: 27, fontWeight: 600, color: C.text, marginTop: 12, lineHeight: 1.5}}>{row[1]}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const Enactment: React.FC = () => {
  const items = [
    ['2025.6', '閣議決定', '政府が改正案を決定'],
    ['2026.1〜', '国会審議', '通常国会で衆参両院が審議'],
    ['2026.7', '成立', '七十九年ぶりの本格改正'],
  ];
  return (
    <Scene id="enactment">
      <div style={{position: 'absolute', top: 120, left: 70, textAlign: 'left'}}><Kicker>ROAD TO ENACTMENT</Kicker></div>
      <BigTitle size={62}>成立までの道のり</BigTitle>
      <div style={{position: 'relative', width: '100%', marginTop: 72}}>
        <div style={{position: 'absolute', left: 104, top: 14, bottom: 14, width: 4, background: `linear-gradient(${C.gold}, ${C.vermilion})`}} />
        {items.map((item, i) => {
          const a = useEntrance('enactment', 0.7 + i * 0.7, 0.65);
          return (
            <div key={i} style={{position: 'relative', display: 'grid', gridTemplateColumns: '200px 1fr', textAlign: 'left', marginBottom: 54, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
              <div style={{...font, color: C.gold, fontSize: 34, fontWeight: 900}}>{item[0]}</div>
              <div style={{paddingLeft: 28}}>
                <div style={{...font, color: C.text, fontSize: 33, fontWeight: 900}}>{item[1]}</div>
                <div style={{...font, color: C.muted, fontSize: 24, fontWeight: 600, lineHeight: 1.45, marginTop: 8}}>{item[2]}</div>
              </div>
              <div style={{position: 'absolute', left: 94, top: 12, width: 24, height: 24, borderRadius: '50%', background: C.bg, border: `5px solid ${i === 2 ? C.vermilion : C.gold}`}} />
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
      <div style={{opacity: a.opacity}}><Kicker>DEBATE CONTINUES</Kicker></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`}}><BigTitle size={70}>論点は<br/>先送りされた</BigTitle></div>
      <div style={{width: 110, height: 6, background: C.gold, margin: '52px auto', opacity: b.opacity}} />
      <div style={{...font, fontSize: 33, fontWeight: 700, color: C.muted, lineHeight: 1.65, opacity: b.opacity}}>
        女性宮家の創設や<br/>安定した皇位継承のあり方は<br/><span style={{color: C.text}}>今後も続く国の論題です</span>
      </div>
    </Scene>
  );
};

export const ImperialHouseLaw: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame / fps, [AUDIO_END + 0.5, AUDIO_END + 2.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Background />
      <Intro />
      <ShrinkingHouse />
      <Article12 />
      <Adoption />
      <Limits />
      <Enactment />
      <Outro />
      <div style={{position: 'absolute', left: 50, bottom: 48, ...font, color: 'rgba(195,179,162,.5)', fontSize: 20, fontWeight: 600, letterSpacing: 1}}>IMPERIAL HOUSE LAW · 2026</div>
      <Audio src={staticFile('voiceover/narration.ja.mp3')} />
      <AbsoluteFill style={{background: '#050308', opacity: fade}} />
    </AbsoluteFill>
  );
};
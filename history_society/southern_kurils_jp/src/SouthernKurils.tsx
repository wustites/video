import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {notoSansJP} from './fonts';
import {IslandMap} from './IslandMap';
import {AUDIO_END, SceneId, useEntrance, useSceneOpacity, useSceneProgress} from './timing';

const C = {bg: '#071820', panel: '#102b35', text: '#f7f2e8', muted: '#a8bdc5', gold: '#f9c74f', coral: '#ef7b62', cyan: '#56c7d5', line: 'rgba(151,194,205,.22)'};
const font: React.CSSProperties = {fontFamily: `${notoSansJP.fontFamily}, sans-serif`};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.22;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 75% 18%, rgba(38,112,124,.34), transparent 34%), linear-gradient(155deg, ${C.bg}, #0b2630 54%, #07141b)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: -100, transform: `translateY(${drift % 64}px)`, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '64px 64px', opacity: .18}} />
    {[0,1,2,3].map((i) => <div key={i} style={{position: 'absolute', left: -160, top: 280 + i * 360 + Math.sin(frame / 40 + i) * 18, width: 1400, height: 220, border: '2px solid rgba(86,199,213,.09)', borderRadius: '50%'}} />)}
  </AbsoluteFill>;
};

const Scene: React.FC<{id: SceneId; children: React.ReactNode; align?: 'center'|'top'}> = ({id, children, align='center'}) => {
  const opacity = useSceneOpacity(id);
  return <AbsoluteFill style={{opacity, visibility: opacity > 0 ? 'visible' : 'hidden', padding: '118px 78px 110px', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', textAlign: 'center'}}>{children}</AbsoluteFill>;
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{...font, color: C.gold, fontSize: 27, letterSpacing: 7, fontWeight: 800, marginBottom: 34}}>{children}</div>;
const BigTitle: React.FC<{children: React.ReactNode; size?: number}> = ({children, size=88}) => <div style={{...font, color: C.text, fontSize: size, lineHeight: 1.16, letterSpacing: -3, fontWeight: 900}}>{children}</div>;

const Intro: React.FC = () => {
  const a = useEntrance('intro', .25, .8); const b = useEntrance('intro', 1.05, .9); const c = useEntrance('intro', 2.1, .7);
  return <Scene id="intro">
    <div style={{opacity: a.opacity, transform: `translateY(${a.y}px)`}}><Kicker>NORTHWEST PACIFIC</Kicker></div>
    <div style={{opacity: b.opacity, transform: `translateY(${b.y}px) scale(${b.scale})`}}><BigTitle size={105}>南千島群島</BigTitle><div style={{...font, fontSize: 33, fontWeight: 700, color: C.muted, marginTop: 24}}>南クリル諸島 ／ 北方領土</div></div>
    <div style={{width: 600, height: 5, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, margin: '48px 0', opacity: c.opacity}}/>
    <div style={{...font, fontSize: 39, fontWeight: 600, lineHeight: 1.55, color: C.text, opacity: c.opacity}}>海と火山、そして<br/>二つの国の記憶が交わる場所</div>
    <div style={{position: 'absolute', right: -160, bottom: -540, opacity: .19, transform: 'rotate(-8deg)'}}><IslandMap sceneId="intro" labels={false}/></div>
  </Scene>;
};

const Location: React.FC = () => <Scene id="location">
  <div style={{position:'absolute', inset:'170px 55px 80px 90px', display:'flex', alignItems:'center', justifyContent:'center'}}><IslandMap sceneId="location"/></div>
  <div style={{position:'absolute', top:110, left:70, textAlign:'left'}}><Kicker>WHERE THEY ARE</Kicker><BigTitle size={58}>北海道の北東へ</BigTitle></div>
  <div style={{position:'absolute', bottom:100, right:72, ...font, color:C.muted, fontSize:24, fontWeight:600}}>図は位置関係を示す概念図</div>
  </Scene>;

const Scale: React.FC = () => {
  const p = useSceneProgress('scale'); const count = Math.round(interpolate(p, [.08,.55], [0,5003], {extrapolateLeft:'clamp', extrapolateRight:'clamp'}));
  const items = [{n:'択捉島',v:3168,p:'63%'},{n:'国後島',v:1490,p:'30%'},{n:'色丹島',v:251,p:'5%'},{n:'歯舞群島',v:95,p:'2%'}];
  return <Scene id="scale"><Kicker>FOUR ISLANDS</Kicker><div style={{...font, color:C.text, fontSize:138, fontWeight:900, letterSpacing:-6}}>{count.toLocaleString()}<span style={{fontSize:56, letterSpacing:0}}> km²</span></div><div style={{...font,color:C.muted,fontSize:30,fontWeight:700,marginTop:8,marginBottom:64}}>四島の合計面積</div>
    <div style={{width:'100%',display:'grid',gap:20}}>{items.map((item,i)=>{const e=useEntrance('scale',1.3+i*.28,.5);return <div key={item.n} style={{opacity:e.opacity,transform:`translateX(${e.y}px)`,display:'grid',gridTemplateColumns:'180px 1fr 100px',alignItems:'center',gap:20}}><div style={{...font,color:C.text,fontSize:28,fontWeight:800,textAlign:'right'}}>{item.n}</div><div style={{height:24,background:'rgba(255,255,255,.08)',borderRadius:30,overflow:'hidden'}}><div style={{width:`${Number(item.p.replace('%',''))*e.opacity}%`,height:'100%',background:`linear-gradient(90deg,${C.gold},${C.coral})`,borderRadius:30}}/></div><div style={{...font,color:C.gold,fontSize:27,fontWeight:900,textAlign:'left'}}>{item.p}</div></div>})}</div>
  </Scene>;
};

const Nature: React.FC = () => {
  const p=useSceneProgress('nature');
  const cards=[['火','火山帯','島弧をつくる地形'],['氷','流氷と海霧','寒流が運ぶ冬'],['海','豊かな漁場','海流が育む生命']];
  return <Scene id="nature"><Kicker>FIRE · ICE · OCEAN</Kicker><BigTitle size={68}>火と氷のあいだ</BigTitle><div style={{marginTop:65,width:'100%',display:'grid',gap:24}}>{cards.map((x,i)=>{const e=useEntrance('nature',.8+i*.45,.7);return <div key={x[0]} style={{opacity:e.opacity,transform:`translateY(${e.y}px)`,display:'grid',gridTemplateColumns:'130px 1fr',textAlign:'left',alignItems:'center',background:'rgba(16,43,53,.8)',border:`1px solid ${C.line}`,borderRadius:28,padding:'26px 34px'}}><div style={{...font,fontSize:68,fontWeight:900,color:i===0?C.coral:i===1?C.cyan:C.gold}}>{x[0]}</div><div><div style={{...font,fontSize:35,fontWeight:900,color:C.text}}>{x[1]}</div><div style={{...font,fontSize:25,fontWeight:600,color:C.muted,marginTop:5}}>{x[2]}</div></div></div>})}</div><div style={{position:'absolute',bottom:150,left:80,right:80,height:120,overflow:'hidden',opacity:.5}}>{[0,1,2].map(i=><div key={i} style={{position:'absolute',width:800,height:90,border:`3px solid ${C.cyan}`,borderRadius:'50%',left:-80+i*240,top:20+Math.sin(p*12+i)*15}}/>)}</div></Scene>;
};

const History: React.FC = () => {
  const events=[['1855','日露通好条約','国境を択捉島と得撫島の間に'],['1945','ソ連が四島を占領','終戦前後に支配が移る'],['1956','日ソ共同宣言','国交回復。平和条約交渉を継続']];
  return <Scene id="history"><Kicker>THREE DATES</Kicker><BigTitle size={66}>境界をめぐる歴史</BigTitle><div style={{position:'relative',width:'100%',marginTop:78}}><div style={{position:'absolute',left:104,top:15,bottom:15,width:4,background:`linear-gradient(${C.gold},${C.coral})`}}/>{events.map((e,i)=>{const a=useEntrance('history',.8+i*.75,.65);return <div key={e[0]} style={{position:'relative',display:'grid',gridTemplateColumns:'175px 1fr',textAlign:'left',marginBottom:58,opacity:a.opacity,transform:`translateY(${a.y}px)`}}><div style={{...font,color:C.gold,fontSize:38,fontWeight:900}}>{e[0]}</div><div style={{paddingLeft:35}}><div style={{...font,color:C.text,fontSize:34,fontWeight:900}}>{e[1]}</div><div style={{...font,color:C.muted,fontSize:25,fontWeight:600,lineHeight:1.45,marginTop:8}}>{e[2]}</div></div><div style={{position:'absolute',left:94,top:12,width:24,height:24,borderRadius:'50%',background:C.bg,border:`5px solid ${i===2?C.coral:C.gold}`}}/></div>})}</div></Scene>;
};

const Positions: React.FC = () => {
  const left=useEntrance('positions',.55,.75), right=useEntrance('positions',1.3,.75), note=useEntrance('positions',2.25,.7);
  return <Scene id="positions"><Kicker>TWO POSITIONS</Kicker><BigTitle size={65}>現在の四島</BigTitle><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22,width:'100%',marginTop:62}}>
    <div style={{opacity:left.opacity,transform:`translateY(${left.y}px)`,background:'rgba(239,123,98,.12)',border:'2px solid rgba(239,123,98,.55)',borderRadius:30,padding:'42px 24px'}}><div style={{...font,color:C.coral,fontSize:28,fontWeight:900,letterSpacing:3}}>ロシア</div><div style={{...font,color:C.text,fontSize:37,fontWeight:900,lineHeight:1.4,marginTop:25}}>実効支配<br/>自国領と主張</div></div>
    <div style={{opacity:right.opacity,transform:`translateY(${right.y}px)`,background:'rgba(86,199,213,.12)',border:'2px solid rgba(86,199,213,.55)',borderRadius:30,padding:'42px 24px'}}><div style={{...font,color:C.cyan,fontSize:28,fontWeight:900,letterSpacing:3}}>日本</div><div style={{...font,color:C.text,fontSize:37,fontWeight:900,lineHeight:1.4,marginTop:25}}>返還を要求<br/>固有の領土と主張</div></div>
  </div><div style={{opacity:note.opacity,...font,color:C.muted,fontSize:29,fontWeight:700,lineHeight:1.6,marginTop:58}}>双方の立場には隔たりがあり<br/>領土問題は未解決のまま</div></Scene>;
};

const Outro: React.FC = () => {const a=useEntrance('outro',.25,.8),b=useEntrance('outro',1.2,.8),c=useEntrance('outro',2.3,.8);return <Scene id="outro"><div style={{opacity:a.opacity}}><Kicker>UNRESOLVED</Kicker></div><div style={{opacity:b.opacity,transform:`translateY(${b.y}px)`}}><BigTitle size={73}>平和条約は<br/>まだ結ばれていない</BigTitle></div><div style={{width:110,height:6,background:C.gold,margin:'55px auto',opacity:c.opacity}}/><div style={{...font,color:C.muted,fontSize:34,fontWeight:700,lineHeight:1.65,opacity:c.opacity}}>自然・暮らし・外交が交差する<br/><span style={{color:C.text}}>北の海の、四つの島々</span></div></Scene>};

export const SouthernKurils: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const fade=interpolate(frame/fps,[AUDIO_END+.5,AUDIO_END+2.4],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:C.bg}}><Background/><Intro/><Location/><Scale/><Nature/><History/><Positions/><Outro/><div style={{position:'absolute',left:50,bottom:48,...font,color:'rgba(168,189,197,.55)',fontSize:20,fontWeight:600,letterSpacing:1}}>SOUTHERN KURILS · EXPLAINED</div><Audio src={staticFile('voiceover/narration.ja.mp3')}/><AbsoluteFill style={{background:'#020609',opacity:fade}}/></AbsoluteFill>;
};

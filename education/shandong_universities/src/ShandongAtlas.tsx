import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CITIES, City} from './data';
import {FADE_OUT, useEntrance, useSceneOpacity} from './timing';
import {fontFamily} from './fonts';
import {GEO_CITIES, MAP_VIEWBOX_H, MAP_VIEWBOX_W, PROVINCE_PATH} from './shandongGeo';

const C = {bg:'#071B2D',panel:'#0F3D56',cyan:'#19C3B1',gold:'#F4B942',white:'#F4F7F8',muted:'#A7C0C8'};
const font = {fontFamily: `"${fontFamily}", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`};
const Scene:React.FC<{id:string;children:React.ReactNode}>=({id,children})=>{const opacity=useSceneOpacity(id);if(opacity<=0)return null;return <AbsoluteFill style={{opacity,padding:'92px 72px',justifyContent:'center',color:C.white,...font}}>{children}</AbsoluteFill>;};

const Background:React.FC=()=> <AbsoluteFill style={{background:C.bg,...font}}><div style={{position:'absolute',inset:0,opacity:.15,backgroundImage:`linear-gradient(rgba(25,195,177,.32) 1px,transparent 1px),linear-gradient(90deg,rgba(25,195,177,.32) 1px,transparent 1px)`,backgroundSize:'54px 54px'}}/><div style={{position:'absolute',left:-180,top:420,width:1100,height:1100,border:'2px solid rgba(25,195,177,.18)',borderRadius:'50%'}}/></AbsoluteFill>;

const GEO_BY_NAME = new Map(GEO_CITIES.map((g)=>[g.name,g]));

// 真实山东省地图：省界 + 16 地级市分区，标记与标签按数据生成的真实坐标摆放。
// 地图在 viewBox 坐标系内构建（MAP_VIEWBOX_W × MAP_VIEWBOX_H），
// 标记/标签用百分比定位到相同坐标系，文字以固定像素渲染，保证任何尺寸下清晰。
export const ProvinceMap:React.FC<{width:number;active?:string;labels:'all'|'active'|'none'}>=({width,active,labels})=>{
  const f=useCurrentFrame();
  const h=Math.round(MAP_VIEWBOX_H*width/MAP_VIEWBOX_W);
  const s=width/MAP_VIEWBOX_W; // 1 viewBox 单位对应的像素
  const act=active?GEO_BY_NAME.get(active):undefined;
  const actSide=act&&act.x>560?-1:1; // 迷你图中城市标签放到更空旷的一侧
  return <div style={{position:'relative',width,height:h}}>
    <svg viewBox={`0 0 ${MAP_VIEWBOX_W} ${MAP_VIEWBOX_H}`} style={{position:'absolute',inset:0,filter:'drop-shadow(0 18px 24px rgba(0,0,0,.35))'}}>
      <path d={PROVINCE_PATH} fill={C.panel} stroke={C.cyan} strokeWidth={1.4*s} strokeLinejoin="round"/>
      {GEO_CITIES.map((g)=>{
        const isActive=g.name===active;
        return <path key={g.name} d={g.path}
          fill={isActive?'rgba(244,185,66,.16)':'rgba(15,61,86,.5)'}
          stroke={isActive?'rgba(244,185,66,.9)':'rgba(25,195,177,.38)'}
          strokeWidth={isActive?3*s:1*s} strokeLinejoin="round"/>;
      })}
    </svg>
    {GEO_CITIES.map((g)=>{
      const isActive=g.name===active;
      const dim=active!==undefined&&!isActive;
      const r=(isActive?24:12)*s*(isActive?1+.14*Math.sin(f/12):1);
      return <div key={g.name} style={{position:'absolute',left:`${g.x/MAP_VIEWBOX_W*100}%`,top:`${g.y/MAP_VIEWBOX_H*100}%`,width:r,height:r,marginLeft:-r/2,marginTop:-r/2,borderRadius:'50%',background:isActive?C.gold:C.cyan,border:`${(isActive?3:1.6)*s}px solid rgba(7,27,45,.9)`,boxShadow:isActive?`0 0 0 ${16*s}px rgba(244,185,66,.16)`:'0 2px 6px rgba(0,0,0,.45)',opacity:dim?.32:1}}/>;
    })}
    {labels==='all'&&GEO_CITIES.map((g)=><div key={g.name} style={{position:'absolute',left:`${g.lx/MAP_VIEWBOX_W*100}%`,top:`${g.ly/MAP_VIEWBOX_H*100}%`,transform:'translate(-50%,-50%)',fontSize:19*s,fontWeight:g.name===active?900:500,color:g.name===active?C.white:C.muted,letterSpacing:1,whiteSpace:'nowrap'}}>{g.name}</div>)}
    {labels==='active'&&act&&<div style={{position:'absolute',left:`${((act.x+actSide*46)/MAP_VIEWBOX_W)*100}%`,top:`${(act.y/MAP_VIEWBOX_H)*100}%`,transform:actSide>0?'translate(0,-50%)':'translate(-100%,-50%)',fontSize:22,fontWeight:900,color:C.white,letterSpacing:2,whiteSpace:'nowrap'}}>{act.name}</div>}
  </div>;
};

const Header:React.FC<{text:string;index?:string}>=({text,index})=><div style={{position:'absolute',top:70,left:72,right:72,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:23,letterSpacing:4,color:C.cyan,fontWeight:900}}>{text}</span>{index&&<span style={{fontSize:23,letterSpacing:3,color:C.gold}}>{index}</span>}</div>;

const Intro:React.FC=()=>{const a=useEntrance('intro',0,0.8);return <Scene id="intro"><Header text="SHANDONG · UNIVERSITY ATLAS"/><div style={{opacity:a}}><div style={{fontSize:116,fontWeight:900,lineHeight:1.06,letterSpacing:-5}}>山东各地<br/>重点本科院校</div><div style={{width:270,height:8,background:C.gold,marginTop:34}}/><div style={{fontSize:32,lineHeight:1.55,color:C.muted,marginTop:34}}>16 个地市快速盘点<br/>每个地区最多 5 所代表性院校</div></div><div style={{position:'absolute',right:24,bottom:110,opacity:.92}}><ProvinceMap width={800} labels="none"/></div></Scene>;};

const Overview:React.FC=()=> <Scene id="overview"><Header text="全省总览" index="16 地市"/><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}><div style={{fontSize:50,fontWeight:900}}>从鲁西南到胶东沿海</div><div style={{fontSize:27,color:C.muted}}>真实省界与地市分区 · 圆点为地级市行政中心</div><ProvinceMap width={940} labels="all"/></div><div style={{position:'absolute',left:72,bottom:72,fontSize:19,color:C.muted,letterSpacing:1}}>代表性本科院校 · 非官方排名 · 具体招生以当年章程为准</div></Scene>;

const CityScene:React.FC<{city:City;index:number}>=({city,index})=>{const a=useEntrance(city.name,0);const b=useEntrance(city.name,0,0.8);return <Scene id={city.name}><Header text="地市速览" index={`${String(index).padStart(2,'0')} / 16`}/><div style={{display:'flex',alignItems:'center',gap:44,width:'100%',opacity:a,transform:`translateY(${(1-a)*22}px)`}}><div style={{flex:'0 0 460px',display:'flex',flexDirection:'column',gap:16}}><div style={{display:'inline-flex',alignSelf:'flex-start',padding:'12px 20px',border:`2px solid ${C.cyan}`,color:C.cyan,fontSize:25,fontWeight:900}}>{city.name} · 本科院校</div><div style={{fontSize:23,color:C.gold,letterSpacing:2,fontWeight:900}}>代表性重点院校（非排名）</div><div style={{fontSize:66,fontWeight:900,lineHeight:1.08}}>{city.name}</div><div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>{city.schools.map((school,i)=><div key={school} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',background:i===0?'rgba(15,61,86,.9)':'rgba(15,61,86,.55)',borderLeft:`5px solid ${i===0?C.gold:C.cyan}`,fontSize:28,fontWeight:i===0?900:700}}><span style={{color:C.gold,fontSize:20}}>{String(i+1).padStart(2,'0')}</span>{school}</div>)}</div></div><div style={{flex:1,display:'flex',justifyContent:'center',opacity:b,transform:`scale(${.96+.04*b})`}}><ProvinceMap width={430} active={city.name} labels="active"/></div></div></Scene>};

const Outro:React.FC=()=> <Scene id="outro"><Header text="END CARD"/><div style={{fontSize:70,fontWeight:900,lineHeight:1.12}}>一张地图，<br/>看懂山东本科版图</div><div style={{width:270,height:8,background:C.gold,marginTop:34}}/><div style={{fontSize:30,lineHeight:1.55,color:C.muted,maxWidth:850,marginTop:30}}>本片按地市盘点代表性本科院校，不构成院校排名或志愿建议。报考前请核对当年官方招生章程。</div></Scene>;

// 结尾黑场：旁白结束后 0.5s 起、2.5s 内淡到全黑，避免最后一帧硬切
const FadeToBlack:React.FC=()=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const o=interpolate(f/fps,[FADE_OUT.start,FADE_OUT.end],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});return <AbsoluteFill style={{background:'#000',opacity:o,pointerEvents:'none'}}/>;};

export const ShandongAtlas:React.FC=()=> <AbsoluteFill><Background/><Intro/><Overview/>{CITIES.map((city,i)=><CityScene key={city.name} city={city} index={i+1}/>)}<Outro/><FadeToBlack/><Audio src={staticFile('voiceover/narration.zh.mp3')}/></AbsoluteFill>;
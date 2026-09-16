import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CITIES, City} from './data';
import {CAMERA_KEYS, FADE_OUT, useContentOpacity, useEntrance} from './timing';
import {fontFamily} from './fonts';
import {
  Camera,
  CameraView,
  cameraAt,
  cityOf,
  Focus,
  focusAt,
  focusWeight,
  FRAME,
  MAP_BAND_BOTTOM,
  project,
  viewOf,
} from './mapCamera';
import {GEO_CITIES, MAP_VIEWBOX_W, PROVINCE_PATH} from './shandongGeo';

const C = {bg:'#071B2D',panel:'#0F3D56',cyan:'#19C3B1',gold:'#F4B942',white:'#F4F7F8',muted:'#A7C0C8'};
const font = {fontFamily: `"${fontFamily}", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`};

/** 左右安全边距 */
const PAD = 68;

/** 屏幕下半部分的信息卡：顶边与 MAP_BAND_BOTTOM 对齐，高度固定，版面不随内容跳动 */
const SHEET_TOP = MAP_BAND_BOTTOM;
const SHEET_SCRIM = 170; // 地图向信息卡过渡的渐变高度

const ROW_H = 88;
const ROW_GAP = 10;

const Scene:React.FC<{id:string;children:React.ReactNode}>=({id,children})=>{
  const opacity=useContentOpacity(id);
  if(opacity<=0)return null;
  return <AbsoluteFill style={{opacity,color:C.white,...font}}>{children}</AbsoluteFill>;
};

const Background:React.FC=()=> <AbsoluteFill style={{background:C.bg,...font}}><div style={{position:'absolute',inset:0,opacity:.15,backgroundImage:`linear-gradient(rgba(25,195,177,.32) 1px,transparent 1px),linear-gradient(90deg,rgba(25,195,177,.32) 1px,transparent 1px)`,backgroundSize:'54px 54px'}}/></AbsoluteFill>;

/** 聚焦地市的名字牌：贴在行政中心标记旁边，切换时随相机一起淡入淡出 */
const CityTag:React.FC<{name:string;view:CameraView;opacity:number}>=({name,view,opacity})=>{
  const g=cityOf(name);
  const p=project(view,g.x,g.y);
  const side=p.px>FRAME.width/2?-1:1; // 名字牌放在画面更空旷的一侧
  return <div style={{position:'absolute',left:p.px+side*38,top:p.py,transform:side>0?'translate(0,-50%)':'translate(-100%,-50%)',opacity,padding:'10px 22px',background:'rgba(7,27,45,.88)',border:`2px solid ${C.gold}`,borderRadius:2,fontSize:40,fontWeight:900,letterSpacing:3,whiteSpace:'nowrap',color:C.white,boxShadow:'0 10px 26px rgba(0,0,0,.5)'}}>{g.name}</div>;
};

// 真实山东省地图：省界 + 16 地级市分区，整层常驻，相机逐场驱动。
// 相机给出可见 viewBox 矩形（中心 + 宽度），SVG 的 viewBox 直接跟着相机走，
// 因此平移缩放是连续的；标记与标签是 HTML 覆盖层，按同一映射换算成像素，
// 描边宽度按 1/scale 折算，放大时线宽与文字大小都保持恒定。
const MapLayer:React.FC=()=>{
  const f=useCurrentFrame();
  const camera:Camera=cameraAt(f,CAMERA_KEYS);
  const focus:Focus=focusAt(f,CAMERA_KEYS);
  const view=viewOf(camera);
  const toUnits=(px:number)=>px/view.scale; // 像素 → viewBox 单位
  const focused=focus.to!==undefined||focus.from!==undefined;
  // 全省视图才显示全部地市名，推进到地市后只留聚焦标签
  const labelFade=interpolate(camera.vbW,[MAP_VIEWBOX_W*0.5,MAP_VIEWBOX_W*0.78],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
    <svg width={FRAME.width} height={FRAME.height} viewBox={`${view.x0} ${view.y0} ${view.vbW} ${view.vbH}`} style={{position:'absolute',left:0,top:0}}>
      <path d={PROVINCE_PATH} fill={C.panel} stroke="rgba(25,195,177,.6)" strokeWidth={toUnits(2.6)} strokeLinejoin="round"/>
      {GEO_CITIES.map((g)=>{
        const w=focusWeight(focus,g.name);
        return <React.Fragment key={g.name}>
          {w>0&&<path d={g.path} fill="none" stroke={`rgba(244,185,66,${.26*w})`} strokeWidth={toUnits(14)} strokeLinejoin="round"/>}
          <path d={g.path}
            fill={w>0?`rgba(244,185,66,${.06+.2*w})`:'rgba(15,61,86,.55)'}
            stroke={w>0?`rgba(244,185,66,${.55+.35*w})`:'rgba(25,195,177,.38)'}
            strokeWidth={toUnits(w>0?2.8:1.5)}
            opacity={focused&&w<=0?.42:1}
            strokeLinejoin="round"/>
        </React.Fragment>;
      })}
    </svg>
    {GEO_CITIES.map((g)=>{
      const w=focusWeight(focus,g.name);
      const p=project(view,g.x,g.y);
      const r=8+12*w+(w>0?2.2*Math.sin(f/9):0);
      return <div key={g.name} style={{position:'absolute',left:p.px,top:p.py,width:r*2,height:r*2,marginLeft:-r,marginTop:-r,borderRadius:'50%',background:w>.2?C.gold:C.cyan,border:'3px solid rgba(7,27,45,.9)',boxShadow:w>.2?`0 0 0 ${10+6*w}px rgba(244,185,66,.18)`:'0 2px 6px rgba(0,0,0,.5)',opacity:focused&&w<=0?.4:1}}/>;
    })}
    {labelFade>0&&GEO_CITIES.map((g)=>{
      const p=project(view,g.lx,g.ly);
      return <div key={g.name} style={{position:'absolute',left:p.px,top:p.py,transform:'translate(-50%,-50%)',fontSize:22,fontWeight:600,color:C.muted,letterSpacing:1,whiteSpace:'nowrap',opacity:labelFade*(focused?.6:1)}}>{g.name}</div>;
    })}
    {[focus.from,focus.to].filter((name,i,list)=>name!==undefined&&list.indexOf(name)===i).map((name)=><CityTag key={name} name={name!} view={view} opacity={focusWeight(focus,name!)}/>)}
  </div>;
};

/** 顶部标题条与它下方的一层遮罩，保证文字压在地图上依然清晰 */
const Header:React.FC<{text:string;right?:string}>=({text,right})=> <div style={{position:'absolute',left:0,right:0,top:0,height:190,background:`linear-gradient(180deg,rgba(7,27,45,.94),rgba(7,27,45,0))`}}><div style={{position:'absolute',top:64,left:PAD,right:PAD,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:24,letterSpacing:5,color:C.cyan,fontWeight:900}}>{text}</span>{right&&<span style={{fontSize:24,letterSpacing:3,color:C.gold,fontWeight:900}}>{right}</span>}</div></div>;

/** 底部信息卡的底板：整层常驻，不随场景淡入淡出，场景只负责在它上面切换文字 */
const SheetPanel:React.FC=()=> <>
  <div style={{position:'absolute',left:0,right:0,top:SHEET_TOP-SHEET_SCRIM,height:SHEET_SCRIM,background:`linear-gradient(180deg,rgba(7,27,45,0),${C.bg})`}}/>
  <div style={{position:'absolute',left:0,right:0,top:SHEET_TOP,bottom:0,background:C.bg,borderTop:`1px solid rgba(25,195,177,.3)`}}/>
</>;

/** 信息卡内容区：固定高度、内容垂直居中，短名单不会让版面塌下去 */
const Sheet:React.FC<{children:React.ReactNode}>=({children})=>
  <div style={{position:'absolute',left:0,right:0,top:SHEET_TOP,bottom:0,padding:`48px ${PAD}px`,display:'flex',flexDirection:'column',justifyContent:'center'}}>{children}</div>;

const Rule:React.FC=()=> <div style={{width:118,height:8,background:C.gold,margin:'24px 0 0'}}/>;

const Intro:React.FC=()=>{const a=useEntrance('intro',0.12,0.35);return <Scene id="intro"><Header text="SHANDONG · UNIVERSITY ATLAS" right="山东 · 16 地市"/><Sheet><div style={{opacity:a,transform:`translateY(${(1-a)*60}px)`}}><div style={{fontSize:22,letterSpacing:7,color:C.cyan,fontWeight:900}}>16 个地市 · 一张地图</div><div style={{fontSize:92,fontWeight:900,lineHeight:1.12,letterSpacing:-2,marginTop:18}}>山东各地<br/>重点本科院校</div><Rule/><div style={{fontSize:32,lineHeight:1.55,color:C.muted,marginTop:24}}>每个地市最多 5 所代表性院校<br/>旁白按地市逐个切换，地图同步聚焦</div></div></Sheet></Scene>;};

const CityScene:React.FC<{city:City;index:number}>=({city,index})=>{const a=useEntrance(city.name,0.12,0.35);return <Scene id={city.name}><Header text="地市速览" right={`${String(index).padStart(2,'0')} / ${CITIES.length}`}/><Sheet><div style={{opacity:a,transform:`translateY(${(1-a)*60}px)`}}><div style={{display:'flex',alignItems:'baseline',gap:20}}><span style={{fontSize:88,fontWeight:900,lineHeight:1,letterSpacing:-2}}>{city.name}</span><span style={{fontSize:28,color:C.muted}}>本科院校 {city.schools.length} 所</span></div><div style={{fontSize:24,color:C.gold,letterSpacing:4,fontWeight:900,marginTop:14}}>代表性重点院校</div><div style={{display:'flex',flexDirection:'column',gap:ROW_GAP,marginTop:22}}>{city.schools.map((school,i)=><div key={school} style={{display:'flex',alignItems:'center',gap:20,height:ROW_H,paddingLeft:22,background:'rgba(15,61,86,.55)',borderLeft:`5px solid ${C.cyan}`}}><span style={{color:C.muted,fontSize:22,fontWeight:900}}>{String(i+1).padStart(2,'0')}</span><span style={{fontSize:40,fontWeight:800}}>{school}</span></div>)}</div></div></Sheet></Scene>;};

// 结尾黑场：旁白结束后 0.5s 起、2.5s 内淡到全黑，避免最后一帧硬切
const FadeToBlack:React.FC=()=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const o=interpolate(f/fps,[FADE_OUT.start,FADE_OUT.end],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});return <AbsoluteFill style={{background:'#000',opacity:o,pointerEvents:'none'}}/>;};

export const ShandongAtlas:React.FC=()=> <AbsoluteFill><Background/><MapLayer/><SheetPanel/><Intro/>{CITIES.map((city,i)=><CityScene key={city.name} city={city} index={i+1}/>)}<FadeToBlack/><Audio src={staticFile('voiceover/narration.zh.mp3')}/></AbsoluteFill>;

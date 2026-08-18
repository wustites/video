import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEntrance, useSceneOpacity} from './timing';

const W = 1080;
const H = 1920;

const C = {
  bg: '#07090f',
  panel: 'rgba(18,24,38,0.9)',
  panel2: 'rgba(12,17,28,0.92)',
  border: '#26304a',
  borderSoft: 'rgba(52,64,96,0.55)',
  text: '#f5f7fc',
  sub: '#c3ccdc',
  muted: '#8592ab',
  fine: '#5b6984',
  orange: '#f6821f',
  orange2: '#ffb45a',
  green: '#3ddc97',
};

const font = {
  fontFamily: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", "Arial", sans-serif',
};

/* ---------------- 通用组件 ---------------- */

const Scene: React.FC<{id: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  id,
  children,
  style,
}) => {
  const opacity = useSceneOpacity(id);
  return (
    <AbsoluteFill
      style={{
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 90px',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode; sceneId: string; offsetSec?: number; color?: string}> = ({
  children,
  sceneId,
  offsetSec = 0.2,
  color = C.orange,
}) => {
  const e = useEntrance(sceneId, offsetSec, 0.5);
  return (
    <div
      style={{
        ...font,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 6,
        color,
        textTransform: 'uppercase',
        border: `1.5px solid ${color}`,
        borderRadius: 999,
        padding: '14px 40px',
        marginBottom: 46,
        opacity: e.opacity,
        transform: `translateY(${(1 - e.opacity) * -18}px)`,
      }}
    >
      {children}
    </div>
  );
};

const MilestoneChip: React.FC<{
  year: string;
  title: string;
  desc?: string;
  accent?: string;
  delay: number;
  sceneId: string;
  style?: React.CSSProperties;
}> = ({year, title, desc, accent = C.orange, delay, sceneId, style}) => {
  const e = useEntrance(sceneId, delay, 0.55, 'rise');
  return (
    <div
      style={{
        width: 430,
        padding: '34px 26px',
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 30,
        textAlign: 'center',
        opacity: e.opacity,
        transform: e.transform,
        ...style,
      }}
    >
      <div style={{...font, fontSize: 52, fontWeight: 900, color: accent, lineHeight: 1}}>{year}</div>
      <div style={{...font, fontSize: 34, fontWeight: 800, color: C.text, marginTop: 16}}>{title}</div>
      {desc ? (
        <div
          style={{
            ...font,
            fontSize: 25,
            fontWeight: 500,
            color: C.muted,
            marginTop: 10,
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {desc}
        </div>
      ) : null}
    </div>
  );
};

/* ---------------- 全局背景 ---------------- */

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const slow = frame / 30;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {/* 顶部橙色辉光 */}
      <div
        style={{
          position: 'absolute',
          top: -420,
          left: -260,
          width: 1300,
          height: 1300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(246,130,31,0.16) 0%, rgba(246,130,31,0.05) 45%, transparent 70%)',
        }}
      />
      {/* 底部冷色辉光 */}
      <div
        style={{
          position: 'absolute',
          bottom: -520,
          right: -320,
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,220,151,0.07) 0%, rgba(61,220,151,0.02) 50%, transparent 70%)',
        }}
      />
      {/* 旋转细环 */}
      {[
        {size: 1500, speed: 6, border: '1px solid rgba(246,130,31,0.10)'},
        {size: 1150, speed: -9, border: '1px dashed rgba(100,120,170,0.16)'},
        {size: 800, speed: 14, border: '1px solid rgba(246,130,31,0.14)'},
      ].map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: r.size,
            height: r.size,
            marginLeft: -r.size / 2,
            marginTop: -r.size / 2,
            borderRadius: '50%',
            border: r.border,
            transform: `rotate(${slow * r.speed}deg)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: C.orange,
              opacity: 0.8,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      ))}
      {/* 底纹网格 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------- 场景 1：开场 ---------------- */
const Intro: React.FC = () => {
  const badge = useEntrance('intro', 0.4, 0.6);
  const title = useEntrance('intro', 0.9, 0.9, 'rise');
  const cn = useEntrance('intro', 1.7, 0.7);
  const line = useEntrance('intro', 2.3, 0.8);
  const tag = useEntrance('intro', 2.9, 0.6);
  const hint = useEntrance('intro', 3.8, 0.6);
  return (
    <Scene id="intro">
      <div style={{opacity: badge.opacity, transform: `translateY(${(1 - badge.opacity) * -20}px)`}}>
        <div
          style={{
            ...font,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 6,
            color: C.orange,
            border: '1.5px solid rgba(246,130,31,0.55)',
            borderRadius: 999,
            padding: '14px 40px',
            textTransform: 'uppercase',
          }}
        >
          企业史科普 · 2009 — 2026
        </div>
      </div>
      <div style={{opacity: title.opacity, transform: title.transform, marginTop: 56}}>
        <div
          style={{
            ...font,
            fontSize: 148,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 1,
            background: 'linear-gradient(180deg, #ffd9a0 0%, #f6821f 55%, #c75d0a 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          CLOUDFLARE
        </div>
      </div>
      <div style={{opacity: cn.opacity, transform: cn.transform, marginTop: 46}}>
        <div style={{...font, fontSize: 88, fontWeight: 900, letterSpacing: 30, color: C.text, textIndent: 30}}>
          发展历程
        </div>
      </div>
      <div
        style={{
          width: 600 * line.opacity,
          height: 7,
          background: 'linear-gradient(90deg, transparent, #f6821f, transparent)',
          borderRadius: 999,
          marginTop: 60,
        }}
      />
      <div
        style={{
          ...font,
          marginTop: 58,
          fontSize: 46,
          fontWeight: 700,
          color: C.sub,
          lineHeight: 1.6,
          opacity: tag.opacity,
        }}
      >
        从三个人
        <br />
        到互联网的守护者
      </div>
      <div
        style={{
          ...font,
          position: 'absolute',
          bottom: 120,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 3,
          color: C.fine,
          opacity: hint.opacity,
        }}
      >
        ONE MAN'S DDoS IS ANOTHER MAN'S... · Cloudflare · 2009—2026
      </div>
    </Scene>
  );
};

/* ---------------- 场景 2：创立 ---------------- */
const Founding: React.FC = () => {
  const k = useEntrance('founding', 0.2, 0.5);
  const t = useEntrance('founding', 0.6, 0.6);
  const c1 = useEntrance('founding', 1.4, 0.55, 'rise');
  const c2 = useEntrance('founding', 1.7, 0.55, 'rise');
  const c3 = useEntrance('founding', 2.0, 0.55, 'rise');
  const name = useEntrance('founding', 3.0, 0.6, 'scale');
  const chips = useEntrance('founding', 3.9, 0.6);
  const founders = [
    {en: 'Matthew Prince', zh: '马修·普林斯', e: c1},
    {en: 'Michelle Zatlyn', zh: '米歇尔·扎特林', e: c2},
    {en: 'Lee Holloway', zh: '李·霍洛韦', e: c3},
  ];
  return (
    <Scene id="founding">
      <Kicker sceneId="founding">2009 · 创立</Kicker>
      <div
        style={{
          ...font,
          fontSize: 66,
          fontWeight: 900,
          lineHeight: 1.3,
          letterSpacing: -1,
          color: C.text,
          opacity: t.opacity,
          transform: t.transform,
        }}
      >
        三位创始人
        <br />
        一间小公司
      </div>
      <div style={{display: 'flex', gap: 30, marginTop: 64}}>
        {founders.map((f) => (
          <div
            key={f.en}
            style={{
              width: 280,
              padding: '40px 16px',
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 30,
              opacity: f.e.opacity,
              transform: f.e.transform,
            }}
          >
            <div
              style={{
                ...font,
                fontSize: 24,
                fontWeight: 800,
                color: C.orange,
                letterSpacing: 0.5,
              }}
            >
              {f.en}
            </div>
            <div style={{...font, fontSize: 28, fontWeight: 700, color: C.text, marginTop: 12}}>{f.zh}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          ...font,
          marginTop: 54,
          fontSize: 40,
          fontWeight: 800,
          color: C.text,
          background: 'rgba(246,130,31,0.12)',
          border: '1px solid rgba(246,130,31,0.5)',
          borderRadius: 999,
          padding: '22px 44px',
          opacity: name.opacity,
          transform: name.transform,
        }}
      >
        Cloudflare = 「云中的防火墙」
      </div>
      <div
        style={{
          display: 'flex',
          gap: 26,
          marginTop: 54,
          opacity: chips.opacity,
        }}
      >
        {['📍 美国 · 加州', '🚀 亮相 TechCrunch Disrupt (2010.09)'].map((s) => (
          <div
            key={s}
            style={{
              ...font,
              fontSize: 27,
              fontWeight: 700,
              color: C.sub,
              background: C.panel,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 999,
              padding: '16px 30px',
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ---------------- 场景 3：成名 ---------------- */
const Fame: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.08 * Math.sin((frame / 30) * 2.4);
  const shield = useEntrance('fame', 0.6, 0.7, 'scale');
  const t = useEntrance('fame', 1.5, 0.6);
  const y1 = useEntrance('fame', 2.4, 0.55, 'rise');
  const y2 = useEntrance('fame', 2.7, 0.55, 'rise');
  const stat = useEntrance('fame', 3.6, 0.6, 'scale');
  return (
    <Scene id="fame">
      <Kicker sceneId="fame">2011 / 2013 · 一战成名</Kicker>
      {/* 盾牌：防御攻击 */}
      <div style={{position: 'relative', width: 330, height: 330, opacity: shield.opacity, transform: shield.transform}}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: -34 * i,
              borderRadius: '50%',
              border: '1.5px solid rgba(246,130,31,0.28)',
              transform: `scale(${pulse * (1 - i * 0.06)})`,
              opacity: 0.55 - i * 0.14,
            }}
          />
        ))}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #2a1c0e 0%, #1b1208 60%, #120b06 100%)',
            border: '3px solid #f6821f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{fontSize: 120, lineHeight: 1}}>🛡️</div>
          <div style={{...font, fontSize: 30, fontWeight: 900, color: C.orange, marginTop: 8, letterSpacing: 2}}>
            DDoS ×
          </div>
        </div>
      </div>
      <div
        style={{
          ...font,
          marginTop: 60,
          fontSize: 54,
          fontWeight: 900,
          color: C.text,
          lineHeight: 1.4,
          opacity: t.opacity,
          transform: t.transform,
        }}
      >
        替网站挡下
        <br />
        骇人的攻击洪流
      </div>
      <div style={{display: 'flex', gap: 34, marginTop: 60}}>
        <MilestoneChip
          sceneId="fame"
          delay={2.4}
          year="2011"
          title="初露锋芒"
          desc={'为知名目标\n抵御 DDoS 攻击'}
          accent={C.orange}
          style={{width: 400}}
        />
        <MilestoneChip
          sceneId="fame"
          delay={2.7}
          year="2013"
          title="硬刚史上之最"
          desc={'Spamhaus 攻击\n峰值 300Gbps+'}
          accent={C.green}
          style={{width: 400}}
        />
      </div>
      <div
        style={{
          ...font,
          marginTop: 56,
          fontSize: 38,
          fontWeight: 800,
          color: '#ffd9a0',
          background: C.panel,
          border: `1px solid ${C.borderSoft}`,
          borderRadius: 26,
          padding: '24px 42px',
          opacity: stat.opacity,
          transform: stat.transform,
        }}
      >
        ⚡ 当时全球规模最大的网络攻击
      </div>
    </Scene>
  );
};

/* ---------------- 场景 4：SSL 与使命 ---------------- */
const SSL: React.FC = () => {
  const t = useEntrance('ssl', 0.5, 0.6);
  const c1 = useEntrance('ssl', 1.5, 0.55, 'rise');
  const c2 = useEntrance('ssl', 1.8, 0.55, 'rise');
  const big = useEntrance('ssl', 3.4, 0.7, 'scale');
  return (
    <Scene id="ssl">
      <Kicker sceneId="ssl">2014 · 守护与普及</Kicker>
      <div
        style={{
          ...font,
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.35,
          letterSpacing: -1,
          color: C.text,
          opacity: t.opacity,
          transform: t.transform,
        }}
      >
        保护弱势群体
        <br />
        也守护每一个网站
      </div>
      <div style={{display: 'flex', gap: 34, marginTop: 64}}>
        <MilestoneChip
          sceneId="ssl"
          delay={1.5}
          year="伽利略"
          title="Project Galileo"
          desc={'免费保护\n记者 · 艺术家 · 人权组织'}
          accent={C.green}
          style={{width: 430}}
        />
        <MilestoneChip
          sceneId="ssl"
          delay={1.8}
          year="SSL"
          title="Universal SSL"
          desc={'任何网站\n免费获得加密'}
          accent={C.orange}
          style={{width: 430}}
        />
      </div>
      <div
        style={{
          ...font,
          marginTop: 56,
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: 4,
          color: 'transparent',
          background: 'linear-gradient(90deg, #f6821f, #ffd58f, #f6821f)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          opacity: big.opacity,
          transform: big.transform,
        }}
      >
        🔒 HTTPS × for everyone
      </div>
      <div style={{...font, marginTop: 24, fontSize: 32, fontWeight: 700, color: C.sub, opacity: big.opacity}}>
        全网走向加密时代
      </div>
    </Scene>
  );
};

/* ---------------- 场景 5：Workers ---------------- */
const Workers: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [
    {x: 170, y: 150, d: 0},
    {x: 420, y: 60, d: 1.1},
    {x: 660, y: 130, d: 2.0},
    {x: 880, y: 260, d: 0.6},
    {x: 110, y: 400, d: 1.6},
    {x: 940, y: 540, d: 2.5},
    {x: 220, y: 560, d: 0.3},
    {x: 700, y: 620, d: 1.9},
  ] as const;
  const t = useEntrance('workers', 0.5, 0.6);
  const sub = useEntrance('workers', 1.4, 0.6);
  const net = useEntrance('workers', 0.9, 0.8, 'scale');
  const chips = useEntrance('workers', 2.6, 0.6);
  return (
    <Scene id="workers">
      <Kicker sceneId="workers">2017 · 边缘计算</Kicker>
      <div
        style={{
          ...font,
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: -1,
          color: C.text,
          lineHeight: 1.3,
          opacity: t.opacity,
          transform: t.transform,
        }}
      >
        Cloudflare Workers
      </div>
      {/* 边缘网络节点图 */}
      <div
        style={{
          position: 'relative',
          width: 1000,
          height: 720,
          marginTop: 40,
          opacity: net.opacity,
          transform: net.transform,
        }}
      >
        {/* 连接线 */}
        <svg viewBox="0 0 1000 720" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          {nodes.map((n, i) =>
            nodes.slice(i + 1).map((m) => (
              <line
                key={`${i}-${m}`}
                x1={n.x}
                y1={n.y}
                x2={m.x}
                y2={m.y}
                stroke="rgba(246,130,31,0.16)"
                strokeWidth={2}
              />
            )),
          )}
        </svg>
        {nodes.map((n) => {
          const pulse = 0.5 + 0.5 * Math.sin((frame / 30) * 2.2 + n.d * 2);
          return (
            <div key={`${n.x}-${n.y}`} style={{position: 'absolute', left: n.x, top: n.y, width: 22, height: 22, marginLeft: -11, marginTop: -11}}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: C.orange,
                  boxShadow: '0 0 18px rgba(246,130,31,0.8)',
                  transform: `scale(${0.6 + 0.4 * pulse})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: -14,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(246,130,31,0.5)',
                  opacity: 0.7 - 0.5 * pulse,
                }}
              />
            </div>
          );
        })}
        {/* 中央节点 */}
        <div style={{position: 'absolute', left: 500, top: 360, width: 56, height: 56, marginLeft: -28, marginTop: -28}}>
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffd58f 0%, #f6821f 65%)',
              boxShadow: '0 0 40px rgba(246,130,31,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...font,
              fontWeight: 900,
              fontSize: 26,
              color: '#1a0e02',
            }}
          >
            CF
          </div>
        </div>
      </div>
      <div
        style={{
          ...font,
          fontSize: 42,
          fontWeight: 700,
          color: C.sub,
          lineHeight: 1.6,
          opacity: sub.opacity,
        }}
      >
        代码部署到离用户最近的边缘节点
        <br />
        边缘计算的时代，就此开启
      </div>
      <div style={{display: 'flex', gap: 22, marginTop: 44, opacity: chips.opacity}}>
        {['Serverless', '全球部署', '毫秒响应'].map((s) => (
          <div
            key={s}
            style={{
              ...font,
              fontSize: 28,
              fontWeight: 700,
              color: C.orange,
              background: 'rgba(246,130,31,0.1)',
              border: '1px solid rgba(246,130,31,0.4)',
              borderRadius: 999,
              padding: '14px 34px',
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ---------------- 场景 6：1.1.1.1 ---------------- */
const DNS: React.FC = () => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 20) * 10;
  const num = useEntrance('dns', 0.5, 0.8, 'scale');
  const t = useEntrance('dns', 1.8, 0.6);
  const c1 = useEntrance('dns', 2.6, 0.5, 'rise');
  const c2 = useEntrance('dns', 2.9, 0.5, 'rise');
  const c3 = useEntrance('dns', 3.2, 0.5, 'rise');
  return (
    <Scene id="dns">
      <Kicker sceneId="dns">2018 · 公共 DNS</Kicker>
      <div style={{opacity: num.opacity, transform: num.transform}}>
        <div style={{transform: `translateY(${float * num.opacity}px)`}}>
          <div
            style={{
              ...font,
              fontSize: 220,
              fontWeight: 900,
              letterSpacing: 4,
              lineHeight: 1,
              background: 'linear-gradient(180deg, #fff3e0 0%, #f6821f 60%, #c75d0a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            1.1.1.1
          </div>
        </div>
      </div>
      <div style={{...font, fontSize: 40, fontWeight: 700, color: C.text, marginTop: 34, opacity: t.opacity}}>
        全球最快的公共 DNS 服务之一
      </div>
      <div
        style={{
          ...font,
          marginTop: 26,
          fontSize: 32,
          fontWeight: 600,
          color: C.sub,
          opacity: t.opacity,
        }}
      >
        不只追求速度，更保护隐私
      </div>
      <div style={{display: 'flex', gap: 26, marginTop: 64}}>
        {[
          {icon: '⚡', label: '快', e: c1},
          {icon: '🔒', label: '隐私', e: c2},
          {icon: '🛡️', label: '安全', e: c3},
        ].map((f) => (
          <div
            key={f.label}
            style={{
              width: 280,
              padding: '38px 18px',
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 28,
              opacity: f.e.opacity,
              transform: f.e.transform,
            }}
          >
            <div style={{fontSize: 54, lineHeight: 1}}>{f.icon}</div>
            <div style={{...font, fontSize: 30, fontWeight: 800, color: C.orange, marginTop: 14}}>{f.label}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ---------------- 场景 7：上市 ---------------- */
const IPO: React.FC = () => {
  const frame = useCurrentFrame();
  const ticker = useEntrance('ipo', 0.5, 0.6);
  const net = useEntrance('ipo', 1.2, 0.7, 'scale');
  const meta = useEntrance('ipo', 2.6, 0.6);
  const t = useEntrance('ipo', 3.5, 0.6);
  const marquee = (frame / 30) * 120;
  const items = ['NET ▲', 'NYSE', 'NET', 'SEC', 'NYSE', 'NET ▲', 'IPO', 'NYSE'];
  return (
    <Scene id="ipo">
      <Kicker sceneId="ipo">2019.9.13 · 纽交所上市</Kicker>
      <div
        style={{
          ...font,
          fontSize: 58,
          fontWeight: 900,
          color: C.text,
          opacity: ticker.opacity,
        }}
      >
        New York Stock Exchange
      </div>
      <div
        style={{
          ...font,
          fontSize: 300,
          fontWeight: 900,
          letterSpacing: -8,
          lineHeight: 1,
          background: 'linear-gradient(180deg, #fff3e0 0%, #f6821f 62%, #c75d0a 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginTop: 10,
          opacity: net.opacity,
          transform: net.transform,
        }}
      >
        NET
      </div>
      <div
        style={{
          display: 'flex',
          gap: 30,
          marginTop: 44,
          alignItems: 'center',
          opacity: meta.opacity,
        }}
      >
        <div
          style={{
            ...font,
            fontSize: 34,
            fontWeight: 800,
            color: '#0a0d14',
            background: '#3ddc97',
            borderRadius: 999,
            padding: '12px 30px',
          }}
        >
          ▲ 上市
        </div>
        <div style={{...font, fontSize: 44, fontWeight: 900, color: C.text}}>发行价 $15/股</div>
      </div>
      {/* 滚动行情条 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1520,
          height: 110,
          background: C.panel2,
          borderTop: '1px solid rgba(246,130,31,0.35)',
          borderBottom: '1px solid rgba(246,130,31,0.35)',
          overflow: 'hidden',
          opacity: meta.opacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            whiteSpace: 'nowrap',
            transform: `translateX(${-marquee}px)`,
          }}
        >
          {Array.from({length: 6}).flatMap((_, r) =>
            items.map((it, i) => (
              <span
                key={`${r}-${i}`}
                style={{
                  ...font,
                  fontSize: 40,
                  fontWeight: 900,
                  color: i % 2 === 0 ? '#3ddc97' : C.muted,
                  marginRight: 90,
                  letterSpacing: 2,
                }}
              >
                {it}
              </span>
            )),
          )}
        </div>
      </div>
      <div
        style={{
          ...font,
          marginTop: 60,
          fontSize: 42,
          fontWeight: 700,
          color: C.sub,
          lineHeight: 1.6,
          opacity: t.opacity,
        }}
      >
        从创业公司到资本市场新星
        <br />
        华丽转身
      </div>
    </Scene>
  );
};

/* ---------------- 场景 8：扩张 ---------------- */
const Expansion: React.FC = () => {
  const t = useEntrance('expansion', 0.4, 0.6);
  const c1 = useEntrance('expansion', 1.3, 0.55, 'rise');
  const a1 = useEntrance('expansion', 2.0, 0.35);
  const c2 = useEntrance('expansion', 1.6, 0.55, 'rise');
  const a2 = useEntrance('expansion', 2.3, 0.35);
  const c3 = useEntrance('expansion', 1.9, 0.55, 'rise');
  const sub = useEntrance('expansion', 3.4, 0.6);
  const steps = [
    {year: '2022', title: '收购 Area 1', desc: '邮件安全', e: c1},
    {year: '2023', title: 'Workers AI', desc: 'AI 进入边缘', e: c2},
    {year: '2025', title: '收购 Replicate', desc: '开源模型平台', e: c3},
  ];
  return (
    <Scene id="expansion">
      <Kicker sceneId="expansion" color={C.green}>
        2022 → 2025 · 大步扩张
      </Kicker>
      <div
        style={{
          ...font,
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.35,
          color: C.text,
          opacity: t.opacity,
          transform: t.transform,
        }}
      >
        从安全
        <br />
        走向 AI 基建
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60}}>
        {steps.map((s, i) => (
          <React.Fragment key={s.year}>
            <div
              style={{
                width: 640,
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '28px 34px',
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 30,
                opacity: s.e.opacity,
                transform: s.e.transform,
              }}
            >
              <div
                style={{
                  ...font,
                  fontSize: 44,
                  fontWeight: 900,
                  color: i === 2 ? C.orange : C.green,
                  minWidth: 130,
                  textAlign: 'left',
                }}
              >
                {s.year}
              </div>
              <div style={{width: 2, height: 60, background: 'rgba(255,255,255,0.12)'}} />
              <div style={{textAlign: 'left'}}>
                <div style={{...font, fontSize: 38, fontWeight: 800, color: C.text}}>{s.title}</div>
                <div style={{...font, fontSize: 26, fontWeight: 600, color: C.muted, marginTop: 6}}>{s.desc}</div>
              </div>
            </div>
            {i < 2 ? (
              <div
                style={{
                  ...font,
                  fontSize: 40,
                  fontWeight: 900,
                  color: C.orange,
                  margin: '6px 0',
                  opacity: (i === 0 ? a1 : a2).opacity,
                }}
              >
                ↓
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          ...font,
          marginTop: 52,
          fontSize: 34,
          fontWeight: 600,
          color: C.sub,
          opacity: sub.opacity,
        }}
      >
        一次次收购与创新，构筑完整的产品版图
      </div>
    </Scene>
  );
};

/* ---------------- 场景 9：如今 ---------------- */
const Today: React.FC = () => {
  const k = useEntrance('today', 0.3, 0.5);
  const s1 = useEntrance('today', 1.1, 0.6, 'scale');
  const s2 = useEntrance('today', 1.5, 0.6, 'scale');
  const s3 = useEntrance('today', 1.9, 0.6, 'scale');
  const t = useEntrance('today', 3.6, 0.7);
  const stats = [
    {num: '335+', unit: '座城市', desc: '全球网络覆盖', e: s1},
    {num: '1.15 亿', unit: '次/秒', desc: '处理 HTTP 请求', e: s2},
    {num: '21%', unit: '全球网站', desc: '使用 Cloudflare', e: s3},
  ];
  return (
    <Scene id="today">
      <Kicker sceneId="today">2026 · 如今</Kicker>
      <div style={{display: 'flex', flexDirection: 'column', gap: 30, width: '100%', alignItems: 'center'}}>
        {stats.map((s) => (
          <div
            key={s.unit}
            style={{
              width: 820,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '34px 46px',
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 32,
              opacity: s.e.opacity,
              transform: s.e.transform,
            }}
          >
            <div style={{...font, fontSize: 76, fontWeight: 900, color: C.orange, lineHeight: 1}}>
              {s.num}
              <span style={{fontSize: 34, fontWeight: 700, color: C.sub, marginLeft: 10}}>{s.unit}</span>
            </div>
            <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted}}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          ...font,
          marginTop: 72,
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.4,
          color: C.text,
          opacity: t.opacity,
          transform: t.transform,
        }}
      >
        从三个人，到互联网的守护者
      </div>
      <div
        style={{
          ...font,
          marginTop: 30,
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: 2,
          background: 'linear-gradient(90deg, #ffd9a0, #f6821f)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          opacity: t.opacity,
        }}
      >
        CLOUDFLARE —— 故事，仍在继续
      </div>
    </Scene>
  );
};

/* ---------------- 主组件 ---------------- */
export const CloudflareHistory: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // 结尾淡出黑场：88s → 90s
  const fadeOut = interpolate(t, [88, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop />
      <Intro />
      <Founding />
      <Fame />
      <SSL />
      <Workers />
      <DNS />
      <IPO />
      <Expansion />
      <Today />
      <Audio src={staticFile('voiceover/narration.zh.mp3')} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
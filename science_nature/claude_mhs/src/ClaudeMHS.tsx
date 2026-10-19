import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {notoSansSC} from './fonts';
import {AUDIO_END, SceneId, useEntrance, useSceneOpacity, useSceneProgress} from './timing';

const C = {
  bg: '#141413',
  panel: 'rgba(250,249,245,.05)',
  text: '#faf9f5',
  muted: '#b0aea5',
  clay: '#d97757',
  green: '#788c5d',
  blue: '#6a9bcc',
  line: 'rgba(217,119,87,.28)',
};

const font: React.CSSProperties = {fontFamily: `${notoSansSC.fontFamily}, sans-serif`};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 80% 12%, rgba(217,119,87,.22), transparent 38%), radial-gradient(circle at 10% 92%, rgba(106,155,204,.12), transparent 40%), ${C.bg}`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: -120, transform: `translateY(${(frame * 0.2) % 60}px)`, backgroundImage: 'radial-gradient(rgba(250,249,245,.18) 1.5px, transparent 1.5px)', backgroundSize: '60px 60px', opacity: 0.35}} />
      <div style={{position: 'absolute', top: -280, right: -240, width: 760, height: 760, borderRadius: '50%', border: '1px dashed rgba(217,119,87,.25)', transform: `rotate(${frame / 40}deg)`}} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{id: SceneId; children: React.ReactNode}> = ({id, children}) => {
  const opacity = useSceneOpacity(id);
  return (
    <AbsoluteFill style={{opacity, visibility: opacity > 0 ? 'visible' : 'hidden', padding: '150px 78px 140px', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{...font, color: C.clay, fontSize: 28, letterSpacing: 8, fontWeight: 800, marginBottom: 34}}>{children}</div>
);

const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 72}) => (
  <div style={{...font, color: C.text, fontSize: size, lineHeight: 1.2, letterSpacing: -1, fontWeight: 900}}>{children}</div>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: '30px 34px', textAlign: 'left', ...style}}>{children}</div>
);

const Spark: React.FC<{size: number; color?: string; rotate?: number}> = ({size, color = C.clay, rotate = 0}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{transform: `rotate(${rotate}deg)`}}>
    {Array.from({length: 12}, (_, i) => (
      <rect key={i} x={-4} y={-48} width={8} height={36} rx={4} fill={color} transform={`rotate(${i * 30})`} />
    ))}
  </svg>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useEntrance('intro', 0.2, 0.8);
  const b = useEntrance('intro', 0.9, 0.9);
  const c = useEntrance('intro', 3.5, 0.8);
  const devices = ['显微镜', '移液工作站', '机械臂'];
  return (
    <Scene id="intro">
      <div style={{opacity: a.opacity, transform: `scale(${a.scale})`, marginBottom: 40}}><Spark size={150} rotate={frame / 3} /></div>
      <div style={{opacity: a.opacity}}><Kicker>ANTHROPIC · RESEARCH PREVIEW</Kicker></div>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`}}>
        <Title size={190}>MHS</Title>
        <div style={{...font, fontSize: 40, fontWeight: 700, color: C.muted, marginTop: 10, letterSpacing: 2}}>Model Hardware Standard</div>
      </div>
      <div style={{width: 520, height: 4, background: `linear-gradient(90deg, transparent, ${C.clay}, transparent)`, margin: '50px 0', opacity: c.opacity}} />
      <div style={{...font, fontSize: 42, fontWeight: 700, color: C.text, opacity: c.opacity}}>让 AI 智能体安全操作实体设备</div>
      <div style={{display: 'flex', gap: 22, marginTop: 40}}>
        {devices.map((d, i) => {
          const e = useEntrance('intro', 6 + i * 0.8, 0.6);
          return <div key={d} style={{...font, opacity: e.opacity, transform: `translateY(${e.y}px)`, fontSize: 30, fontWeight: 700, color: C.clay, border: `2px solid ${C.line}`, borderRadius: 999, padding: '12px 30px'}}>{d}</div>;
        })}
      </div>
      <div style={{...font, position: 'absolute', top: 120, fontSize: 26, fontWeight: 600, color: C.muted, opacity: a.opacity}}>2026.08.27</div>
    </Scene>
  );
};

const Problem: React.FC = () => {
  const p = useSceneProgress('problem');
  const a = useEntrance('problem', 0.4, 0.8);
  const b = useEntrance('problem', 7.5, 0.8);
  const shrink = interpolate(p, [0.55, 0.8], [1, 0.06], clamp);
  return (
    <Scene id="problem">
      <div style={{opacity: a.opacity}}><Kicker>THE INTEGRATION PROBLEM</Kicker></div>
      <Title size={66}>接入一台仪器<br/>要多久？</Title>
      <div style={{width: '100%', marginTop: 80, display: 'grid', gap: 46}}>
        <div style={{opacity: a.opacity}}>
          <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted, textAlign: 'left', marginBottom: 14}}>传统定制开发</div>
          <div style={{height: 70, borderRadius: 18, background: 'rgba(250,249,245,.12)', overflow: 'hidden'}}>
            <div style={{width: `${interpolate(p, [0.05, 0.4], [0, 100], clamp)}%`, height: '100%', background: C.muted, display: 'flex', alignItems: 'center', paddingLeft: 26, ...font, fontSize: 32, fontWeight: 900, color: C.bg}}>数周 ～ 数月</div>
          </div>
        </div>
        <div style={{opacity: b.opacity}}>
          <div style={{...font, fontSize: 30, fontWeight: 700, color: C.clay, textAlign: 'left', marginBottom: 14}}>使用 MHS</div>
          <div style={{height: 70, borderRadius: 18, background: 'rgba(250,249,245,.12)', overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
            <div style={{width: `${shrink * 100}%`, minWidth: 18, height: '100%', background: C.clay}} />
            <div style={{...font, fontSize: 32, fontWeight: 900, color: C.clay, marginLeft: 22}}>{shrink < 0.2 ? '数小时 ～ 数分钟' : ''}</div>
          </div>
        </div>
      </div>
      <div style={{...font, fontSize: 30, fontWeight: 600, color: C.muted, lineHeight: 1.6, marginTop: 80, opacity: a.opacity}}>每家厂商一套软件、一套接口<br/><span style={{color: C.text}}>彼此互不兼容</span></div>
    </Scene>
  );
};

const How: React.FC = () => {
  const steps = [
    ['01', '标准化驱动', '读写原语：get / set temperature', C.clay],
    ['02', '自动发现', '统一格式，跨网络互相找到', C.blue],
    ['03', '参考文件', '自然语言描述 → 能力与安全上限', C.green],
    ['04', '多种控制方式', 'MCP · 命令行 · 代码 API', C.clay],
  ] as const;
  const starts = [3.5, 9.5, 14, 22];
  const tag = useEntrance('how', 27, 0.8);
  return (
    <Scene id="how">
      <Kicker>HOW IT WORKS</Kicker>
      <Title size={64}>它是怎么做到的？</Title>
      <div style={{marginTop: 60, width: '100%', display: 'grid', gap: 24}}>
        {steps.map((s, i) => {
          const e = useEntrance('how', starts[i], 0.7);
          return (
            <Card key={s[0]} style={{opacity: e.opacity, transform: `translateY(${e.y}px)`, display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center'}}>
              <div style={{...font, fontSize: 52, fontWeight: 900, color: s[3]}}>{s[0]}</div>
              <div>
                <div style={{...font, fontSize: 36, fontWeight: 900, color: C.text}}>{s[1]}</div>
                <div style={{...font, fontSize: 26, fontWeight: 600, color: C.muted, marginTop: 6}}>{s[2]}</div>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{...font, marginTop: 44, fontSize: 30, fontWeight: 800, color: C.bg, background: C.clay, borderRadius: 999, padding: '14px 40px', opacity: tag.opacity, transform: `scale(${tag.scale})`}}>与模型无关 · Model-agnostic</div>
    </Scene>
  );
};

const Labs: React.FC = () => {
  const p = useSceneProgress('labs');
  const rows = [
    ['卡内基梅隆大学', `${Math.round(interpolate(p, [0.05, 0.3], [0, 8], clamp))} 小时`, '完成搭建（厂商方案需数周），实验快约 3 倍', 0.5],
    ['华盛顿大学', `${Math.round(interpolate(p, [0.45, 0.6], [0, 6], clamp))} 台`, '仪器在一周内接入，含编写驱动', 8.5],
    ['HHMI 珍利亚', '7 → 1', '七个厂商程序，统一为一键启动', 12.5],
  ] as const;
  return (
    <Scene id="labs">
      <Kicker>PARTNER LABS</Kicker>
      <Title size={64}>实验室里的成果</Title>
      <div style={{marginTop: 64, width: '100%', display: 'grid', gap: 28}}>
        {rows.map((r) => {
          const e = useEntrance('labs', r[3], 0.7);
          return (
            <Card key={r[0]} style={{opacity: e.opacity, transform: `translateY(${e.y}px)`}}>
              <div style={{...font, fontSize: 28, fontWeight: 700, color: C.muted}}>{r[0]}</div>
              <div style={{...font, fontSize: 86, fontWeight: 900, color: C.clay, lineHeight: 1.15}}>{r[1]}</div>
              <div style={{...font, fontSize: 28, fontWeight: 600, color: C.text}}>{r[2]}</div>
            </Card>
          );
        })}
      </div>
    </Scene>
  );
};

const Quera: React.FC = () => {
  const p = useSceneProgress('quera');
  const a = useEntrance('quera', 0.3, 0.8);
  const b = useEntrance('quera', 9.5, 0.8);
  const rate = interpolate(p, [0.12, 0.4], [0, 99.3], clamp);
  const bars = [
    ['AI 控制器', 99.3, '约 6 秒', C.clay],
    ['原有脚本', 58, '150 秒', C.muted],
  ] as const;
  return (
    <Scene id="quera">
      <div style={{opacity: a.opacity}}><Kicker>QUERA · QUANTUM COMPUTING</Kicker></div>
      <Title size={60}>激光重锁控制器</Title>
      <div style={{...font, fontSize: 190, fontWeight: 900, color: C.clay, letterSpacing: -6, marginTop: 30, lineHeight: 1}}>{rate.toFixed(1)}<span style={{fontSize: 80}}>%</span></div>
      <div style={{...font, fontSize: 30, fontWeight: 700, color: C.muted, marginTop: 10}}>700 次测试中的恢复成功率</div>
      <div style={{width: '100%', marginTop: 70, display: 'grid', gap: 30, opacity: b.opacity}}>
        {bars.map((bar) => (
          <div key={bar[0]} style={{textAlign: 'left'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10}}>
              <span>{bar[0]}</span><span style={{color: bar[3]}}>{bar[1]}% · {bar[2]}</span>
            </div>
            <div style={{height: 34, borderRadius: 12, background: 'rgba(250,249,245,.1)'}}>
              <div style={{width: `${bar[1] * interpolate(p, [0.5, 0.75], [0, 1], clamp)}%`, height: '100%', borderRadius: 12, background: bar[3]}} />
            </div>
          </div>
        ))}
        <div style={{...font, fontSize: 28, fontWeight: 600, color: C.muted, textAlign: 'left'}}>人工处理：5～10 分钟</div>
      </div>
    </Scene>
  );
};

const Industry: React.FC = () => {
  const names = ['AWS', 'Tecan', 'QIAGEN', 'Danaher', 'Universal Robots', '斗山机器人', 'Hugging Face', '树莓派', 'Automata', 'MBF Bioscience'];
  return (
    <Scene id="industry">
      <Kicker>INDUSTRY ADOPTION</Kicker>
      <Title size={64}>产业界正在跟进</Title>
      <div style={{marginTop: 70, display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center'}}>
        {names.map((n, i) => {
          const e = useEntrance('industry', 1.5 + i * 0.6, 0.5);
          return <div key={n} style={{...font, opacity: e.opacity, transform: `scale(${e.scale})`, fontSize: 36, fontWeight: 800, color: C.text, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: '20px 32px'}}>{n}</div>;
        })}
      </div>
      <div style={{...font, fontSize: 30, fontWeight: 600, color: C.muted, marginTop: 60}}>测试中或计划支持 MHS</div>
    </Scene>
  );
};

const Limits: React.FC = () => {
  const items = [
    ['空间推理有限', '通过文字和图像理解物理世界，需专家监督', 2],
    ['需要编程接口', '无编程接口的硬件暂时无法接入', 8],
    ['安全优先', '与合作伙伴开展安全评估，制定物理安全路线图', 11.5],
  ] as const;
  return (
    <Scene id="limits">
      <Kicker>LIMITS & SAFETY</Kicker>
      <Title size={64}>限制依然存在</Title>
      <div style={{marginTop: 64, width: '100%', display: 'grid', gap: 26}}>
        {items.map((it, i) => {
          const e = useEntrance('limits', it[2], 0.7);
          return (
            <Card key={it[0]} style={{opacity: e.opacity, transform: `translateY(${e.y}px)`, borderLeft: `8px solid ${i === 2 ? C.green : C.clay}`}}>
              <div style={{...font, fontSize: 36, fontWeight: 900, color: C.text}}>{it[0]}</div>
              <div style={{...font, fontSize: 27, fontWeight: 600, color: C.muted, marginTop: 8, lineHeight: 1.5}}>{it[1]}</div>
            </Card>
          );
        })}
      </div>
    </Scene>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useEntrance('outro', 0.3, 0.8);
  const b = useEntrance('outro', 5.5, 0.9);
  return (
    <Scene id="outro">
      <div style={{opacity: a.opacity, transform: `scale(${a.scale})`}}><Spark size={120} rotate={frame / 3} /></div>
      <div style={{opacity: a.opacity, marginTop: 40}}><Kicker>APPLY · THEN OPEN SOURCE</Kicker></div>
      <div style={{opacity: a.opacity}}><Title size={56}>申请开放预览<br/>预览后计划开源</Title></div>
      <div style={{width: 110, height: 6, background: C.clay, margin: '54px auto', opacity: b.opacity}} />
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px)`}}><Title size={72}>当 AI 走出屏幕<br/><span style={{color: C.clay}}>走进实验室</span></Title></div>
      <div style={{...font, fontSize: 28, fontWeight: 600, color: C.muted, marginTop: 50, opacity: a.opacity}}>modelhardwarestandard.com</div>
    </Scene>
  );
};

export const ClaudeMHS: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame / fps, [AUDIO_END + 0.5, AUDIO_END + 2.4], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Background />
      <Intro />
      <Problem />
      <How />
      <Labs />
      <Quera />
      <Industry />
      <Limits />
      <Outro />
      <div style={{position: 'absolute', left: 50, bottom: 48, ...font, color: 'rgba(176,174,165,.5)', fontSize: 20, fontWeight: 600, letterSpacing: 1}}>CLAUDE · MODEL HARDWARE STANDARD</div>
      <Audio src={staticFile('voiceover/narration.zh.mp3')} />
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};

/**
 * 静态数据：场景时间轴 + 文案卡片。
 *
 * SCENES 由 index.html 顶部 SCENES 表格逐项移植（秒），相邻场景重叠 0.5s
 * 实现交叉淡入淡出；`cues` 列出每个场景覆盖的旁白 VTT 句子编号
 *（见 public/voiceover/narration.zh.vtt，共 20 句），与 HyperFrames 版
 * 代码注释中的"旁白 X–Ys:句子 N"对齐关系一致。
 */
export const FPS = 30;

/** 总时长 54s：旁白实测 52.27s + 结尾 1.7s 余量（与 HyperFrames TOTAL 一致） */
export const TOTAL_SECONDS = 54;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS); // 1620

export type SceneDef = {
  id: string;
  name?: string;
  start: number;
  end: number;
  /** 覆盖的 narration.zh.vtt 句子编号（含端点） */
  cues: [number, number];
  /** cue 时间范围（秒，仅文档用途） */
  cueRange: string;
};

export const SCENES: SceneDef[] = [
  {id: 'intro', start: 0.0, end: 5.0, cues: [1, 2], cueRange: '0.1–4.4s'},
  {id: 'reveal', start: 4.4, end: 8.5, cues: [3, 3], cueRange: '4.44–7.86s'},
  {id: 'design', start: 8.0, end: 14.6, cues: [4, 5], cueRange: '7.86–14.28s'},
  {id: 'chip', start: 14.2, end: 25.3, cues: [6, 9], cueRange: '14.28–24.84s'},
  {id: 'market', start: 24.8, end: 34.0, cues: [10, 12], cueRange: '24.84–33.73s'},
  {id: 'lineup', start: 33.7, end: 42.0, cues: [13, 15], cueRange: '33.73–41.48s'},
  {id: 'origin', start: 41.5, end: 47.5, cues: [16, 17], cueRange: '41.48–46.45s'},
  {id: 'outro', start: 47.0, end: TOTAL_SECONDS, cues: [18, 20], cueRange: '46.45–52.21s'},
];

export const SPECS = [
  {num: '7', unit: 'cm', label: '机身直径'},
  {num: '180', unit: 'g', label: '机身重量'},
  {num: '7', unit: '种', label: '丰富配色'},
];

export const CHIPS = [
  {value: '52', unit: ' kcal', name: '低热量', sub: '每 100g'},
  {value: '2.4', unit: 'g', name: '膳食纤维', sub: '每 100g'},
  {value: '4.6', unit: 'mg', name: '维生素 C', sub: '每 100g'},
];

export const LINEUP = [
  {
    dot: 'radial-gradient(circle at 32% 28%, #ff8a7a, #d63a26 70%)',
    name: '红富士',
    tag: 'Pro',
    desc: ['脆甜多汁', '中国第一大品种'],
  },
  {
    dot: 'radial-gradient(circle at 32% 28%, #dff5c4, #8fbf4a 70%)',
    name: '嘎啦',
    tag: 'Air',
    desc: ['清爽不腻', '轻巧便携'],
  },
  {
    dot: 'radial-gradient(circle at 32% 28%, #f7e3a0, #d8a31e 70%)',
    name: '小果',
    tag: 'mini',
    desc: ['一口一个', '随身随享'],
  },
];

/** 单条旁白音轨（public 下的 MP3，gitignore 不入库，CI/本地用 npm run voiceover 生成） */
export const VOICEOVER_SRC = 'voiceover/narration.zh.mp3';

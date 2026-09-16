// 地图相机（纯函数，无 Remotion 依赖，便于测试）。
//
// 真实地图是一整层持续存在的地图层，相机决定“看哪一块”：
//   - 片头 `intro`：取整省；
//   - 地市场景：取该市真实边界包围盒，并留出边距；
//   - 相邻场景在边界交点前后各 FLIGHT_SECONDS/2 内连续平移缩放，同一场景内只做极缓慢的推近。
//
// 相机 → 屏幕：相机中心落在 MAP_ANCHOR 这个像素点上，MAP_BAND_BOTTOM 以下会被底部信息卡遮住，
// 因此锚点取在地图可视带的中部，保证聚焦的地市始终完整落在信息卡上方。

import {GEO_CITIES, MAP_VIEWBOX_H, MAP_VIEWBOX_W} from './shandongGeo';
import type {GeoCity} from './shandongGeo';
import type {Scene} from './scenes';

/** 成片分辨率，Canvas 与地图相机共用同一来源 */
export const FRAME = {width: 1080, height: 1920} as const;

/** 底部信息卡顶边（像素）：地图相机保证聚焦内容在这条线以上 */
export const MAP_BAND_BOTTOM = 1120;

/** 相机中心在画面上的落点 */
export const MAP_ANCHOR = {x: FRAME.width / 2, y: MAP_BAND_BOTTOM / 2} as const;

export type Camera = {
  /** 相机中心的 viewBox 坐标 */
  cx: number;
  cy: number;
  /** 可见 viewBox 宽度 */
  vbW: number;
};

/** 相机解算结果：viewBox → 像素的平移与缩放 */
export type CameraView = {x0: number; y0: number; vbW: number; vbH: number; scale: number};

const ASPECT = FRAME.height / FRAME.width;

/** 地图可视带（信息卡上方）的高宽比：聚焦窗口按它收边，地市边界才不会被信息卡压住 */
const BAND_ASPECT = MAP_BAND_BOTTOM / FRAME.width;

/** 场景切换的飞行时长（秒）：比文字交叉淡入淡出更长，全片相机不会出现单帧跳变 */
export const FLIGHT_SECONDS = 1.5;

/** 地市边界之外额外留出的余量（相对包围盒较大边） */
const MARGIN_RATIO = 0.18;

/** 最大放大倍数，避免小市被放得过大而只剩色块 */
const MAX_ZOOM = 6;

/** 单个场景内缓慢推近的比例，让静止镜头仍有呼吸感 */
const DRIFT = 0.05;

const GEO_BY_NAME: Record<string, GeoCity> = Object.fromEntries(
  GEO_CITIES.map((g) => [g.name, g]),
);

const isCity = (name: string): boolean => name in GEO_BY_NAME;

export const PROVINCE_CAMERA: Camera = {
  cx: MAP_VIEWBOX_W / 2,
  cy: MAP_VIEWBOX_H / 2,
  vbW: MAP_VIEWBOX_W,
};

export function cityOf(name: string): GeoCity {
  const city = GEO_BY_NAME[name];
  if (!city) throw new Error(`未知地市 ${name}`);
  return city;
}

/** 聚焦某地市：完整包住该市真实边界，长边留 MARGIN_RATIO 余量 */
export function cityCamera(name: string): Camera {
  const {bbox} = cityOf(name);
  const {x, y, w, h} = bbox;
  const margin = MARGIN_RATIO * Math.max(w, h);
  const vbW = Math.max(
    MAP_VIEWBOX_W / MAX_ZOOM,
    Math.min(MAP_VIEWBOX_W, Math.max(w + 2 * margin, (h + 2 * margin) / BAND_ASPECT)),
  );
  return {cx: x + w / 2, cy: y + h / 2, vbW};
}

/** 场景 id → 相机：地市名取该市聚焦窗口，其余取整省 */
export function sceneCamera(id: string): Camera {
  return isCity(id) ? cityCamera(id) : PROVINCE_CAMERA;
}

export function viewOf(camera: Camera): CameraView {
  const scale = FRAME.width / camera.vbW;
  return {
    vbW: camera.vbW,
    vbH: FRAME.height / scale,
    scale,
    x0: camera.cx - MAP_ANCHOR.x / scale,
    y0: camera.cy - MAP_ANCHOR.y / scale,
  };
}

/** viewBox 坐标 → 画面像素 */
export function project(view: CameraView, x: number, y: number): {px: number; py: number} {
  return {px: (x - view.x0) * view.scale, py: (y - view.y0) * view.scale};
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type CameraKey = {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  /** 场景边界交叠帧数：前一场景结束帧 == 后一场景起始帧 */
  fadeFrames: number;
  /** 该场景是否聚焦到某个地市（false 表示全省视图） */
  city: boolean;
  cam: Camera;
};

/** 场景列表 → 相机关键帧，顺序与 scenes 一致；飞行时长由 FLIGHT_SECONDS 决定 */
export function buildCameraKeys(
  ids: readonly string[],
  scenes: readonly Scene[],
  fps: number,
): CameraKey[] {
  if (ids.length !== scenes.length) {
    throw new Error(`场景数 ${scenes.length} 与场景 id 数 ${ids.length} 不匹配`);
  }
  const fadeFrames = Math.round((FLIGHT_SECONDS * fps) / 2);
  return scenes.map((scene, i) => ({
    sceneId: ids[i],
    startFrame: scene.startFrame,
    endFrame: scene.endFrame,
    fadeFrames,
    city: isCity(ids[i]),
    cam: sceneCamera(ids[i]),
  }));
}

/** 场景内的缓慢推近：旁白区间内由 0 推到 DRIFT */
function drifted(key: CameraKey, frame: number): Camera {
  const holdStart = key.startFrame + key.fadeFrames;
  const holdEnd = key.endFrame - key.fadeFrames;
  const t = holdEnd > holdStart ? easeInOut(clamp01((frame - holdStart) / (holdEnd - holdStart))) : 0;
  return {...key.cam, vbW: key.cam.vbW * (1 - DRIFT * t)};
}

function visibleRect(camera: Camera) {
  const vbH = camera.vbW * ASPECT;
  return {
    x0: camera.cx - camera.vbW / 2,
    x1: camera.cx + camera.vbW / 2,
    y0: camera.cy - vbH / 2,
    y1: camera.cy + vbH / 2,
  };
}

/** 两个地市之间的中途相机：把两边的可视范围一起装进去，中段不会只剩空画面 */
function coverCamera(a: Camera, b: Camera): Camera {
  const ra = visibleRect(a);
  const rb = visibleRect(b);
  const x0 = Math.min(ra.x0, rb.x0);
  const x1 = Math.max(ra.x1, rb.x1);
  const y0 = Math.min(ra.y0, rb.y0);
  const y1 = Math.max(ra.y1, rb.y1);
  return {
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    vbW: Math.min(
      MAP_VIEWBOX_W,
      Math.max(MAP_VIEWBOX_W / MAX_ZOOM, x1 - x0, (y1 - y0) / ASPECT),
    ),
  };
}

/**
 * 场景切换的飞行。地市↔地市之间跨得远，中段中心走二次贝塞尔并拱起一点视野，
 * 保证两侧地区同时可见；牵涉到全省视图时宽度单调推拉，全程不会看不到目标。
 */
function flyTo(a: Camera, b: Camera, t: number, arc: boolean): Camera {
  const s = 1 - t;
  const via = arc ? coverCamera(a, b) : null;
  const controlX = via ? 2 * via.cx - (a.cx + b.cx) / 2 : (a.cx + b.cx) / 2;
  const controlY = via ? 2 * via.cy - (a.cy + b.cy) / 2 : (a.cy + b.cy) / 2;
  const midLogW = (Math.log(a.vbW) + Math.log(b.vbW)) / 2;
  const bump = via ? 4 * t * (1 - t) * (Math.log(via.vbW) - midLogW) : 0;
  return {
    cx: s * s * a.cx + 2 * s * t * controlX + t * t * b.cx,
    cy: s * s * a.cy + 2 * s * t * controlY + t * t * b.cy,
    vbW: Math.exp(lerp(Math.log(a.vbW), Math.log(b.vbW), t) + bump),
  };
}

function keyAt(keys: readonly CameraKey[], frame: number): number {
  const i = keys.findIndex((k) => frame <= k.endFrame);
  return i === -1 ? keys.length - 1 : i;
}

/** 当前帧的相机：场景交界处（前后各 fadeFrames）在相邻场景之间连续平移缩放 */
export function cameraAt(frame: number, keys: readonly CameraKey[]): Camera {
  if (keys.length === 0) throw new Error('相机关键帧为空');
  const i = keyAt(keys, frame);
  const current = keys[i];
  const fade = current.fadeFrames;
  const previous = keys[i - 1];
  if (previous && frame <= current.startFrame + fade) {
    const boundary = current.startFrame; // == previous.endFrame
    const t = easeInOut(clamp01((frame - (boundary - fade)) / (2 * fade)));
    return flyTo(drifted(previous, frame), drifted(current, frame), t, previous.city && current.city);
  }
  const next = keys[i + 1];
  if (next && frame >= current.endFrame - fade) {
    const boundary = current.endFrame; // == next.startFrame
    const t = easeInOut(clamp01((frame - (boundary - fade)) / (2 * fade)));
    return flyTo(drifted(current, frame), drifted(next, frame), t, current.city && next.city);
  }
  return drifted(current, frame);
}

/** 当前帧的高亮状态：from 淡出、to 淡入，t 与相机的平移同步 */
export type Focus = {from?: string; to?: string; t: number};

export function focusAt(frame: number, keys: readonly CameraKey[]): Focus {
  const i = keyAt(keys, frame);
  const current = keys[i];
  const fade = current.fadeFrames;
  const to = isCity(current.sceneId) ? current.sceneId : undefined;
  const previous = keys[i - 1];
  if (previous && frame <= current.startFrame + fade) {
    const boundary = current.startFrame;
    const t = easeInOut(clamp01((frame - (boundary - fade)) / (2 * fade)));
    return {from: isCity(previous.sceneId) ? previous.sceneId : undefined, to, t};
  }
  const next = keys[i + 1];
  if (next && frame >= current.endFrame - fade) {
    const boundary = current.endFrame;
    const t = easeInOut(clamp01((frame - (boundary - fade)) / (2 * fade)));
    return {from: to, to: isCity(next.sceneId) ? next.sceneId : undefined, t};
  }
  return {to, t: 1};
}

/** 某个地市当前的高亮权重（0..1） */
export function focusWeight(focus: Focus, name: string): number {
  return (focus.to === name ? focus.t : 0) + (focus.from === name ? 1 - focus.t : 0);
}

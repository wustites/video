export const SCATTER_W = 952;
export const SCATTER_H = 1150;
const PADDING = 60;
const LABEL_GAP = 22;
const LABEL_WIDTH = 300;
const LABEL_LINE = 24;

type Point = {speed: number | null; score: number; name?: string};

export type Tick = {value: number; pos: number};

export type ScatterLayout = {
  x: number;
  y: number;
  labelLeft: number;
  labelWidth: number;
  labelOnLeft: boolean;
  /** Vertical centre of the label after de-overlapping. */
  labelY: number;
  /** Label text: names of every model drawn at this exact position. */
  label: string;
  /** True when an earlier point sits at the same position and carries the label. */
  hidden: boolean;
};

const niceStep = (span: number, target: number) => {
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
};

/** Pad the data range a little and snap it to round tick values, so the
 * points spread across the plot instead of hugging one corner. */
function niceDomain(values: number[], target: number): {min: number; max: number; step: number} {
  if (values.length === 0) return {min: 0, max: 1, step: 1};
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.08;
  const step = niceStep(hi - lo + 2 * pad, target);
  return {min: Math.floor((lo - pad) / step) * step, max: Math.ceil((hi + pad) / step) * step, step};
}

const ticksFor = (d: {min: number; max: number; step: number}, toPos: (v: number) => number): Tick[] => {
  const out: Tick[] = [];
  for (let v = d.min; v <= d.max + d.step / 2; v += d.step) out.push({value: Math.round(v * 100) / 100, pos: toPos(v)});
  return out;
};

type Rect = {l: number; t: number; r: number; b: number};
const hits = (a: Rect, b: Rect) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
/** Rough width of a bold 18px label; CJK glyphs are about twice as wide. */
const textWidth = (text: string) => [...text].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 18 : 11.5), 0);
const DOT_R = 14;

/** Greedy label placement: try beside the dot first, then shifted up/down,
 * and keep the first spot that overlaps no placed label, no dot and stays in bounds. */
function placeLabels(layout: ScatterLayout[]) {
  const visible = layout.filter((l) => !l.hidden).sort((a, b) => a.y - b.y || a.x - b.x);
  const dots: Rect[] = visible.map((l) => ({l: l.x - DOT_R, t: l.y - DOT_R, r: l.x + DOT_R, b: l.y + DOT_R}));
  const placed: Rect[] = [];
  const offsets = [0, -LABEL_LINE, LABEL_LINE, -2 * LABEL_LINE, 2 * LABEL_LINE, -3 * LABEL_LINE, 3 * LABEL_LINE];
  for (const l of visible) {
    const w = Math.min(LABEL_WIDTH, textWidth(l.label));
    const preferLeft = l.x > SCATTER_W / 2;
    const sides = preferLeft ? [true, false] : [false, true];
    let best: {left: boolean; dy: number; rect: Rect} | null = null;
    outer: for (const dy of offsets) {
      for (const left of sides) {
        const lx = left ? l.x - LABEL_GAP - w : l.x + LABEL_GAP;
        const rect = {l: lx, t: l.y + dy - LABEL_LINE / 2, r: lx + w, b: l.y + dy + LABEL_LINE / 2};
        if (rect.l < 0 || rect.r > SCATTER_W || rect.t < 0 || rect.b > SCATTER_H) continue;
        if (placed.some((p) => hits(p, rect)) || dots.some((d) => hits(d, rect))) continue;
        best = {left, dy, rect};
        break outer;
      }
    }
    if (!best) {
      const lx = preferLeft ? Math.max(0, l.x - LABEL_GAP - w) : Math.min(SCATTER_W - w, l.x + LABEL_GAP);
      best = {left: preferLeft, dy: 0, rect: {l: lx, t: l.y - LABEL_LINE / 2, r: lx + w, b: l.y + LABEL_LINE / 2}};
    }
    placed.push(best.rect);
    l.labelOnLeft = best.left;
    l.labelLeft = best.rect.l;
    l.labelWidth = w;
    l.labelY = l.y + best.dy;
  }
}

/** Scale the snapshot into the plot with data-fitted axes, merge models that
 * share a position, and de-overlap labels on each side. */
export function layoutScatter(points: readonly Point[]) {
  const speeds = points.map((p) => p.speed ?? 0);
  const scores = points.map((p) => p.score);
  const xd = niceDomain(speeds, 5);
  const yd = niceDomain(scores, 5);
  const toX = (v: number) => PADDING + ((v - xd.min) / (xd.max - xd.min)) * (SCATTER_W - 2 * PADDING);
  const toY = (v: number) => SCATTER_H - PADDING - ((v - yd.min) / (yd.max - yd.min)) * (SCATTER_H - 2 * PADDING);

  const firstAt = new Map<string, number>();
  const layout: ScatterLayout[] = points.map((point, i) => {
    const x = toX(point.speed ?? 0);
    const y = toY(point.score);
    const key = `${point.speed ?? 0}|${point.score}`;
    const owner = firstAt.get(key);
    if (owner === undefined) firstAt.set(key, i);
    const labelOnLeft = x > SCATTER_W / 2;
    const labelLeft = labelOnLeft ? Math.max(0, x - LABEL_GAP - LABEL_WIDTH) : Math.min(SCATTER_W - LABEL_WIDTH, x + LABEL_GAP);
    return {x, y, labelLeft, labelWidth: LABEL_WIDTH, labelOnLeft, labelY: y, label: (point.name ?? '').replace(' with fallback', ''), hidden: owner !== undefined};
  });

  // Merge names of coincident models into the visible point's label.
  points.forEach((point, i) => {
    if (!layout[i].hidden) return;
    const owner = layout[firstAt.get(`${point.speed ?? 0}|${point.score}`)!];
    owner.label = mergeNames(owner.label, (point.name ?? '').replace(' with fallback', ''));
  });

  placeLabels(layout);

  return Object.assign(layout, {xTicks: ticksFor(xd, toX), yTicks: ticksFor(yd, toY)});
}

/** "Claude Opus 5 (max)" + "Claude Opus 5 (xhigh)" → "Claude Opus 5 (max / xhigh)". */
function mergeNames(a: string, b: string): string {
  const re = /^(.*) \(([^)]*)\)$/;
  const ma = a.match(re);
  const mb = b.match(re);
  if (ma && mb && ma[1] === mb[1]) return `${ma[1]} (${ma[2]} / ${mb[2]})`;
  return `${a} / ${b}`;
}

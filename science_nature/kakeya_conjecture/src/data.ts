export type Pt = [number, number, number, number];

// Scene 2: six diameters fanning the disk (SVG viewBox 720x720)
export const FAN_LINES: Pt[] = [
  [130, 360, 590, 360],
  [161, 245, 559, 475],
  [245, 161, 475, 559],
  [360, 130, 360, 590],
  [475, 161, 245, 559],
  [559, 245, 161, 475],
];

// Scene 3: Besicovitch needle cloud triangles (SVG viewBox 1000x620)
export const TRIANGLES: string[] = [
  '80,520 420,80 560,520',
  '280,540 550,100 720,520',
  '500,520 690,110 910,510',
];

// Scene 3: overlapping unit segments (SVG viewBox 1000x620)
export const MANY_LINES: Pt[] = [
  [105, 510, 535, 95],
  [150, 520, 575, 105],
  [230, 530, 650, 112],
  [300, 520, 710, 120],
  [395, 520, 790, 125],
  [485, 520, 860, 145],
  [110, 420, 885, 335],
  [100, 350, 900, 420],
  [145, 260, 870, 520],
  [210, 165, 800, 540],
];

// Scene 4: direction/scale tube diagram (SVG viewBox 900x420)
export const TUBES: Pt[] = [
  [170, 320, 750, 95],
  [160, 260, 785, 175],
  [190, 125, 770, 315],
  [300, 65, 660, 355],
  [420, 55, 475, 360],
  [205, 345, 720, 70],
];

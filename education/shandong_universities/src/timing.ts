import durations from '../public/voiceover/segment-durations.json';
import {CITIES} from './data';

export const FPS = 30;
export const SCENE_IDS = ['intro','overview',...CITIES.map((c)=>c.name),'outro'] as const;
if (durations.length !== SCENE_IDS.length) throw new Error(`旁白段落数 ${durations.length} 与场景数 ${SCENE_IDS.length} 不匹配，请运行 npm run voiceover`);
export const SCENES = SCENE_IDS.map((id, i) => ({id, start: durations.slice(0, i).reduce((a,b)=>a+b,0), duration: durations[i]}));
export const TOTAL_SECONDS = SCENES.reduce((a,s)=>a+s.duration,0) + 1.2;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS);

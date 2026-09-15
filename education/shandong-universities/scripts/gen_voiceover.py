#!/usr/bin/env python3
import json, os, subprocess, sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
VO = BASE / 'public' / 'voiceover'
VOICE = 'zh-CN-XiaoxiaoNeural'
paras = [p.strip() for p in (VO / 'narration.zh.txt').read_text(encoding='utf-8').split('\n\n') if p.strip()]
VO.mkdir(parents=True, exist_ok=True)
durations=[]
for i, para in enumerate(paras, 1):
    seg=VO/f'seg{i}.mp3'
    subprocess.run([sys.executable,'-m','edge_tts','--voice',VOICE,'--rate=+0%','--text',para,'--write-media',str(seg)],check=True)
    probe=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(seg)],capture_output=True,text=True,check=True)
    durations.append(float(probe.stdout.strip()))
concat=VO/'concat.txt'
concat.write_text(''.join(f"file 'seg{i}.mp3'\n" for i in range(1,len(paras)+1)),encoding='utf-8')
subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy',str(VO/'narration.zh.mp3')],check=True,capture_output=True)
(VO/'segment-durations.json').write_text(json.dumps(durations,ensure_ascii=False,indent=2),encoding='utf-8')
for i in range(1,len(paras)+1): (VO/f'seg{i}.mp3').unlink()
concat.unlink()
print(f'generated {len(paras)} Chinese segments, {sum(durations):.2f}s total')

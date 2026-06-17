import {createWriteStream, existsSync, mkdirSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {setDefaultResultOrder} from 'node:dns';
import {dirname, resolve} from 'node:path';
import {pipeline} from 'node:stream/promises';

setDefaultResultOrder('ipv4first');

const propsPath = resolve('render-props.json');
const props = JSON.parse(await readFile(propsPath, 'utf8'));
const audioUrl = props.audioUrl;
const outputPath = resolve('public', props.cachedAudioPath ?? 'audio/network-audio.mp3');

if (!audioUrl || typeof audioUrl !== 'string') {
  throw new Error('render-props.json needs an audioUrl string.');
}

mkdirSync(dirname(outputPath), {recursive: true});

if (existsSync(outputPath)) {
  console.log(`Audio cache exists: ${outputPath}`);
  process.exit(0);
}

console.log(`Downloading audio: ${audioUrl}`);
let response;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await fetch(audioUrl, {
      headers: { 'User-Agent': 'top500-video-builder/1.0' },
    });
    break;
  } catch (error) {
    if (attempt === 3) {
      throw error;
    }
    console.log(`Audio download attempt ${attempt} failed, retrying...`);
  }
}

if (!response.ok || !response.body) {
  throw new Error(`Audio download failed: ${response.status} ${response.statusText}`);
}

await pipeline(response.body, createWriteStream(outputPath));
console.log(`Saved audio cache: ${outputPath}`);

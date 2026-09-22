import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const {projects} = JSON.parse(readFileSync(path.join(root, 'projects.json'), 'utf8'));
const entries = Object.entries(projects);
const concurrency = Math.min(3, entries.length);

const checkProject = async ([key, project]) => {
  const projectDir = path.join(root, project.path);
  const timingCandidates = ['src/timing.ts', 'src/cues.ts'];
  const generatedFixtures = [...new Set(timingCandidates.flatMap((candidate) => {
    const sourcePath = path.join(projectDir, candidate);
    if (!existsSync(sourcePath)) return [];
    const source = readFileSync(sourcePath, 'utf8');
    const match = source.match(/from ['"](\.\.\/public\/voiceover\/[^'"]+\.json)['"]/);
    if (!match) return [];
    const generatedPath = path.resolve(path.dirname(sourcePath), match[1]);
    return existsSync(generatedPath) ? [] : [generatedPath];
  }))];

  const output = [];
  try {
    for (const fixture of generatedFixtures) writeFileSync(fixture, '[1]\n');
    const status = await new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', 'check'], {cwd: projectDir, stdio: ['ignore', 'pipe', 'pipe']});
      child.stdout.on('data', (chunk) => output.push(chunk));
      child.stderr.on('data', (chunk) => output.push(chunk));
      child.once('error', reject);
      child.once('close', (code) => resolve(code ?? 1));
    });
    return {key, generatedFixtures, output: Buffer.concat(output).toString(), status};
  } finally {
    for (const fixture of generatedFixtures) rmSync(fixture, {force: true});
  }
};

let nextIndex = 0;
const results = new Array(entries.length);
await Promise.all(Array.from({length: concurrency}, async () => {
  while (nextIndex < entries.length) {
    const index = nextIndex++;
    try {
      results[index] = await checkProject(entries[index]);
    } catch (error) {
      results[index] = {key: entries[index][0], generatedFixtures: [], output: String(error), status: 1};
    }
  }
}));

for (const {key, generatedFixtures, output, status} of results) {
  console.log(`\n> check ${key}${generatedFixtures.length ? ' (with generated-input fixture)' : ''}`);
  if (output) process.stdout.write(output);
  if (status !== 0) console.error(`Project ${key} failed with exit code ${status}`);
}
if (results.some(({status}) => status !== 0)) process.exitCode = 1;

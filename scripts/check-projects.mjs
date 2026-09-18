import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const {projects} = JSON.parse(readFileSync(path.join(root, 'projects.json'), 'utf8'));
const skipped = [];

for (const [key, project] of Object.entries(projects)) {
  const projectDir = path.join(root, project.path);
  const timingCandidates = ['src/timing.ts', 'src/cues.ts'];
  const missingGeneratedInput = timingCandidates.some((candidate) => {
    const sourcePath = path.join(projectDir, candidate);
    if (!existsSync(sourcePath)) return false;
    const source = readFileSync(sourcePath, 'utf8');
    const match = source.match(/from ['"](\.\.\/public\/voiceover\/[^'"]+\.json)['"]/);
    return match && !existsSync(path.resolve(path.dirname(sourcePath), match[1]));
  });

  if (missingGeneratedInput) {
    skipped.push(key);
    continue;
  }

  console.log(`\n> check ${key}`);
  const result = spawnSync('npm', ['run', 'check'], {
    cwd: projectDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (skipped.length > 0) {
  console.log(`\nSkipped projects requiring generated voiceover timing: ${skipped.join(', ')}`);
}

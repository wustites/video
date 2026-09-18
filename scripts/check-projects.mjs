import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const {projects} = JSON.parse(readFileSync(path.join(root, 'projects.json'), 'utf8'));
for (const [key, project] of Object.entries(projects)) {
  const projectDir = path.join(root, project.path);
  const timingCandidates = ['src/timing.ts', 'src/cues.ts'];
  const generatedFixtures = timingCandidates.flatMap((candidate) => {
    const sourcePath = path.join(projectDir, candidate);
    if (!existsSync(sourcePath)) return [];
    const source = readFileSync(sourcePath, 'utf8');
    const match = source.match(/from ['"](\.\.\/public\/voiceover\/[^'"]+\.json)['"]/);
    if (!match) return [];
    const generatedPath = path.resolve(path.dirname(sourcePath), match[1]);
    return existsSync(generatedPath) ? [] : [generatedPath];
  });

  if (generatedFixtures.length > 0) console.log(`\n> check ${key} (with generated-input fixture)`);
  else console.log(`\n> check ${key}`);
  for (const fixture of generatedFixtures) writeFileSync(fixture, '[1]\n');
  const result = (() => {
    try {
      return spawnSync('npm', ['run', 'check'], {
        cwd: projectDir,
        stdio: 'inherit',
      });
    } finally {
      for (const fixture of generatedFixtures) rmSync(fixture);
    }
  })();
  if (result.status !== 0) process.exit(result.status ?? 1);
}

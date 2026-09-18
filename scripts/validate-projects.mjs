import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const manifest = JSON.parse(readFileSync(path.join(root, 'projects.json'), 'utf8'));
assert.equal(manifest.schemaVersion, 1, 'projects.json schemaVersion must be 1');
assert.ok(manifest.projects && typeof manifest.projects === 'object', 'projects.json must contain projects');

const registeredPaths = new Set();
const packageNames = new Set();
const repositoryRemotionVersions = new Set();
const requiredScripts = ['check', 'dev', 'render', 'render:draft'];

for (const [key, project] of Object.entries(manifest.projects)) {
  assert.match(key, /^[a-z0-9_]+$/, `Invalid project key: ${key}`);
  assert.ok(project.name, `${key}: name is required`);
  assert.ok(Array.isArray(project.languages) && project.languages.length > 0, `${key}: languages are required`);
  assert.ok(Array.isArray(project.variants), `${key}: variants must be an array`);
  assert.ok(!registeredPaths.has(project.path), `${key}: duplicate path ${project.path}`);
  registeredPaths.add(project.path);

  const projectDir = path.join(root, project.path);
  const packagePath = path.join(projectDir, 'package.json');
  assert.ok(existsSync(packagePath), `${key}: missing ${project.path}/package.json`);
  assert.ok(existsSync(path.join(projectDir, 'src/index.ts')), `${key}: missing src/index.ts`);
  assert.ok(existsSync(path.join(projectDir, 'src/Root.tsx')), `${key}: missing src/Root.tsx`);

  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  assert.ok(!packageNames.has(pkg.name), `${key}: duplicate package name ${pkg.name}`);
  packageNames.add(pkg.name);
  for (const script of requiredScripts) assert.ok(pkg.scripts?.[script], `${key}: missing npm script ${script}`);
  for (const variant of project.variants) {
    assert.ok(pkg.scripts?.[`render:${variant}`], `${key}: missing npm script render:${variant}`);
  }

  const remotionVersions = ['@remotion/cli', '@remotion/google-fonts', 'remotion']
    .map((dependency) => pkg.dependencies?.[dependency])
    .filter(Boolean);
  assert.equal(new Set(remotionVersions).size, 1, `${key}: Remotion packages must use one exact version`);
  for (const version of remotionVersions) {
    assert.match(version, /^\d+\.\d+\.\d+$/, `${key}: pin Remotion version exactly`);
    repositoryRemotionVersions.add(version);
  }
}

assert.equal(repositoryRemotionVersions.size, 1, 'All projects must use the same Remotion version');

for (const category of ['creative_brand', 'data_visualization', 'education', 'geography_transport', 'history_society', 'science_nature']) {
  for (const entry of readdirSync(path.join(root, category), {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const relative = `${category}/${entry.name}`;
    if (existsSync(path.join(root, relative, 'package.json'))) {
      assert.ok(registeredPaths.has(relative), `Unregistered project: ${relative}`);
    }
  }
}

console.log(`Validated ${registeredPaths.size} projects.`);

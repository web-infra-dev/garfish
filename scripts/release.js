const { join } = require('path');
const execa = require('execa');
const fs = require('fs');
const { execSync } = require('child_process');

function objectMap(obj, fn) {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => fn(k, v))
      .filter(notNullish),
  );
}

execSync('npx bumpp package.json packages/*/package.json', {
  stdio: 'inherit',
});

const templates = [
  'packages/create-app/template',
  'packages/create-theme/template',
];

const { version } = await fs.readJSON('package.json');

for (const template of templates) {
  const path = join(template, 'package.json');
  const pkg = await fs.readJSON(path);
  const deps = ['dependencies', 'devDependencies'];
  for (const name of deps) {
    if (!pkg[name]) continue;
    pkg[name] = objectMap(pkg[name], (k, v) => {
      if (k.startsWith('@slidev/') && !k.startsWith('@slidev/theme'))
        return [k, `^${version}`];
      return [k, v];
    });
  }
  await fs.writeJSON(path, pkg, { spaces: 2 });
}

await $`git add .`;
await $`git commit -m "chore: release v${version}"`;
await $`git tag v${version}`;
await $`git push`;
await $`git push origin --tags`;

const execa = require('execa');
const path = require('path');
const bumpPrompt = require('@jsdevtools/version-bump-prompt');

const bin = (name) => path.resolve(__dirname, '../node_modules/.bin/' + name);
const run = (bin, args, opts = {}) => {
  return execa(bin, args, { stdio: 'inherit', ...opts });
};
const step = (msg) => {
  console.log(chalk.cyan(msg));
};

async function main() {
  // run tests before release
  step('\nRunning tests...');

  // build all packages with types
  step('\nBuilding all packages...');
  await build();

  // build all packages with types
  step('\nSelect bumpVersion...');
  const selectVersion = await bumpVersion();
  if (selectVersion) {
    console.log(selectVersion);
    // build all packages with types
    step('\npublishing...');
    // await publish();
  }
}

async function build() {
  await run('pnpm', ['build']);
}

async function bumpVersion() {
  return await bumpPrompt({
    commit: 'chore(publish): release v',
    push: true,
    tag: true,
  });
}

async function publish() {
  await run('pnpm', ['publish']);
}

main().catch((err) => {
  console.error(err);
});

const execa = require('execa');
const path = require('path');
const bumpPrompt = require('@jsdevtools/version-bump-prompt');
const chalk = require('chalk');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));

const run = (bin, args, opts = {}) => {
  return execa(bin, args, { stdio: 'inherit', ...opts });
};
const step = (msg) => {
  console.log(chalk.cyan(msg));
};

async function main() {
  // build all packages with types
  step('\nSelect bumpVersion...');
  const selectVersion = await bumpVersion();
  if (selectVersion) {
    step(
      `\nbumpVersion ${selectVersion.oldVersion} => ${selectVersion.newVersion}...`,
    );
  }

  // run tests before release
  step('\nRunning tests...');
  await test();

  // build all packages with types
  // step('\nBuilding all packages...');
  // await build();

  // const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  // if (stdout) {
  //   step('\nCommitting changes...');
  //   await run('git', ['add', '-A']);
  //   await run('git', ['commit', '-m', `release: v${selectVersion.newVersion}`]);
  // } else {
  //   console.log('No changes to commit.');
  // }

  // // step('\nPublishing...');
  // if (selectVersion) {
  //   step('\npublishing...');
  // }
  // await publish(selectVersion.newVersion);

  // // push to GitHub
  // step('\nPushing to GitHub...');
  // await pushToGithub(selectVersion);
}

async function build() {
  await run('pnpm', ['build']);
}

async function test() {
  await run('pnpm', ['test']);
}

async function bumpVersion() {
  return await bumpPrompt({
    // commit: 'chore(publish): release v',
    files: ['package.json', 'packages/runtime/*/package.json'],
    release: args.tag || '',
    push: false,
    tag: false,
  });
}

async function pushToGithub(selectVersion) {
  // push to GitHub
  await run('git', ['tag', `v${selectVersion.newVersion}`]);
  await run('git', [
    'push',
    'origin',
    `refs/tags/v${selectVersion.newVersion}`,
  ]);
  await run('git', ['push']);
}

async function publish(version) {
  let releaseTag = 'latest';
  if (args.tag) {
    releaseTag = args.tag;
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha';
  } else if (version.includes('beta')) {
    releaseTag = 'beta';
  } else if (version.includes('rc')) {
    releaseTag = 'rc';
  }
  let publishArgs = ['-r', 'publish', '--access', 'public', '--no-git-checks'];
  if (version) {
    publishArgs = publishArgs.concat(['--tag', releaseTag]);
  }

  await run('pnpm', publishArgs);
}

main().catch((err) => {
  console.error(err);
});

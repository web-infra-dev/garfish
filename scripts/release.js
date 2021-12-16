const bumpPrompt = require('@jsdevtools/version-bump-prompt');
const { run, step } = require('./utils');

const args = require('minimist')(process.argv.slice(2));

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
  step('\nBuilding all packages...');
  await build();

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    step('\nCommitting changes...');
    await run('git', ['add', '-A']);
    await run('git', ['commit', '-m', `release: v${selectVersion.newVersion}`]);
  } else {
    console.log('No changes to commit.');
  }

  // step('\nPublishing...');
  if (selectVersion) {
    step('\npublishing...');
  }
  await publish(selectVersion.newVersion);

  // push to GitHub
  step('\nPushing to GitHub...');
  await pushToGithub(selectVersion);
}

async function build() {
  await run('pnpm', ['build']);
}

async function test() {
  await run('pnpm', ['test']);
}

async function bumpVersion() {
  return await bumpPrompt({
    files: ['package.json', 'packages/*/package.json'],
    release: args.version || '',
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
  if (args.version) {
    releaseTag = args.version;
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

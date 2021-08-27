const lernaPublish = require('@lerna/publish');

const opts = {
  yes: Boolean(process.env.CI), // 自动升级版本
  conventionalCommits: true,
  message: 'chore(release): publish %s',
  push: false,
  includeMergedTags: true,
  preDistTag: 'alpha',
  distTag: 'latest',
  preid: 'alpha',
  verifyAccess: false,
  verifyRegistry: false,
  tagVersionPrefix: '',
};

function publish(canary) {
  console.log(`publish ${canary ? '测试版本' : '正式版本'}\n`);

  return lernaPublish({
    ...opts,
    canary,
    bump: 'patch',
    forcePublish: canary,
    _: ['publish'],
  });
}

publish(process.argv.includes('--canary'));

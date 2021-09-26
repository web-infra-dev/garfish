const lernaVersion = require('@lerna/version');
const { step } = require('./utils');

const opts = {
  push: false,
  exact: true,
  noChangelog: true,
  verifyAccess: false,
  verifyRegistry: false,
  includeMergedTags: true,
  conventionalCommits: false,
  yes: Boolean(process.env.CI), // 自动升级版本
  // 版本 deploy canary 暂时指定 tag 为 rc-canary
  tagVersionPrefix: '',
  preDistTag: 'rc-canary',
  message: 'chore(release): publish %s',
};

function bump(mode) {
  const versionOpts = { ...opts, _: ['version', 'patch'] };
  // Todo test
  switch (mode) {
    // 手动选择版本
    case 'manual':
      return lernaVersion({ ...versionOpts, conventionalCommits: false });
    case 'force':
      return lernaVersion({
        ...versionOpts,
        conventionalCommits: false,
        forcePublish: true,
      });
    // 根据 conventional-commit 自动选择版本
    case 'auto':
      return lernaVersion({ ...versionOpts, conventionalCommits: false });
    // beta 变正式
    case 'stable':
      return lernaVersion({ ...versionOpts, conventionalGraduate: true });
    // 正式变 beta
    case 'beta':
      return lernaVersion({ ...versionOpts, conventionalPrerelease: true });
    default:
      throw new Error(`mode not supported:${mode}`);
  }
}

step(
  [
    'beta: 升级为beta版本',
    'manual: 手动选择升级版本',
    'stable: 将beta版本升级为正式版',
    'force: 强制更新版本，即使没有更新',
    'auto: 根据 commit 自动更新版本，遵循 conventional-commit 规范(https://www.conventionalcommits.org/zh-hans/)， 并自动推送 tag',
  ].join('\n'),
);

bump(process.argv[2]);

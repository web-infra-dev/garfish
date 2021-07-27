/* eslint-disable no-console */
const lernaVersion = require('@lerna/version');

const opts = {
  yes: Boolean(process.env.CI), // 自动升级版本
  conventionalCommits: false,
  noChangelog: true,
  message: 'chore(release): publish %s',
  push: false,
  includeMergedTags: true,
  // v6 版本 deploy canary 暂时指定 tag 为 rc-canary
  preDistTag: 'rc-canary',
  verifyAccess: false,
  verifyRegistry: false,
  tagVersionPrefix: '',
};

function bump(mode) {
  const versionOpts = { ...opts, _: ['version', 'patch'] };
  // todo test
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
    // 根据conventional-commit自动选择版本
    case 'auto':
      return lernaVersion({ ...versionOpts, conventionalCommits: false });
    // beta 变正式
    case 'stable':
      return lernaVersion({ ...versionOpts, conventionalGraduate: true });

    // 正式变beta
    case 'beta':
      return lernaVersion({ ...versionOpts, conventionalPrerelease: true });
    default:
      throw new Error(`mode not supported:${mode}`);
  }
}

console.log(
  [
    'auto: 根据commit自动更新版本，遵循conventional-commit规范(https://www.conventionalcommits.org/zh-hans/),并自动推送tag',
    'force: 强制更新版本，即使没有更新',
    'manual: 手动选择升级版本',
    'stable: 将beta版本升级为正式版',
    'beta: 升级为beta版本',
  ].join('\n'),
);

bump(process.argv[2]);
/* eslint-enable no-console */

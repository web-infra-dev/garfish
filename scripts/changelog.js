const fs = require('fs');
const execa = require('execa');
const lernaJson = require('../lerna.json');
const pkgJson = require('../package.json');
const conventionalChangelog = require('conventional-changelog');

// update version
if (lernaJson && pkgJson) {
  const curVersion = lernaJson.version;
  if (curVersion) {
    pkgJson.version = curVersion;
    fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));

    conventionalChangelog({
      preset: 'angular',
      skipUnstable: true,
    }).pipe(process.stdout);

    // 只对正式的版本做生成
    execa('conventional-changelog', [
      '-p',
      'angular',
      '-i',
      'CHANGELOG.md',
      '-o',
      'CHANGELOG.md',
      '-a',
      '-s',
      '--skip-unstable',
    ]);
  }
}

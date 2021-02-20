const fs = require('fs');
const execa = require('execa');
const lernaJson = require('../lerna.json');
const pkgJson = require('../package.json');

// update version
if (lernaJson && pkgJson) {
  const curVersion = lernaJson.version;
  if (curVersion) {
    pkgJson.version = curVersion;
    fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));

    // 只对正式的版本做生成
    if (!/-[a-z]+/.test(curVersion)) {
      execa('conventional-changelog', [
        '-p',
        'angular',
        '-i',
        'CHANGELOG.md',
        '-s',
      ]);
    }
  }
}

#!/usr/bin/env node
/* eslint-disable no-restricted-globals */

const co = require('co');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const tmpDirPath = os.tmpdir();
const configPath = path.join(tmpDirPath, 'garfish-config.json');
console.log('tmp dir: ', tmpDirPath);

const config = {
  firstInstall: true,
};

// @byted/garfish preinstall 时会提供 fromInternalGarfish 环境变量
const fromInternalGarfish = process.env.fromInternalGarfish;

co(function* () {
  // 处于内网环境并且不是来自 @byted/garfish 隐式依赖时
  // 第一次安装 garfish 终止安装
  if (isInternal() && !fromInternalGarfish) {
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(config));
      console.error(
        '检测到目前可能处于内网环境，请使用 @byted/garfish 代替 garfish 包',
      );
      process.exit(1);
    }
  }
}).catch((err) => {
  console.error(err.stack);
});

function isInternal() {
  try {
    const { stdout } = spawnSync('npm', ['view', '@byted/garfish', '--json'], {
      timeout: 3000,
    });

    const npmData = JSON.parse(stdout.toString(), null, 2);

    if (npmData.name === '@byted/garfish') {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

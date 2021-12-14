#!/usr/bin/env node
/* eslint-disable no-restricted-globals */

const { spawnSync } = require('child_process');

// @byted/garfish preinstall 时会提供 fromInternalGarfish 环境变量
const DISABLE_GARFISH_CHECK_INTERNAL =
  !!process.env.DISABLE_GARFISH_CHECK_INTERNAL;

try {
  // 处于内网环境并且不是来自 @byted/garfish 隐式依赖时
  // 当前 Monorepo 仓库安装 demo 时
  if (isInternal() && !DISABLE_GARFISH_CHECK_INTERNAL) {
    console.warn(
      '检测到目前可能处于内网环境，请使用 @byted/garfish 代替 garfish 包',
    );
  }
} catch (err) {
  console.error(err.stack);
}

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

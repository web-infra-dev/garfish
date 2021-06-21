// umd: 打包成 umd 格式，依赖包打进来
// esm-builder: 打包成 esm，依赖包不打进来
// esm-browser: 打包成 esm，依赖包一起打进来
// cjs: 打包成 commonjs，依赖包不打进来
// cjs.prod: 打包成 commonjs，依赖包不打进来，有些环境变量不同

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const execa = require('execa');
const {
  getDeps,
  allTargets,
  clearConsole,
  matchPkgName,
  fuzzyMatchTarget,
} = require('./utils');

const args = require('minimist')(process.argv.slice(2));
const targets = args._;
const watch = args.watch || args.w;
const formats = args.formats || args.f;
const noCheck = args.nocheck || args.n;
const sourceMap = args.sourcemap || args.s;
const mergeTypes = args.mergetypes || args.m;
const noExternal = args.noExternal || args.e; // 把 garfish 的子包都打进去

clearConsole();
run();

async function run() {
  const buildAll = async (targets) => {
    for (const target of targets) {
      // watch mode can't await
      if (target.indexOf('hooks') !== -1) continue;
      if (watch) {
        build(target);
      } else {
        await build(target);
      }
    }
  };

  if (!targets.length) {
    await buildAll(allTargets);
  } else {
    await buildAll(fuzzyMatchTarget(targets));
  }
}

async function build(target) {
  const pkgDir = path.resolve(`packages/runtime/${target}`);
  const pkg = require(`${pkgDir}/package.json`);

  if (pkg.private) {
    return;
  }

  if (!formats) {
    await fs.remove(`${pkgDir}/dist`);
  }

  await execa(
    'rollup',
    [
      watch ? '-wc' : '-c',
      '--environment',
      [
        'ENV:production',
        `TARGET:${target}`,
        `CHECK:${!noCheck}`,
        formats ? `FORMATS:${formats}` : '',
        sourceMap ? 'SOURCE_MAP:true' : '',
        noExternal ? 'NO_EXTERNAL:true' : '',
      ]
        .filter(Boolean)
        .join(','),
    ],
    { stdio: 'inherit' },
  );

  // Merge .d.ts
  if (mergeTypes && pkg.types) {
    mergeBuildTypes(pkgDir, target);
  }
}

function getPrivateDeps(dotDTs) {
  const code = fs.readFileSync(dotDTs).toString();
  const deps = getDeps(code);
  return allTargets
    .map((target) => {
      const pkg = require(path.resolve(
        `packages/runtime/${target}/package.json`,
      ));
      return pkg.private
        ? deps.find((v) => {
            if (v.pkgName === pkg.name) {
              v.dirName = target;
              return v;
            }
            return null;
          })
        : null;
    })
    .filter((v) => v);
}

const mergeOpts = {
  localBuild: true,
  showVerboseMessages: true,
};

function mergePrivateTypes(
  config,
  baseRoot,
  target,
  completedPkgs,
  { dirName, pkgName },
) {
  const { Extractor } = require('@microsoft/api-extractor');
  const { publicTrimmedFilePath, mainEntryPointFilePath } = config;

  // 复用 config，打包依赖的私有包
  config.mainEntryPointFilePath = mainEntryPointFilePath.replace(
    `dist/packages/runtime/${target}/`,
    `dist/packages/runtime/${dirName}/`,
  );

  config.publicTrimmedFilePath = publicTrimmedFilePath.replace(
    `runtime/${baseRoot}/dist/${target}.d.ts`,
    `runtime/${baseRoot}/dist/${dirName}.d.ts`,
  );

  // 替换包的引用方式
  const replaceDeps = () => {
    const code = fs.readFileSync(publicTrimmedFilePath).toString();
    fs.writeFileSync(
      publicTrimmedFilePath,
      code.replace(matchPkgName(pkgName), (k1) => {
        return k1.replace(pkgName, `./${dirName}`);
      }),
    );
  };

  // 避免循环引用打包的问题
  if (completedPkgs.includes(config.publicTrimmedFilePath)) {
    replaceDeps();
    return true;
  }

  const result = Extractor.invoke(config, mergeOpts);
  if (result.succeeded) {
    completedPkgs.push(config.publicTrimmedFilePath);
    const deps = getPrivateDeps(config.publicTrimmedFilePath);

    if (deps.length > 0) {
      const done = deps.every((data) =>
        mergePrivateTypes(config, baseRoot, dirName, completedPkgs, data),
      );
      if (!done) return false;
    }
    replaceDeps();
  }
  return result.succeeded;
}

function extractorGlobalExtensions(pkgDir, target, extractorConfig) {
  // If the current package contains additional global. Which s, can be manually spliced into the back
  const globalExtensions = path.resolve(
    pkgDir,
    `dist/packages/runtime/${target}/src/globalExtensions.d.ts`,
  );
  if (fs.existsSync(globalExtensions)) {
    const codeExternals = fs.readFileSync(globalExtensions).toString();
    const code = fs
      .readFileSync(extractorConfig.publicTrimmedFilePath)
      .toString();
    let hasExport = false;

    const codeFormate = codeExternals.split('\n').reduce((pre, next) => {
      if (next.indexOf('declare module') !== -1) hasExport = true;
      if (!hasExport || !next) return pre;
      return `${pre}\n${next}`;
    }, '');
    fs.writeFileSync(extractorConfig.publicTrimmedFilePath, code + codeFormate);
  }
}

async function mergeBuildTypes(pkgDir, target) {
  console.log(
    chalk.bold(chalk.blue.bold(`Rolling up type definitions for ${target}...`)),
  );

  const completedPkgs = [];
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
  const extractorConfigPath = path.resolve(pkgDir, 'api-extractor.json');
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath,
  );
  const extractorResult = Extractor.invoke(extractorConfig, mergeOpts);

  if (extractorResult.succeeded) {
    completedPkgs.push(extractorConfig.publicTrimmedFilePath);
    const deps = getPrivateDeps(extractorConfig.publicTrimmedFilePath);
    if (
      !deps.length ||
      deps.every((data) =>
        mergePrivateTypes(extractorConfig, target, target, completedPkgs, data),
      )
    ) {
      console.log(chalk.green.bold('API Extractor completed successfully.\n'));
      extractorGlobalExtensions(pkgDir, target, extractorConfig);
      // await fs.remove(`${pkgDir}/dist/packages`);
      // await fs.remove('dist');
      // await fs.remove('temp');
    }
  } else {
    console.log(
      chalk.red.bold(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`,
      ),
    );
    process.exit(1);
  }
}

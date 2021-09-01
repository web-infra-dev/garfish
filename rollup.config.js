import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import json from '@rollup/plugin-json';
import ts from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';

if (!process.env.TARGET) {
  chalk.red.bold('TARGET package must be specified via --environment flag.');
  process.exit(1);
}

console.log(
  chalk.blue.bold(
    `${chalk.underline(toCamelCase(process.env.TARGET))} module building...`,
  ),
);

const packagesDir = path.resolve(__dirname, 'packages/runtime');
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const name = path.basename(packageDir);
const resolve = (p) => (path.isAbsolute(p) ? p : path.resolve(packageDir, p));
const pkg = require(resolve('package.json'));
const buildOptions = pkg.buildOptions || {};
const distPath = process.env.ENV === 'production' ? 'dist' : process.env.MAIN;

const outputConfigs = {
  cjs: {
    file: resolve(`${distPath}/${name}.cjs.js`),
    format: 'cjs',
  },
  'esm-bundler': {
    file: resolve(`${distPath}/${name}.esm-bundler.js`),
    format: 'es',
  },
  'esm-browser': {
    file: resolve(`${distPath}/${name}.esm-browser.js`),
    format: 'es',
  },
  umd: {
    file: resolve(`${distPath}/${name}.umd.js`),
    format: 'umd',
  },
};

const defaultFormats = ['esm-bundler', 'esm-browser', 'cjs', 'umd'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',');
const packageFormats = inlineFormats || buildOptions.formats || defaultFormats;
const packageConfigs = packageFormats.map((format) =>
  createConfig(format, outputConfigs[format]),
);

if (packageFormats.includes('cjs')) {
  packageConfigs.push(createProductionConfig('cjs'));
}

function toCamelCase(v) {
  return v
    .split(/[_-]/g)
    .map(
      (l) =>
        l && l.charAt(0).toLocaleUpperCase() + l.slice(1).toLocaleLowerCase(),
    )
    .join('');
}

function createReplacePlugin(
  isProductionBuild,
  isUmdBuild,
  isBundlerESMBuild,
  isBrowserESMBuild,
) {
  return replace({
    __TEST__: false,
    __VERSION__: `"${pkg.version}"`,
    __BROWSER__: !!(isUmdBuild || isBrowserESMBuild),
    __DEV__: isBundlerESMBuild
      ? '(process.env.NODE_ENV !== "production")'
      : !isProductionBuild,
  });
}

function baseExternal() {
  const pkgJson = (f) =>
    require(path.resolve(packagesDir, `./${f}/package.json`));
  return fs
    .readdirSync(packagesDir)
    .filter(
      (f) =>
        fs.statSync(path.resolve(packagesDir, `./${f}`)).isDirectory() &&
        !pkgJson(f).private &&
        !pkgJson(f).tools,
    )
    .map((f) => pkgJson(f).name);
}

function allExternal() {
  const base = baseExternal();
  const deps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  if (process.env.NO_EXTERNAL) {
    for (let i = 0; i < deps.length; i++) {
      if (base.includes(deps[i])) {
        deps.splice(i, 1);
        i--;
      }
    }
    return deps;
  }
  return [...new Set(base, deps)];
}

console.log(allExternal(), 'xxx');

function extractTsDeclare() {
  let pkgDir = '';
  let pkgName = '';
  return {
    name: 'garfish-extractTsDeclare',
    options(op) {
      pkgDir = op.input.replace('/src/index.ts', '');
      const splitPkg = pkgDir.split('/');
      pkgName = splitPkg[splitPkg.length - 1];
    },
    writeBundle() {
      if (!pkgName) return;

      const tsTypeDir = path.resolve(
        pkgDir,
        `dist/packages/runtime/${pkgName}/src`,
      );

      setTimeout(() => {
        if (!fs.existsSync(tsTypeDir)) return;
        fs.copySync(
          path.resolve(pkgDir, tsTypeDir),
          path.resolve(pkgDir, 'dist/'),
          {
            overwrite: true,
          },
        );
      }, 1000);
    },
  };
}

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.externalLiveBindings = false;
  output.sourcemap = !!process.env.SOURCE_MAP;

  const input = resolve('src/index.ts');
  const isUmdBuild = /umd/.test(format);
  const isBundlerESMBuild = /esm-bundler/.test(format);
  const isBrowserESMBuild = /esm-browser/.test(format);
  const isProductionBuild =
    process.env.__DEV__ === 'false' || /\.prod\.js$/.test(output.file);

  if (isUmdBuild) {
    output.name = buildOptions.name || toCamelCase(name);
  }

  // 有可能引用外部包，但是外部包有可能没有 esm 版本
  const nodePlugins = [
    require('@rollup/plugin-node-resolve').nodeResolve({
      // console 这个模块和原生的有重合
      preferBuiltins: false,
    }),
    require('@rollup/plugin-commonjs')({
      sourceMap: false,
    }),
  ];

  const tsPlugin = ts({
    check: process.env.CHECK !== 'false',
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      exclude: ['**/__tests__'],
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: process.env.ENV === 'production',
      },
    },
  });

  return {
    input,
    output,
    plugins: [
      json({
        namedExports: false,
      }),
      tsPlugin,
      createReplacePlugin(
        isProductionBuild,
        isUmdBuild,
        isBundlerESMBuild,
        isBrowserESMBuild,
      ),
      ...nodePlugins,
      ...plugins,
      extractTsDeclare(),
    ],
    treeshake: { moduleSideEffects: true },
    // 可以裸跑在浏览器里面的或者指定了不需要 external 的都需要把依赖打进去
    external: isUmdBuild || isBrowserESMBuild ? [] : allExternal(),
  };
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`${distPath}/${name}.${format}.prod.js`),
    format: outputConfigs[format].format,
  });
}

export default packageConfigs;

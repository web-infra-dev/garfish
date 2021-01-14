/**
 *  `$ yarn pkg app-name`
 *  If app already exists, you can specify `-c` remove old project:
 *  `$ yarn pkg app-name -c`
 */
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const chalk = require('chalk');
const parser = require('dir-parser');
const { sleep, toCamelCase, clearConsole } = require('./utils');

const args = require('minimist')(process.argv.slice(2));
const needBin = args.bin || args.b;
const private = args.private || args.p;
const app = args._[0];
const type = args.type || args.t || 'core'; // 'core' | 'tool'

const clear = args.clear || args.c;
const appDir = path.resolve(`packages/${type}/${app}`);
const pkgLocation = path.resolve(`packages/${type}`);

clearConsole(
  chalk.blue.bold(`📦 Create new child package ${chalk.green.bold(app)}...`),
);

if (!app) {
  console.log();
  console.log(chalk.red.bold('Need to specify the app name'));
  process.exit(1);
}

if (type !== 'core' && type !== 'tool') {
  console.log();
  console.log(
    chalk.yellow.bold(
      `${chalk.red.bold(
        type,
      )} type a packages are not allowed, currently there are only two packages "core" or "tool"`,
    ),
  );
  process.exit(1);
}

create();

async function create() {
  if (fs.existsSync(appDir)) {
    if (clear) {
      console.log();
      console.log(
        chalk.yellow.bold(`🧹 Old ${chalk.underline(app)} removeing...`),
      );
      await fs.remove(appDir);
      console.log();
      console.log(chalk.green.bold('✔  Remove complete'));
    } else {
      console.log();
      console.log(
        chalk.red.bold(
          `${chalk.underline(
            chalk.green.bold(app),
          )} already exists, if need delete it, specify '-c'`,
        ),
      );
      process.exit(1);
    }
  }

  const cmds = ['create', app, pkgLocation, '--es-module'];
  private && cmds.push('--private');

  const child = execa('lerna', cmds, {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  const pkgJsonDir = path.resolve(appDir, './package.json');
  const failed = () => {
    if (failed.called) return;
    failed.called = true;
    child.kill('SIGINT');

    if (
      !fs.existsSync(pkgJsonDir) ||
      fs.readFileSync(pkgJsonDir, 'utf-8') === ''
    ) {
      fs.removeSync(appDir);
      clearConsole(
        chalk.yellow.bold(
          `💔 ${chalk.underline(
            chalk.green.bold(app),
          )} package creation was cancelled, please try again`,
        ),
      );
      console.log();
    }
  };

  // 键盘中断，删掉已有的模板
  process.on('SIGINT', failed);

  try {
    await stdioPipe(child);
  } catch (err) {}

  await updateAppContent(appDir);

  console.log();
  console.log(
    chalk.green.bold(
      `👌 ${chalk.underline(app)} create at ${chalk.underline(appDir)}`,
    ),
  );
  console.log();
  console.log(chalk.blue.bold.dim((await parser(appDir)).dirTree));

  process.exit(0);
}

function stdioPipe(child) {
  return new Promise((resolve) => {
    child.stdout.on('data', (buf) => {
      const str = buf.toString().trim();
      const output = () => process.stdout.write(buf);
      const is = (s) => str.startsWith(s) || str.endsWith(s);
      const write = async (s) => {
        if (s === 'close') {
          await sleep(1000);
          child.kill('SIGKILL');
          resolve();
        } else {
          child.stdin.write(Buffer.from(`${s}\n`, 'utf-8'));
        }
      };

      writeToPkgJson(is, write, output, child);
    });

    process.stdin.on('data', (buf) => {
      child.stdin.write(buf);
    });
  });
}

function writeToPkgJson(is, write) {
  if (is('package name')) {
    write(`@garfish/garfish-${app}`);
  } else if (is('version')) {
    write('');
  } else if (is('description:')) {
    write(`${app} module.`);
  } else if (is('keywords')) {
    write(`garfish ${app}`);
  } else if (is('homepage')) {
    write('http://garfish.bytedance.com');
  } else if (is('author')) {
    write('Bytedance');
  } else if (is('license')) {
    write('Apache-2.0');
  } else if (is('entry point')) {
    if (type === 'tool') {
      write('dist/index.js');
    } else {
      write('index.js');
    }
  } else if (is('module entry')) {
    if (type === 'tool') {
      write('dist/index.js');
    } else {
      write(`dist/${app}.esm-bundler.js`);
    }
  } else if (is('git repository')) {
    const repo = require(path.resolve(__dirname, '../package.json')).repository;
    write(repo ? repo : '');
  } else if (is('(yes)')) {
    write('yes');
    write('close');
  } else {
    // don't ouput
  }
}

async function updateAppContent(appDir) {
  const resolve = (p) => path.resolve(appDir, p);
  const jsonDir = resolve('./package.json');

  if (!fs.existsSync(jsonDir)) {
    console.log();
    console.log(chalk.red.bold('💔 Creation failed'));
    process.exit(1);
  }
  const pkg = require(path.resolve(jsonDir));

  delete pkg.files;
  delete pkg.scripts;
  delete pkg.directories;
  delete pkg.publishConfig;

  if (type === 'tool') {
    pkg.tools = true;
    if (needBin) {
      pkg.bin = { [toCamelCase(app, false)]: './bin/start.js' };
    }
    pkg.scripts = {
      build: 'tsc',
      dev: 'tsc -w',
      move: 'node ./test.js',
    };
    pkg.types = 'dist/index.d.ts';
  } else {
    pkg.scripts = {};
    pkg.types = `dist/${app}.d.ts`;
    pkg.buildOptions = {
      name: toCamelCase(app),
      devTemplate: 'module',
      formats: ['esm-bundler', 'esm-browser', 'cjs', 'umd'],
    };
  }
  pkg.dependencies = {};
  fs.writeFileSync(jsonDir, JSON.stringify(pkg, null, 2));

  // update app.js to index.ts
  const mainDir = resolve('./src');
  await fs.remove(mainDir);
  await fs.mkdir(mainDir);

  fs.writeFileSync(
    path.resolve(mainDir, './index.ts'),
    '//eslint-disable-next-line\nexport default {};',
  );

  // update index.test file
  await fs.remove(resolve(`./__tests__/${app}.test.js`));
  const testTemplate = `
    import toolApp from '../src/index';

    describe('${app}', () => {
      it('needs tests');
    });
  `;

  fs.writeFileSync(
    resolve('./__tests__/index.spec.ts'),
    testTemplate
      .split('\n')
      .map((l) => l.slice(4))
      .filter((v, i) => v || i === 2)
      .join('\n'),
  );

  // create files of different environment
  if (type === 'core') {
    fs.writeFileSync(
      resolve('./api-extractor.json'),
      JSON.stringify(
        {
          extends: '../../../api-extractor.json',
          mainEntryPointFilePath: `./dist/packages/core/${app}/src/index.d.ts`,
          dtsRollup: {
            publicTrimmedFilePath: `./dist/${app}.d.ts`,
          },
        },
        null,
        2,
      ),
    );

    // add .npmignore
    fs.writeFileSync(
      resolve('./.npmignore'),
      [
        'src/',
        'node_modules/',
        '__tests__/',
        'api-extractor.json',
        '.npmignore',
      ].join('\n'),
    );
  } else {
    const parentTsConf = require('../tsconfig.json');

    parentTsConf.compilerOptions.outDir = 'dist';
    parentTsConf.compilerOptions.rootDir = './src';
    parentTsConf.compilerOptions.module = 'commonjs';
    // parentTsConf.compilerOptions.paths = { '@garfish/*': ['../*/src'] };
    parentTsConf.include = ['src'];

    fs.writeFileSync(
      resolve('./tsconfig.json'),
      JSON.stringify(parentTsConf, null, 2),
    );

    if (needBin) {
      fs.mkdirSync(resolve('./bin'));
      fs.writeFileSync(resolve('./bin/start.js'), '#! /usr/bin/env node\n');
    }

    // add .npmignore
    fs.writeFileSync(
      resolve('./.npmignore'),
      [
        'src/',
        'node_modules/',
        '__tests__/',
        'tsconfig.json',
        '.npmignore',
      ].join('\n'),
    );
  }

  // update README.md
  const readme = fs.readFileSync(resolve('./README.md'), 'utf-8');
  fs.writeFileSync(
    resolve('./README.md'),
    readme.replace(new RegExp(app, 'g'), `@garfish/${app}`),
  );
}

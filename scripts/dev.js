// Demo:
//  yarn: `$ yarn dev gar -n`
//  npm: `$ npm run dev gar -- -n`
// Why npm need add `--`, reason is here: https://docs.npmjs.com/cli/run-script
const { runAllExample, ports } = require('./utils/runExample.js');

runAllExample();

// const path = require('path');
// const chalk = require('chalk');
// const fs = require('fs-extra');
// const execa = require('execa');
// const
// const {
//   sleep,
//   clearConsole,
//   fuzzyMatchTarget,
//   toCamelCase,
// } = require('./utils');

// const args = require('minimist')(process.argv.slice(2));
// const target = fuzzyMatchTarget(args._)[0];
// const open = args.open || args.o;
// const clear = args.clear || args.c;
// const noCheck = args.nocheck || args.n;
// const formats = args.formats || args.f || 'esm-browser';

// const pkgDir = path.resolve(`packages/runtime/${target}`);
// const pkg = require(path.resolve(pkgDir, './package.json'));

// const devTemplate = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <title>#name dev</title>
// </head>
// <body>
//   <div id="root"></div>
//   <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
//   <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
//   <script src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js"></script>
//   <script src="#module"></script>
//   <script type="text/babel">
//     console.log('#name', #name);
//     const { useState } = React;

//     function App() {
//       const [count, setCount] = useState(0)
//       return (
//         <div>
//           <p>Clicked {count} times</p>
//           <button onClick={() => setCount(count + 1)}>Click me</button>
//         </div>
//       )
//     }
//     ReactDOM.render(<App />, document.getElementById('root'));
//   </script>
// </body>
// </html>
// `;

// run();

// async function run() {
//   // garfish 的包用 rollup
//   // const buildOptions = pkg.buildOptions || {};
//   // const pkgDevDir =
//   //   buildOptions.devTemplate === 'module'
//   //     ? path.resolve(pkgDir, './dev')
//   //     : path.resolve('dev');

//   // if (!buildOptions.devTemplate) {
//   //   console.log(
//   //     chalk.red.bold('Need to specify the "devTemplate" in "buildOptions"'),
//   //   );
//   //   process.exit(1);
//   // }

//   // // install all deps
//   // await transfer(pkgDir, pkgDevDir, buildOptions);
//   // await sleep(100);

//   // if (buildOptions.devTemplate === 'module') {
//   //   devServer(pkgDevDir);
//   // } else {
//   //   await sleep(2000);
//   //   multipleServer(pkgDevDir);
//   // }
//   await multipleServer(pkgDevDir);
// }

// async function eachApps(pkgDevDir, fn) {
//   for (const f of fs.readdirSync(pkgDevDir)) {
//     const cwd = path.resolve(pkgDevDir, f);
//     if (
//       fs.statSync(cwd).isDirectory() &&
//       fs.existsSync(path.resolve(cwd, './package.json'))
//     ) {
//       await fn(cwd, path.basename(cwd));
//     }
//   }
// }

// async function transfer(pkgDir, pkgDevDir, buildOptions) {
//   const isModuleDev = buildOptions.devTemplate === 'module';

//   const installDeps = async () => {
//     await eachApps(pkgDevDir, async (cwd, n) => {
//       clearConsole(
//         chalk.blue.bold(
//           `🧺 ${chalk.underline(
//             chalk.green.bold(n),
//           )} project dependencies installing, This might take a while...`,
//         ),
//       );
//       console.log();

//       await execa(
//         'yarn',
//         ['install', '--registry=https://registry.npmjs.org'],
//         {
//           cwd,
//           stdio: 'inherit',
//         },
//       );
//     });
//   };
//   await installDeps();
// }

// function devServer(pkgDevDir) {
//   if (pkgDevDir) {
//     const child = execa('http-server', [
//       pkgDevDir,
//       open ? '-o/index.html' : '',
//     ]);

//     child.on('close', () => {
//       console.log(chalk.yellow.bold('Dev server closed.'));
//     });

//     child.on('error', (err) => {
//       console.error(chalk.red.bold('Dev server obtain error:'), err);
//       process.exit(1);
//     });
//   }
// }

// // main 下面的工程统一用 webpack 来调试
// async function multipleServer() {
//   await runAllExample();
// }

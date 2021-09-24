import type { Options } from 'tsup';
import pkg from './package.json';
import { replace } from 'esbuild-plugin-replace';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const targets = args._;
const watch = args.watch || args.w;
const formats = args.formats || args.f;
const noCheck = args.nocheck || args.n;
const sourceMap = args.sourcemap || args.s;
const mergeTypes = args.mergetypes || args.m;
const noExternal = args.noExternal || args.e;

export const tsup: Options = {
  sourcemap: sourceMap,
  clean: true,
  dts: true,
  watch: !!watch,
  format: ['cjs', 'esm'],
  esbuildPlugins: [
    replace({
      __VERSION__: `'${pkg.version}'`,
      __DEV__:
        '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
      __TEST__: 'false',
    }),
  ],
};

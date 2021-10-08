import type { Options } from 'tsup';
import minimist from 'minimist';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json';

const args = minimist(process.argv.slice(2));
const watch = process.env.WATCH;
const sourceMap = args.sourcemap || args.s;

export const tsup: Options = {
  sourcemap: sourceMap,
  clean: true,
  dts: true,
  watch: watch ? 'src/' : false,
  format: ['esm', 'cjs', 'iife'],
  legacyOutput: true,
  esbuildPlugins: [
    replace({
      __VERSION__: `'${pkg.version}'`,
      __DEV__:
        '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
      __TEST__: 'false',
    }),
  ],
};

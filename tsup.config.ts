import type { Options } from 'tsup';
import pkg from './package.json';
import { replace } from 'esbuild-plugin-replace';

export const tsup: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  watch: !!process.env.WATCH,
  format: ['cjs', 'esm'],
  esbuildPlugins: [
    replace({
      __VERSION__: `'${pkg.version}'`,
      __DEV__:
        '(process && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
      __TEST__: 'false',
    }),
  ],
};

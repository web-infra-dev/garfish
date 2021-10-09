import type { Options } from 'tsup';
import { replace } from 'esbuild-plugin-replace';

const watch = process.env.WATCH;
const sourcemap = Boolean(process.env.SOURCEMAP);

export const baseTsup = (pkg): Options => ({
  sourcemap,
  clean: true,
  dts: true,
  watch: watch ? 'src/' : false,
  format: ['esm', 'cjs', 'iife'],
  legacyOutput: true,
  globalName: pkg.name
    .replace(/@/g, '')
    .split(/[\/-]/g)
    .map((l) => l[0].toUpperCase() + l.slice(1))
    .join(''),
  esbuildPlugins: [
    replace({
      __TEST__: 'false',
      __VERSION__: `'${pkg.version}'`,
      __DEV__:
        '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
    }),
  ],
});

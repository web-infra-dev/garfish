import type { Options } from 'tsup';
import { replace } from 'esbuild-plugin-replace';

const watch = process.env.WATCH;
const debug = process.env.DEBUG;
const sourcemap = Boolean(process.env.SOURCEMAP);
const dts = process.env.DTS === 'false' ? false : true;

export const baseTsup = (pkg, deleteGlobalName = false): Options => {
  const options: Options = {
    dts,
    sourcemap,
    clean: true,
    watch: watch ? 'src/' : false,
    // Cannot output iife format using wireit cache
    format: ['esm', 'cjs'],
    legacyOutput: true,
    globalName: pkg.name
      .replace(/@/g, '')
      .split(/[\/-]/g)
      .map((l) => l[0].toUpperCase() + l.slice(1))
      .join(''),
    esbuildPlugins: [
      replace({
        include: /.(ts|js)$/,
        __TEST__: 'false',
        __VERSION__: `'${pkg.version}'`,
        __DEV__:
          '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
      }),
    ],
  };

  // Can be directly by chrome plugins debugging injected garfish page
  if (deleteGlobalName) {
    delete options.globalName;
  }
  return options;
};

import pkg from './package.json';
import { baseTsup } from '../../tsup.config';

const commonConfig = baseTsup(pkg);

commonConfig.format = ['cjs', 'esm'];

export const tsup = commonConfig;

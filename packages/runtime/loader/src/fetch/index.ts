import { nodeFetch } from './nodeFetch';
import { browserFetch } from './browserFetch';

// eslint-disable-next-line no-restricted-globals
const isNodeEnv = typeof module === 'object' && typeof exports === 'object';

export function fetch(url: string, options: RequestInit = {}) {
  return isNodeEnv ? nodeFetch(url, options) : browserFetch(url, options);
}

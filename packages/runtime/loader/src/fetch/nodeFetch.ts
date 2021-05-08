/* eslint-disable no-restricted-globals */
import { assert } from '@garfish/utils';

// https://github.com/node-fetch/node-fetch
const createRequest = (url: string, opts: RequestInit) => {
  const parsedURL = new URL(url);
  const signal = opts.signal;
  const headers = opts.headers || {};
  const redirect = opts.redirect || 'follow';
  const method = (opts.method || 'GET').toUpperCase();
  assert(method === 'GET', 'Only support GET method'); // 只处理 get
  assert(!opts.body, 'Request with GET method cannot have body');

  return {
    method,
    signal,
    headers,
    redirect,
    parsedURL,
    clone: () => createRequest(url, opts),
    get url() {
      return require('url').format(parsedURL);
    },
  };
};

const processNodeRequestOptions = (request) => {
  const parsedURL = request.parsedURL;
};

// 这是简化版的 fetch，只提供给 loader 使用
export function nodeFetch(_url: string, _opts: RequestInit) {}

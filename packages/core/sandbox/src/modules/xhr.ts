import { transformUrl, rawXMLHttpRequest } from '@garfish/utils';
import { Sandbox } from '../context';

// 处理 hmr ho-update.json 跨域需要代理的问题
export function XMLHttpRequestOverride(sandbox: Sandbox) {
  const baseUrl = sandbox.options.baseUrl;
  return {
    recover: () => {},
    override: {
      XMLHttpRequest: baseUrl
        ? function () {
            const res = new rawXMLHttpRequest();
            const nativeOpen = res.open;

            res.open = function () {
              const path = arguments[1];
              const method = arguments[0]?.toLowerCase();

              // hot-update.js 已经在动态 js 那儿处理了
              if (
                method === 'get' &&
                typeof path === 'string' &&
                path.endsWith('hot-update.json')
              ) {
                arguments[1] = transformUrl(baseUrl, path);
              }
              return nativeOpen.apply(this, arguments);
            };
            return res;
          }
        : rawXMLHttpRequest,
    },
  };
}

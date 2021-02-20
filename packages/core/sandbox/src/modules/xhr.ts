import { transformUrl } from '@garfish/utils';
import { Sandbox } from '../context';

// 处理热更新时 ho-update.json 跨域需要代理的问题
export function XMLHttpRequestOverride(sandbox: Sandbox) {
  let override;
  const baseUrl = sandbox.options.baseUrl;

  if (typeof baseUrl === 'string') {
    override = function () {
      const result = new XMLHttpRequest();
      const nativeOpenMethod = result.open;

      result.open = function () {
        const path = arguments[1];
        const isHotJson =
          typeof path === 'string' && path.endsWith('hot-update.json');

        if (isHotJson && arguments[0]?.toLowerCase() === 'get') {
          arguments[1] = transformUrl(baseUrl, path);
        }
        return nativeOpenMethod.apply(this, arguments);
      };
      return result;
    };
  }

  return {
    override: {
      XMLHttpRequest: override || XMLHttpRequest,
    },
  };
}

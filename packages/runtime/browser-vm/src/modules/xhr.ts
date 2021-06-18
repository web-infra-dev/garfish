import { transformUrl } from '@garfish/utils';
import { Sandbox } from '../sandbox';

// When dealing with hot updates, "ho-update.json" requires a proxy across domains
export function XMLHttpRequestModule(sandbox: Sandbox) {
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

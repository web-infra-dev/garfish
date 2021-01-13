import { hasOwn, rawDocument } from '@garfish/utils';
import { Sandbox } from '../context';
import { bind, PROXY_NODE } from '../utils/index';
import { rootElm, createFakeObject } from '../utils/sandbox';

export const documentOverride = (sandbox: Sandbox) => {
  const proxyDocument = new Proxy(createFakeObject(rawDocument), {
    get(target: any, p: PropertyKey) {
      const cur = hasOwn(target, p) ? target[p] : rawDocument[p];

      if (p === 'head') {
        return rootElm(sandbox);
      } else if (p === 'createElement') {
        return function (tagName, options) {
          const el = document.createElement(tagName, options);
          el.GARFISH_SANDBOX = sandbox;
          return el;
        };
      }
      // else if (p === 'body') {
      // const rootEl = rootElm(sandbox)
      // return sandbox.options.proxyBody && rootEl
      //     ? rootEl
      //     : rawDocument.body;
      // }

      if (typeof cur === 'function') {
        return typeof cur.bind === 'function'
          ? cur.bind(rawDocument)
          : bind(cur, rawDocument);
      }
      return cur;
    },

    set(target: any, p: PropertyKey, value: unknown) {
      target[p] = value;
      return true;
    },
  });

  proxyDocument[PROXY_NODE] = rawDocument;

  return {
    override: {
      document: proxyDocument,
    },
  };
};

import { Sandbox } from '../sandbox';
import { __proxyNode__ } from '../symbolTypes';
import { createFakeObject, microTaskHtmlProxyDocument } from '../utils';
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
} from '../proxyInterceptor/document';

export const documentModule = (sandbox: Sandbox) => {
  let proxyDocument = Object.create(document);
  const getter = createGetter(sandbox);

  const fakeDocument = createFakeObject(document);

  const fakeDocumentProto = new Proxy(fakeDocument, {
    get: (...args) => {
      microTaskHtmlProxyDocument(proxyDocument);
      return getter(...args);
    },
    has: createHas(),
  });

  proxyDocument = new Proxy(
    Object.create(fakeDocumentProto, {
      currentScript: {
        value: null,
        writable: true,
      },
      documentElement: {
        value: null,
        writable: true,
      },
      [__proxyNode__]: {
        writable: false,
        configurable: false,
        value: document,
      },
    }),
    {
      set: createSetter(sandbox),
      defineProperty: createDefineProperty(),
      getPrototypeOf() {
        return HTMLDocument.prototype || Document.prototype;
      },
    },
  );

  return {
    override: {
      document: proxyDocument,
    },
  };
};

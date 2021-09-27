import { Sandbox } from '../sandbox';
import { __proxyNode__ } from '../symbolTypes';
import { createFakeObject, microTaskHtmlProxyDocument } from '../utils';
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
} from '../proxyInterceptor/document';

const rawDocumentCtor = Document;
export const documentModule = (sandbox: Sandbox) => {
  // eslint-disable-next-line
  let proxyDocument;
  const fakeDocument = createFakeObject(document);
  const getter = createGetter(sandbox);

  const fakeDocumentProto = new Proxy(fakeDocument, {
    get: (...args) => {
      microTaskHtmlProxyDocument(proxyDocument);
      return getter(...args);
    },
    has: createHas(),
  });

  const fakeDocumentCtor = function Document() {
    if (!(this instanceof fakeDocumentCtor)) {
      throw new TypeError(
        // eslint-disable-next-line quotes
        "Failed to construct 'Document': Please use the 'new' operator.",
      );
    }
    const docInstance = new rawDocumentCtor();
    // If you inherit fakeDocumentProto,
    // you will get the properties and methods on the original document, which do not meet expectations
    Object.setPrototypeOf(docInstance, fakeDocument);
    return docInstance;
  };

  fakeDocumentCtor.prototype = fakeDocumentProto;
  fakeDocumentCtor.prototype.constructor = fakeDocumentCtor;

  if (Symbol.hasInstance) {
    Object.defineProperty(fakeDocumentCtor, Symbol.hasInstance, {
      configurable: true,
      value(value) {
        let proto = value;
        if (proto === document) return true;
        while ((proto = Object.getPrototypeOf(proto))) {
          if (proto === fakeDocumentProto) {
            return true;
          }
        }
        const cloned = function () {};
        cloned.prototype = fakeDocument;
        return value instanceof cloned;
      },
    });
  }

  proxyDocument = new Proxy(
    Object.create(fakeDocumentProto, {
      currentScript: {
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
    },
  );

  return {
    override: {
      document: proxyDocument,
      Document: fakeDocumentCtor,
    },
  };
};

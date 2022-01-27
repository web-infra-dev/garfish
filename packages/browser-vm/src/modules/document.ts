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
const rawHTMLDocumentCtor = HTMLDocument;

export const documentModule = (sandbox: Sandbox) => {
  let proxyDocument = {};
  const getter = createGetter(sandbox);

  const fakeDocument = createFakeObject(document);
  const fakeHTMLDocument = Object.create(fakeDocument);

  const fakeDocumentProto = new Proxy(fakeDocument, {
    get: (...args) => {
      microTaskHtmlProxyDocument(proxyDocument);
      return getter(...args);
    },
    has: createHas(),
  });
  const fakeHTMLDocumentProto = Object.create(fakeDocumentProto);

  const fakeDocumentCtor = function Document(this: Document) {
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

  const fakeHTMLDocumentCtor = function HTMLDocument(this: HTMLDocument) {
    if (!(this instanceof fakeHTMLDocumentCtor)) {
      throw new TypeError(
        // eslint-disable-next-line quotes
        "Failed to construct 'HTMLDocument': Please use the 'new' operator.",
      );
    }
    const docInstance = new rawHTMLDocumentCtor();
    // If you inherit fakeHTMLDocumentCtor,
    // you will get the properties and methods on the original document, which do not meet expectations
    Object.setPrototypeOf(docInstance, fakeHTMLDocument);
    return docInstance;
  };

  fakeDocumentCtor.prototype = fakeDocumentProto;
  fakeDocumentCtor.prototype.constructor = fakeDocumentCtor;
  fakeHTMLDocumentCtor.prototype = fakeHTMLDocumentProto;
  fakeHTMLDocumentCtor.prototype.constructor = fakeHTMLDocumentCtor;

  if (Symbol.hasInstance) {
    const getHasInstanceCheckFn = (fakeProto, fakeDocument) => {
      return (value) => {
        let proto = value;
        if (proto === document) return true;
        while ((proto = Object.getPrototypeOf(proto))) {
          if (proto === fakeProto) {
            return true;
          }
        }
        const cloned = function () {};
        cloned.prototype = fakeDocument;
        return value instanceof cloned;
      };
    };

    Object.defineProperty(fakeDocumentCtor, Symbol.hasInstance, {
      configurable: true,
      value: getHasInstanceCheckFn(fakeDocumentProto, fakeDocument),
    });

    Object.defineProperty(fakeHTMLDocumentCtor, Symbol.hasInstance, {
      configurable: true,
      value: getHasInstanceCheckFn(fakeHTMLDocumentProto, fakeHTMLDocument),
    });
  }

  proxyDocument = new Proxy(
    Object.create(fakeHTMLDocumentProto, {
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
      HTMLDocument: fakeHTMLDocumentCtor,
    },
  };
};

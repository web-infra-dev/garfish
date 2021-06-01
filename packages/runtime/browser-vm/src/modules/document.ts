import {
  hasOwn,
  makeMap,
  isObject,
  rawObject,
  findTarget,
  rawDocument,
  rawDocumentCtor,
  rawObjectDefineProperty,
} from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { __proxyNode__, __documentBind__ } from '../symbolTypes';
import {
  bind,
  rootElm,
  createFakeObject,
  verifyDescriptor,
  verifySetDescriptor,
  microTaskHtmlProxyDocument,
} from '../utils';

const queryFunctions = makeMap([
  'querySelector',
  'querySelectorAll',
  'getElementById',
  'getElementsByTagName',
  'getElementsByTagNameNS',
  'getElementsByClassName',
]);

export const documentOverride = (sandbox: Sandbox) => {
  const fakeDocument = createFakeObject(rawDocument);
  const strictIsolation = sandbox.options.strictIsolation;
  // eslint-disable-next-line
  let proxyDocument;
  const fakeDocumentProto = new Proxy(fakeDocument, {
    get(target: any, p: PropertyKey, receiver?: any) {
      microTaskHtmlProxyDocument(proxyDocument);

      const rootEl = rootElm(sandbox);
      const value = hasOwn(target, p)
        ? Reflect.get(target, p, receiver)
        : Reflect.get(rawDocument, p); // 同 window proxy.get

      if (rootEl) {
        if (p === 'createElement') {
          return function (tagName, options) {
            const el = value.call(rawDocument, tagName, options);
            if (isObject(el)) {
              Object.defineProperty(el, 'GARFISH_SANDBOX', {
                configurable: true,
                enumerable: false,
                value: sandbox,
              });
            }
            return el;
          };
        }

        if (strictIsolation) {
          if (p === 'head') {
            return findTarget(rootEl, ['head', 'div[__GarfishMockHead__]']);
          }
          if (p === 'body') {
            return findTarget(rootEl, ['body', 'div[__GarfishMockBody__]']);
          }
          if (queryFunctions(p)) {
            return p === 'getElementById'
              ? (id) => rootEl.querySelector(`#${id}`)
              : rootEl[p].bind(rootEl);
          }
        }
      }

      if (typeof value === 'function') {
        let newValue = hasOwn(value, __documentBind__)
          ? value[__documentBind__]
          : null;

        if (!newValue) {
          newValue =
            typeof value.bind === 'function'
              ? value.bind(rawDocument)
              : bind(value, rawDocument);
        }

        const verifyResult = verifyDescriptor(target, p, newValue);

        if (verifyResult > 0) {
          if (verifyResult === 1) return value;
          if (verifyResult === 2) return undefined;
        }
        value[__documentBind__] = newValue;
        return newValue;
      }

      return value;
    },
  });

  const fakeDocumentCtor = function Document() {
    if (!(this instanceof fakeDocumentCtor)) {
      throw new TypeError(
        // eslint-disable-next-line quotes
        "Failed to construct 'Document': Please use the 'new' operator.",
      );
    }
    const docInstance = new rawDocumentCtor();
    // 如果继承 fakeDocumentProto，将会得到 rawDocument 上的属性和方法，不符合预期
    rawObject.setPrototypeOf(docInstance, fakeDocument);
    return docInstance;
  };

  fakeDocumentCtor.prototype = fakeDocumentProto;
  fakeDocumentCtor.prototype.constructor = fakeDocumentCtor;

  if (Symbol.hasInstance) {
    rawObjectDefineProperty(fakeDocumentCtor, Symbol.hasInstance, {
      configurable: true,
      value(value) {
        let proto = value;
        if (proto === rawDocument) return true;
        while ((proto = rawObject.getPrototypeOf(proto))) {
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
      // 内置的一些属性
      currentScript: {
        value: null,
        writable: true,
      },
      [__proxyNode__]: {
        writable: false,
        configurable: false,
        value: rawDocument,
      },
    }),
    {
      // document.cookie 不做隔离
      set(target: any, p: PropertyKey, value: any, receiver: any) {
        const rawDocumentKey = ['title', 'cookie'];
        const verifyResult = verifySetDescriptor(
          // prettier-ignore
          typeof p === 'string' && rawDocumentKey.indexOf(p) !== -1
            ? rawDocument
            : receiver
              ? receiver
              : target,
          p,
          value,
        );

        // 值相同，直接返回设置成功。不可设置直接返回失败，在safari里面Reflect.set默认没有进行这部分处理
        if (verifyResult > 0) {
          if (verifyResult === 1 || verifyResult === 2) return false;
          if (verifyResult === 3) return true;
        }

        return typeof p === 'string' && rawDocumentKey.indexOf(p) !== -1
          ? Reflect.set(rawDocument, p, value)
          : Reflect.set(target, p, value, receiver);
      },

      defineProperty: (
        target: any,
        p: PropertyKey,
        descriptor: PropertyDescriptor,
      ) => {
        return p === 'cookie'
          ? Reflect.defineProperty(rawDocument, p, descriptor)
          : Reflect.defineProperty(target, p, descriptor);
      },
    },
  );

  return {
    override: {
      Document: fakeDocumentCtor,
      document: proxyDocument,
    },
  };
};

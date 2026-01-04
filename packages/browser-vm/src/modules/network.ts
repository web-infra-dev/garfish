import {
  hasOwn,
  isPromise,
  isAbsolute,
  transformUrl,
  toWsProtocol,
} from '@garfish/utils';
import { Sandbox } from '../sandbox';

export function networkModule(sandbox: Sandbox) {
  const baseUrl = sandbox.options.baseUrl;
  const wsSet = new Set<fakeWebSocket>();
  const xhrSet = new Set<fakeXMLHttpRequest>();
  const fetchSet = new Set<AbortController>();
  const needFix = (url) =>
    sandbox.options.fixBaseUrl &&
    baseUrl &&
    typeof url === 'string' &&
    !isAbsolute(url);
  class fakeXMLHttpRequest extends XMLHttpRequest {
    constructor() {
      super();
      if (!sandbox.options.disableCollect) {
        xhrSet.add(this);
        this.addEventListener('loadend', () => {
          xhrSet.delete(this);
        }, { once: true });
      }
    }

    open() {
      // sync request
      if (arguments[2] === false) {
        xhrSet.delete(this);
      }
      if (needFix(arguments[1])) {
        arguments[1] = baseUrl
          ? transformUrl(baseUrl, arguments[1])
          : arguments[1];
      }

      const url = arguments[1];

      if (sandbox.options.addSourceList) {
        sandbox.options.addSourceList({
          tagName: 'xmlhttprequest',
          url,
        });
      }
      return super.open.apply(this, arguments);
    }

    abort() {
      xhrSet.delete(this);
      return super.abort.apply(this, arguments);
    }

    send() {
      return super.send.apply(this, arguments);
    }
  }

  class fakeWebSocket extends WebSocket {
    constructor(url, protocols?: string | string[]) {
      if (needFix(url) && baseUrl) {
        const baseWsUrl = toWsProtocol(baseUrl);
        url = transformUrl(baseWsUrl, arguments[1]);
      }
      super(url, protocols);
      if (!sandbox.options.disableCollect) {
        wsSet.add(this);
      }
    }

    close() {
      wsSet.delete(this);
      return super.close.apply(this, arguments);
    }
  }

  // `fetch` is not constructor
  const fakeFetch = (input, options: RequestInit = {}) => {
    if (needFix(input) && baseUrl) {
      input = transformUrl(baseUrl, input);
    }
    if (sandbox.options.addSourceList) {
      sandbox.options.addSourceList({
        tagName: 'fetch',
        url: input,
      });
    }
    let controller;
    if (!(input instanceof Request) && !hasOwn(options, 'signal') && window.AbortController) {
      controller = new window.AbortController();
      if (!sandbox.options.disableCollect) {
        fetchSet.add(controller);
      }
      options.signal = controller.signal;
    }
    const result = window.fetch(input, options);
    return controller && isPromise(result)
      ? result.finally(() => fetchSet.delete(controller))
      : result;
  };

  return {
    override: {
      WebSocket: fakeWebSocket as any,
      XMLHttpRequest: fakeXMLHttpRequest as any,
      fetch: fakeFetch,
    },

    recover() {
      wsSet.forEach((ws) => {
        if (typeof ws.close === 'function') ws.close();
      });
      xhrSet.forEach((xhr) => {
        if (typeof xhr.abort === 'function') xhr.abort();
      });
      fetchSet.forEach((ctor) => {
        if (typeof ctor.abort === 'function') ctor.abort();
      });

      wsSet.clear();
      xhrSet.clear();
      fetchSet.clear();
    },
  };
}

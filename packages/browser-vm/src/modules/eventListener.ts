// import { filterAndWrapEventListener } from '@garfish/utils';
import { hasOwn } from '@garfish/utils';
import { Sandbox } from '../sandbox';

type Opts = boolean | AddEventListenerOptions;
type Listener = EventListenerOrEventListenerObject;

export function listenerModule(_sandbox: Sandbox) {
  const listeners = new Map<
    string,
    {
      listener: Listener;
      target: Window | Document;
      options: undefined | Opts;
    }[]
  >();
  const rawAddEventListener = window.addEventListener;
  const rawRemoveEventListener = window.removeEventListener;

  function addListener(
    this: any,
    type: string,
    listener: Listener,
    options?: Opts,
  ) {
    const curListeners = listeners.get(type) || [];
    listeners.set(type, [
      ...curListeners,
      {
        listener,
        target: this,
        options,
      },
    ]);

    // This has been revised
    rawAddEventListener.call(
      this,
      type,
      // filterAndWrapEventListener(
      //   type,
      //   listener,
      //   _sandbox.options.sourceList.map((item) => item.url),
      // ),
      listener,
      options,
    );
  }

  function removeListener(
    this: any,
    type: string,
    listener: Listener,
    options?: boolean | EventListenerOptions,
  ) {
    const curListeners = listeners.get(type) || [];
    const idx = curListeners.findIndex((item) => item.listener === listener);
    if (idx !== -1) {
      curListeners.splice(idx, 1);
    }
    listeners.set(type, [...curListeners]);
    rawRemoveEventListener.call(this, type, listener, options);
  }

  const proxyDocumentElmeent = new Proxy(document.documentElement, {
    get(target, p, receiver) {
      if (p === 'addEventListener') return addListener.bind(document);
      return hasOwn(target, p)
        ? Reflect.get(target, p, receiver)
        : Reflect.get(target, p);
    },
    getPrototypeOf() {
      return Object.getPrototypeOf(document.documentElement);
    },
  });

  const recover = () => {
    listeners.forEach((listener, key) => {
      listener.forEach((item) => {
        rawRemoveEventListener.call(
          item.target,
          key,
          item.listener,
          item.options,
        );
      });
    });
    listeners.clear();
  };

  return {
    recover,
    override: {
      addEventListener: addListener.bind(window),
      removeEventListener: removeListener.bind(window),
    },
    created(global: Sandbox['global']) {
      const fakeDocument = global?.document;
      if (fakeDocument) {
        fakeDocument.addEventListener = addListener.bind(document);
        fakeDocument.removeEventListener = removeListener.bind(document);
        (fakeDocument as any).documentElement = proxyDocumentElmeent;
      }
    },
  };
}

// tslint:disable
let rawAddEventListener: any;
let rawRemoveEventListener: any;

export class PatchEvent {
  private listenerMap = new Map<string, EventListenerOrEventListenerObject[]>();
  constructor() {}

  public activate() {
    if (!rawAddEventListener || !rawRemoveEventListener) {
      rawAddEventListener = window.addEventListener;
      rawRemoveEventListener = window.removeEventListener;
    }

    window.addEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      const listeners = this.listenerMap.get(type) || [];
      this.listenerMap.set(type, [...listeners, listener]);
      return rawAddEventListener.call(window, type, listener, options);
    };
    window.removeEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      const storedTypeListeners = this.listenerMap.get(type);
      if (
        storedTypeListeners &&
        storedTypeListeners.length &&
        storedTypeListeners.indexOf(listener) !== -1
      ) {
        storedTypeListeners.splice(storedTypeListeners.indexOf(listener), 1);
      }
      return rawRemoveEventListener.call(window, type, listener, options);
    };
  }

  public deactivate() {
    this.listenerMap.forEach((listeners, type) =>
      [...listeners].forEach((listener) =>
        window.removeEventListener(type, listener),
      ),
    );
    // event，在window原型链上，将window上覆盖的代理事件删除即可
    // delete window.removeEventListener;
    // delete window.addEventListener;
    window.removeEventListener = rawRemoveEventListener;
    window.addEventListener = rawAddEventListener;
  }
}

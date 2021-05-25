// copy from https://github.com/webmodules/custom-event

const NativeCustomEvent = (global as any)?.CustomEvent;

function useNative() {
  try {
    const p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return 'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {}
  return false;
}

let CustomEvent: any;

if (useNative()) {
  CustomEvent = NativeCustomEvent;
} else if (
  'undefined' !== typeof document &&
  'function' === typeof document.createEvent
) {
  // IE >= 9
  CustomEvent = function (type, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      type,
      params.bubbles || false,
      params.cancelable || false,
      params.detail || null,
    );
    return evt;
  };
} else {
  // IE <= 8
  CustomEvent = function (type, params) {
    const e = (document as any).createEventObject();
    e.type = type;
    if (params) {
      e.bubbles = Boolean(params.bubbles);
      e.cancelable = Boolean(params.cancelable);
      e.detail = params.detail;
    } else {
      e.bubbles = false;
      e.cancelable = false;
      e.detail = void 0;
    }
    return e;
  };
}

export default CustomEvent;

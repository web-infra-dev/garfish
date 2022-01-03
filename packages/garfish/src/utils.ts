export const PROTOTYPE = 'prototype';

export const {
  defineProperty,
  defineProperties,
  entries,
  assign,
  keys,
  getOwnPropertyDescriptor,
} = Object;

export const {
  // EventTarget
  addEventListener,
  // Node
  appendChild,
  insertBefore,
  replaceChild,
  // ParentNode
  append,
  prepend,
  replaceChildren,
  // ChildNode
  after,
  before,
  replaceWith,
} = HTMLElement[PROTOTYPE];

export function addEventListenerTo(target: EventTarget, ...args: unknown[]) {
  addEventListener.apply(target, args);
}

export function appendChildTo<T extends Node>(node: Node, newChild: T): T {
  return appendChild.call(node, newChild);
}

export function appendTo(node: Node, ...args: (string | Node)[]) {
  append.apply(node, args);
}

export function error(error: string | Error) {
  processError(error, (e, isString) => {
    if (isString) {
      throw new Error(e as string);
    } else {
      throw e;
    }
  });
}

export const SCRIPT_TYPES = ['', 'text/javascript', 'module'];

export function assert(condition: any, msg?: string | Error) {
  if (!condition) {
    error(msg || 'unknow reason');
  }
}

const warnPrefix = '[Garfish warning]';

const processError = (
  error: string | Error,
  fn: (val: string | Error, isString: boolean) => void,
) => {
  try {
    if (typeof error === 'string') {
      error = `${warnPrefix}: ${error}\n\n`;
      fn(error, true);
    } else if (error instanceof Error) {
      if (!error.message.startsWith(warnPrefix)) {
        error.message = `${warnPrefix}: ${error.message}`;
      }
      fn(error, false);
    }
  } catch (e) {
    fn(error, typeof error === 'string');
  }
};

function waitElementReady(selector, callback) {
  const elem = document.querySelector(selector);

  if (elem !== null) {
    callback(elem);
    return;
  }

  setTimeout(function () {
    waitElementReady(selector, callback);
  }, 200);
}

function delay(duration) {
  return new Promise(function (resolve) {
    setTimeout(resolve, duration);
  });
}

function waitElement(selector, timeout = 3000) {
  const waitPromise = new Promise(function (resolve) {
    waitElementReady(selector, function (elem: Element) {
      return resolve(elem);
    });
  });
  return Promise.race([delay(timeout), waitPromise]);
}

export async function getRenderNode(domGetter: string | (() => Element)) {
  assert(domGetter, `Invalid domGetter:\n ${domGetter}.`);

  let appWrapperNode;

  if (typeof domGetter === 'string') {
    appWrapperNode = (await waitElement(domGetter)) as
      | Element
      | null
      | undefined;
  } else if (typeof domGetter === 'function') {
    appWrapperNode = await Promise.resolve(domGetter());
  }
  assert(appWrapperNode instanceof Element, `Invalid domGetter: ${domGetter}`);
  return appWrapperNode as Element;
}

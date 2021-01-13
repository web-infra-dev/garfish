// 保存一些原始的属性
export const rawWindow = window;

export const rawObject = Object;

export const rawDocument = document;

export const rawSetTimeout = rawWindow.setTimeout;

export const rawClearTimeout = rawWindow.clearTimeout;

export const rawSetInterval = rawWindow.setInterval;

export const rawClearInterval = rawWindow.clearInterval;

export const rawLocalstorage = rawWindow.localStorage;

export const rawSessionStorage = rawWindow.sessionStorage;

export const rawXMLHttpRequest = rawWindow.XMLHttpRequest;

export const rawObjectKeys = rawObject.keys;

export const rawObjectCreate = rawObject.create;

export const rawObjectIsExtensible = rawObject.isExtensible;

export const rawObjectDefineProperty = rawObject.defineProperty;

export const rawObjectGetOwnPropertyDescriptor =
  rawObject.getOwnPropertyDescriptor;

export const rawAddEventListener = window.addEventListener;

export const rawRemoveEventListener = window.removeEventListener;

export const rawMutationObserver = window.MutationObserver;

export const rawObserver = rawMutationObserver.prototype.observe;

export const rawAppendChild = HTMLElement.prototype.appendChild;

export const rawRemoveChild = HTMLElement.prototype.removeChild;

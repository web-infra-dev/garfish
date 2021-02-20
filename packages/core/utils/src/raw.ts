// 保存一些原始的属性
export const rawWindow = window;
export const rawDocument = document;
export const rawDocumentCtor = Document;

export const rawSetTimeout = rawWindow.setTimeout;
export const rawSetInterval = rawWindow.setInterval;
export const rawClearTimeout = rawWindow.clearTimeout;
export const rawClearInterval = rawWindow.clearInterval;

export const rawLocalstorage = rawWindow.localStorage;
export const rawSessionStorage = rawWindow.sessionStorage;

export const rawAddEventListener = window.addEventListener;
export const rawRemoveEventListener = window.removeEventListener;

export const rawMutationObserver = window.MutationObserver;
export const rawObserver = rawMutationObserver.prototype.observe;

export const rawAppendChild = HTMLElement.prototype.appendChild;
export const rawRemoveChild = HTMLElement.prototype.removeChild;

export const rawObject = Object;
export const rawObjectKeys = rawObject.keys;
export const rawObjectCreate = rawObject.create;
export const rawObjectDefineProperty = rawObject.defineProperty;
export const rawObjectGetOwnPropertyDescriptor =
  rawObject.getOwnPropertyDescriptor;

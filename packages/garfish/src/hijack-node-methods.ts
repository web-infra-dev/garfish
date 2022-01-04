// import { defineProperties, defineProperty, entries, getOwnPropertyDescriptor, keys, PROTOTYPE } from "./utils";

// const methodsOfEventTargetProto = getObjectMethods(EventTarget[PROTOTYPE]);
// const methodsOfNodeProto = getObjectMethods(Node[PROTOTYPE]);
// const methodsOfParentNodeProto = getObjectMethods(DocumentFragment[PROTOTYPE]);
// const methodsOfDocument = methodsOfParentNodeProto.concat(methodsOfNodeProto, methodsOfEventTargetProto);
// const methodsOfDocumentOrShadowRoot = [
//     'caretPositionFromPoint', 'elementFromPoint', 'elementsFromPoint',
//     'getAnimations', 'getSelection', 'nodeFromPoint', 'nodesFromPoint'
// ];
// const propsOfDocumentOrShadowRoot = [
//     'activeElement', 'fullscreenElement', 'pictureInPictureElement', 'pointerLockElement', 'styleSheets'
// ];

// function getObjectMethods(obj: object): string[] {
//   const methods: string[] = [];
//   for (const key of keys(obj)) {
//       const desc = getOwnPropertyDescriptor(obj, key);
//       if (typeof desc.value === 'function') {
//           methods.push(key);
//       }
//   }
//   return methods;
// }

// export function hijackNodeMethodsOfIframe(contentWindow: Window) {
//   hijackElement(contentWindow);
//   hijackDocument(contentWindow);
//   hijackWindow(contentWindow);
// }

// const eventPropsOfWindow = Object.keys(window).filter(key => key.startsWith('on'))
// const eventPropsOfHTMLElement = Object.keys(HTMLElement.prototype).filter(key => key.startsWith('on'))
// const uniqueEventsOfWindow = eventPropsOfWindow.filter(key => !eventPropsOfHTMLElement.includes(key))

// function hijackElement({ HTMLElement }: Window) {
//   for (const [key, method] of entries(alternativeMethods)) {
//       HTMLElement[PROTOTYPE][key] = method;
//   }
//   // Hijack property 'ownerDocument'
//   const desc = Object.getOwnPropertyDescriptor(Node[PROTOTYPE], 'ownerDocument')
//   desc.enumerable = false
//   defineProperties(HTMLElement[PROTOTYPE], {
//       _rawOwnerDoc: desc,
//       ownerDocument: {
//           get() {
//               const root = <MicroAppRoot> this.getRootNode()
//               const isMicroApp = root?.host?.tagName === EL_TAG_NAME
//               return isMicroApp ? root.frameElement.contentDocument : this._rawOwnerDoc
//           },
//       },
//   })
// }

// const commonDesc = {
//   configurable: true,
//   enumerable: false,
//   writable: true,
// };

// function hijackDocument({ document, mRoot }: Window) {
//   for (const key of methodsOfDocument) {
//       defineProperty(document, key, {
//           ...commonDesc,
//           value: (...args) => mRoot[key](...args),
//       });
//   }
//   for (const key of methodsOfDocumentOrShadowRoot) {
//       if (key in document && key in mRoot) {
//           defineProperty(document, key, {
//               ...commonDesc,
//               value: (...args) => mRoot[key](...args),
//           });
//       }
//   }
//   for (const key of propsOfDocumentOrShadowRoot) {
//       if (key in document && key in mRoot) {
//           defineProperty(document, key, {
//               enumerable: true,
//               get: () => mRoot[key],
//               set: val => mRoot[key] = val,
//           });
//       }
//   }
//   defineProperties(document, {
//       getElementById: {
//           ...commonDesc,
//           value: (id: string) => mRoot.querySelector(`#${id}`),
//       },
//       getElementsByClassName: {
//           ...commonDesc,
//           value(names: string) {
//               const selector = names.split(/\s+/).map(name => `.${name}`).join('');
//               return mRoot.querySelectorAll(selector);
//           },
//       },
//       getElementsByName: {
//           ...commonDesc,
//           value: (name: string) => mRoot.querySelectorAll(`[name=${name}]`),
//       },
//       getElementsByTagName: {
//           ...commonDesc,
//           value: (name: string) => mRoot.querySelectorAll(name),
//       },
//       documentElement: {
//           enumerable: true,
//           get: () => mRoot.documentElement,
//       },
//       __documentElement: {
//           value: document.documentElement,
//       },
//       head: {
//           enumerable: true,
//           get: () => mRoot.head,
//       },
//       body: {
//           enumerable: true,
//           get: () => mRoot.body,
//       },
//       exitFullscreen: {
//           value: () => document.exitFullscreen(),
//       },
//       addEventListener: {
//           // @ts-ignore: refactor later
//           value: (...args) => mRoot.document.addEventListener(...args)
//       },
//       removeEventListener: {
//           // @ts-ignore: refactor later
//           value: (...args) => mRoot.document.removeEventListener(...args)
//       },
//   });
// }

// function hijackWindow(contentWindow: Window) {
//   contentWindow.getComputedStyle = (el: Element, ...args) => {
//       // @ts-ignore: return the style of MicroAppElement when el is a MicroAppRoot
//       return el?.host?.tagName === EL_TAG_NAME ? el.host.style : getComputedStyle(el, ...args);
//   };

//   // requestAnimationFrame() calls are paused in most browsers when running in hidden <iframe>s
//   // in order to improve performance and battery life.
//   contentWindow.requestAnimationFrame = (callback: FrameRequestCallback) => requestAnimationFrame(callback);
//   contentWindow.cancelAnimationFrame = (handle: number) => cancelAnimationFrame(handle);

//   contentWindow.getSelection = () => getSelection();

//   // FIXME: 只代理部分事件至 ShadowRoot
//   const {
//       mRoot,
//       addEventListener,
//       removeEventListener,
//       dispatchEvent,
//   } = contentWindow
//   contentWindow.addEventListener = (type, ...args) => {
//       if (uniqueEventsOfWindow.includes(type)) {
//           addEventListener(type, ...<[any]>args)
//       } else {
//           mRoot.addEventListener(type, ...<[any]>args)
//       }
//   }
//   contentWindow.removeEventListener = (type, ...args) => {
//       if (uniqueEventsOfWindow.includes(type)) {
//           removeEventListener(type, ...<[any]>args)
//       } else {
//           mRoot.removeEventListener(type, ...<[any]>args)
//       }
//   }
//   contentWindow.dispatchEvent = event => {
//       return uniqueEventsOfWindow.includes(event?.type)
//           ? dispatchEvent(event)
//           : mRoot.dispatchEvent(event)
//   }
// }

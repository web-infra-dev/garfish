(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory((global.Shared = {})));
})(this, function (exports) {
  'use strict';

  // 保存一些原始的属性
  var rawWindow = window;
  var rawDocument = document;
  var rawDocumentCtor = Document;
  var rawSetTimeout = rawWindow.setTimeout;
  var rawSetInterval = rawWindow.setInterval;
  var rawClearTimeout = rawWindow.clearTimeout;
  var rawClearInterval = rawWindow.clearInterval;
  var rawLocalstorage = rawWindow.localStorage;
  var rawSessionStorage = rawWindow.sessionStorage;
  var rawAddEventListener = window.addEventListener;
  var rawRemoveEventListener = window.removeEventListener;
  var rawMutationObserver = window.MutationObserver;
  var rawObserver = rawMutationObserver.prototype.observe;
  var rawAppendChild = HTMLElement.prototype.appendChild;
  var rawRemoveChild = HTMLElement.prototype.removeChild;
  var rawObject = Object;
  var rawObjectKeys = rawObject.keys;
  var rawObjectCreate = rawObject.create;
  var rawObjectDefineProperty = rawObject.defineProperty;
  var rawObjectGetOwnPropertyDescriptor = rawObject.getOwnPropertyDescriptor;

  var noop = function () {};
  function createKey() {
    return Math.random().toString(36).substr(2, 8);
  }
  function isObject(val) {
    return val && typeof val === 'object';
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
  }
  function def(obj, key, value) {
    Object.defineProperty(obj, key, {
      get: function () {
        return value;
      },
      set: function (val) {
        {
          if (val !== value) {
            error('Try to modify a read-only property ' + key);
          }
        }
      },
      // 测试环境允许 delete
      configurable: true,
    });
  }
  // 数组变为对象 `['a'] => { a: true }`
  function makeMap(list) {
    var map = Object.create(null);
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return function (val) {
      return map[val];
    };
  }
  var warnPrefix = '[Garfish warning]';
  var processError = function (error, fn) {
    if (typeof error === 'string') {
      error = warnPrefix + ': ' + error + '\n\n';
      fn(error, true);
    } else if (error instanceof Error) {
      if (!error.message.startsWith(warnPrefix)) {
        error.message = warnPrefix + ': ' + error.message;
      }
      fn(error, false);
    }
  };
  function warn(msg) {
    processError(msg, function (e, isString) {
      var warnMsg = isString ? e : e.message;
      console.warn(warnMsg);
    });
  }
  function error(error) {
    processError(error, function (e, isString) {
      if (isString) {
        throw new Error(e);
      } else {
        throw e;
      }
    });
  }
  function assert(condition, msg) {
    if (!condition) {
      error(msg || 'unknow reason');
    }
  }
  function toBoolean(val) {
    return val === 'false' ? false : Boolean(val);
  }
  function remove(list, el) {
    if (Array.isArray(list)) {
      var i = list.indexOf(el);
      if (i > -1) {
        list.splice(i, 1);
      }
    } else {
      if (list.has(el)) {
        list.delete(el);
      }
    }
  }
  // 数组去重，不保证顺序
  function unique(arr) {
    var res = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      for (var j = i + 1; j < len; j++) {
        if (arr[i] === arr[j]) {
          j = ++i;
        }
      }
      res.push(arr[i]);
    }
    return res;
  }
  function isPrimitive(val) {
    return (
      val === null ||
      typeof val === 'string' ||
      typeof val === 'number' ||
      typeof val === 'symbol' ||
      typeof val === 'boolean' ||
      typeof val === 'undefined'
    );
  }
  // 有些测试 jest.mock 不好测，可用这个工具方法
  function callTestCallback(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
  }
  // 深度合并两个对象，能处理循环引用，后面的覆盖前面的，可选数组去重
  function deepMerge(o, n, dp) {
    var lRecord = new WeakMap();
    var rRecord = new WeakMap();
    var vRecord = new WeakMap();
    var isArray = Array.isArray;
    var isAllRefs = function (a, b) {
      // 判断 merge 左右两边，不需要用到 vRecord
      if (lRecord.has(a) || rRecord.has(a)) {
        return lRecord.has(b) || rRecord.has(b);
      }
    };
    var clone = function (v) {
      // 深拷贝
      if (isPrimitive(v) || typeof v === 'function') {
        return v;
      } else if (vRecord.has(v)) {
        return vRecord.get(v);
      } else if (lRecord.has(v)) {
        return lRecord.get(v);
      } else if (rRecord.has(v)) {
        return rRecord.get(v);
      } else if (isArray(v)) {
        if (dp) v = unique(v);
        var res = [];
        vRecord.set(v, res);
        for (var i = 0, len = v.length; i < len; i++) {
          res[i] = clone(v[i]);
        }
        return res;
      } else if (typeof v === 'object') {
        var res_1 = {};
        vRecord.set(v, res_1);
        var keys = Reflect.ownKeys(v);
        keys.forEach(function (key) {
          return (res_1[key] = clone(v[key]));
        });
        return res_1;
      }
    };
    var setValue = function (r, k) {
      if (r.has(k)) {
        return r.get(k);
      } else {
        var val = clone(k);
        if (!isPrimitive(val) && typeof val !== 'function') {
          r.set(k, val);
        }
        return val;
      }
    };
    var mergeObject = function (l, r) {
      var res = {};
      var lkeys = Reflect.ownKeys(l);
      var rkeys = Reflect.ownKeys(r);
      lRecord.set(l, res);
      rRecord.set(r, res);
      lkeys.forEach(function (key) {
        var lv = l[key];
        var rv = r[key];
        if (hasOwn(r, key)) {
          if (isArray(lv) && isArray(rv)) {
            var item = clone([].concat(lv, rv));
            res[key] = dp ? unique(item) : item;
          } else if (isObject(lv) && isObject(rv)) {
            res[key] = isAllRefs(lv, rv) // 如果两变都是循环引用
              ? lRecord.get(lv) // 左边右边同一个值，取哪个都行
              : mergeObject(lv, rv);
          } else {
            res[key] = setValue(rRecord, rv);
          }
        } else {
          res[key] = setValue(lRecord, lv);
        }
      });
      rkeys.forEach(function (key) {
        if (hasOwn(res, key)) return;
        res[key] = setValue(rRecord, r[key]);
      });
      return res;
    };
    return mergeObject(o, n);
  }

  var xChar = 120; // x
  var colonChar = 58; // :
  var ns = 'http://www.w3.org/2000/svg';
  var xlinkNS = 'http://www.w3.org/1999/xlink'; // xmlns:xlink
  var xmlNS = 'http://www.w3.org/XML/1998/namespace'; // xmlns
  var MATCH_CSS_URL = /url\(['"]?([^\)]+?)['"]?\)/g; // 匹配 css 中的 url
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element
  var SVG_TAGS =
    'svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,' +
    'defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,' +
    'feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,' +
    'feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,' +
    'feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,' +
    'fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,' +
    'foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,' +
    'mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,' +
    'polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,' +
    'text,textPath,title,tspan,unknown,use,view';
  var isSVG = makeMap(SVG_TAGS.split(','));
  function attributesString(attributes) {
    if (!attributes || attributes.length === 0) return '';
    return attributes.reduce(function (total, _a) {
      var key = _a.key,
        value = _a.value;
      return total + (value ? key + '="' + value + '" ' : key);
    }, '');
  }
  function applyAttributes(el, attributes) {
    if (!attributes || attributes.length === 0) return;
    for (
      var _i = 0, attributes_1 = attributes;
      _i < attributes_1.length;
      _i++
    ) {
      var _a = attributes_1[_i],
        key = _a.key,
        value = _a.value;
      if (value === null) {
        el.setAttribute(key, '');
      }
      // html entry 中只可能是 string
      else if (typeof value === 'string') {
        if (key.charCodeAt(0) !== xChar) {
          el.setAttribute(key, value);
        } else if (key.charCodeAt(3) === colonChar) {
          el.setAttributeNS(xmlNS, key, value);
        } else if (key.charCodeAt(5) === colonChar) {
          el.setAttributeNS(xlinkNS, key, value);
        } else {
          el.setAttribute(key, value);
        }
      }
    }
  }
  function isVText(vnode) {
    return vnode && vnode.type === 'text';
  }
  function isVNode(vnode) {
    return vnode && vnode.type === 'element';
  }
  function isComment(vnode) {
    return vnode && vnode.type === 'comment';
  }
  function isCssLink(vnode) {
    if (!isVNode(vnode) || vnode.tagName !== 'link') return false;
    return vnode.attributes.find(function (_a) {
      var key = _a.key,
        value = _a.value;
      return key === 'rel' && value === 'stylesheet';
    });
  }
  function isPrefetchJsLink(vnode) {
    if (!isVNode(vnode) || vnode.tagName !== 'link') return false;
    var hasRel, hasAs;
    for (var _i = 0, _a = vnode.attributes; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b.key,
        value = _b.value;
      if (key === 'rel') {
        hasRel = true;
        if (value !== 'preload' && value !== 'prefetch') {
          return false;
        }
      } else if (key === 'as') {
        hasAs = true;
        if (value !== 'script') return false;
      }
    }
    return hasRel && hasAs;
  }
  function removeElement(el) {
    var parentNode = el && el.parentNode;
    if (parentNode) {
      rawRemoveChild.call(parentNode, el);
    }
  }
  function createElement(vnode) {
    var tagName = vnode.tagName,
      attributes = vnode.attributes;
    var el = isSVG(tagName)
      ? document.createElementNS(ns, tagName)
      : document.createElement(tagName);
    applyAttributes(el, attributes);
    return el;
  }
  function createTextNode(vnode) {
    return document.createTextNode(vnode.content);
  }
  function createLinkNode(vnode) {
    var ps = attributesString(vnode.attributes);
    return '<link ' + ps.slice(0, -1) + '></link>';
  }
  function createStyleNode(content) {
    var el = document.createElement('style');
    content && (el.textContent = content);
    applyAttributes(el, [{ key: 'type', value: 'text/css' }]);
    return el;
  }
  function createScriptNode(vnode) {
    var attributes = vnode.attributes,
      children = vnode.children;
    var ps = attributesString(attributes);
    var code = (children === null || children === void 0 ? void 0 : children[0])
      ? children[0].content
      : '';
    return document.createComment(
      '<script ' + ps + ' execute by garfish>' + code + '</script>',
    );
  }
  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  function isAbsolute(url) {
    // `c:\\` 这种 case 返回 false，在浏览器中使用本地图片，应该用 file 协议
    if (!/^[a-zA-Z]:\\/.test(url)) {
      if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
        return true;
      }
    }
    return false;
  }
  function transformUrl(resolvePath, curPath) {
    var baseUrl = new URL(resolvePath, location.href);
    var realPath = new URL(curPath, baseUrl.href);
    return realPath.href;
  }
  // 暂时还不能处理 `@import 'a.css';`
  function transformCssUrl(resolvePath, code) {
    if (!code) return '';
    // 相对路径根据 css 文件的路径转换为绝对路径
    return code.replace(MATCH_CSS_URL, function (k1, k2) {
      if (isAbsolute(k2)) return k1;
      return 'url("' + transformUrl(resolvePath, k2) + '")';
    });
  }
  function findProp(vnode, p) {
    var _a;
    return (_a = vnode.attributes) === null || _a === void 0
      ? void 0
      : _a.find(function (_a) {
          var key = _a.key;
          return key === p;
        });
  }

  function parseContentType(input) {
    input = input === null || input === void 0 ? void 0 : input.trim();
    if (!input) return null;
    var idx = 0;
    var type = '';
    var subtype = '';
    while (idx < input.length && input[idx] !== '/') {
      type += input[idx];
      idx++;
    }
    if (type.length === 0 || idx >= input.length) {
      return null;
    }
    // 跳过 '/'
    idx++;
    while (idx < input.length && input[idx] !== ';') {
      subtype += input[idx];
      idx++;
    }
    subtype = subtype.replace(/[ \t\n\r]+$/, '');
    if (subtype.length === 0) return null;
    return {
      type: type.toLocaleLowerCase(),
      subtype: subtype.toLocaleLowerCase(),
    };
  }
  function isCss(ft) {
    return ft ? ft.type === 'text' && ft.subtype === 'css' : false;
  }
  function isHtml(ft) {
    return ft ? ft.type === 'text' && ft.subtype === 'html' : false;
  }
  // https://mimesniff.spec.whatwg.org/#javascript-mime-type
  function isJs(ft) {
    var _a = ft || {},
      type = _a.type,
      subtype = _a.subtype;
    switch (type) {
      case 'text': {
        switch (subtype) {
          case 'ecmascript':
          case 'javascript':
          case 'javascript1.0':
          case 'javascript1.1':
          case 'javascript1.2':
          case 'javascript1.3':
          case 'javascript1.4':
          case 'javascript1.5':
          case 'jscript':
          case 'livescript':
          case 'x-ecmascript':
          case 'x-javascript': {
            return true;
          }
          default: {
            return false;
          }
        }
      }
      case 'application': {
        switch (subtype) {
          case 'ecmascript':
          case 'javascript':
          case 'x-ecmascript':
          case 'x-javascript': {
            return true;
          }
          default: {
            return false;
          }
        }
      }
      default: {
        return false;
      }
    }
  }

  exports.SVG_TAGS = SVG_TAGS;
  exports.applyAttributes = applyAttributes;
  exports.assert = assert;
  exports.callTestCallback = callTestCallback;
  exports.createElement = createElement;
  exports.createKey = createKey;
  exports.createLinkNode = createLinkNode;
  exports.createScriptNode = createScriptNode;
  exports.createStyleNode = createStyleNode;
  exports.createTextNode = createTextNode;
  exports.deepMerge = deepMerge;
  exports.def = def;
  exports.error = error;
  exports.findProp = findProp;
  exports.hasOwn = hasOwn;
  exports.isAbsolute = isAbsolute;
  exports.isComment = isComment;
  exports.isCss = isCss;
  exports.isCssLink = isCssLink;
  exports.isHtml = isHtml;
  exports.isJs = isJs;
  exports.isObject = isObject;
  exports.isPrefetchJsLink = isPrefetchJsLink;
  exports.isPrimitive = isPrimitive;
  exports.isSVG = isSVG;
  exports.isVNode = isVNode;
  exports.isVText = isVText;
  exports.makeMap = makeMap;
  exports.noop = noop;
  exports.parseContentType = parseContentType;
  exports.rawAddEventListener = rawAddEventListener;
  exports.rawAppendChild = rawAppendChild;
  exports.rawClearInterval = rawClearInterval;
  exports.rawClearTimeout = rawClearTimeout;
  exports.rawDocument = rawDocument;
  exports.rawDocumentCtor = rawDocumentCtor;
  exports.rawLocalstorage = rawLocalstorage;
  exports.rawMutationObserver = rawMutationObserver;
  exports.rawObject = rawObject;
  exports.rawObjectCreate = rawObjectCreate;
  exports.rawObjectDefineProperty = rawObjectDefineProperty;
  exports.rawObjectGetOwnPropertyDescriptor = rawObjectGetOwnPropertyDescriptor;
  exports.rawObjectKeys = rawObjectKeys;
  exports.rawObserver = rawObserver;
  exports.rawRemoveChild = rawRemoveChild;
  exports.rawRemoveEventListener = rawRemoveEventListener;
  exports.rawSessionStorage = rawSessionStorage;
  exports.rawSetInterval = rawSetInterval;
  exports.rawSetTimeout = rawSetTimeout;
  exports.rawWindow = rawWindow;
  exports.remove = remove;
  exports.removeElement = removeElement;
  exports.toBoolean = toBoolean;
  exports.transformCssUrl = transformCssUrl;
  exports.transformUrl = transformUrl;
  exports.unique = unique;
  exports.warn = warn;

  Object.defineProperty(exports, '__esModule', { value: true });
});
//# sourceMappingURL=utils.umd.js.map

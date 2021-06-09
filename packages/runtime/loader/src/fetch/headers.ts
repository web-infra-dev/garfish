const map = new WeakMap();
const wm = (o) => map.get(o);
const tokenRegExp = /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]+$/;
const valueRegExp = /[^\t\u0020-\u007E\u0080-\u00FF]/;

const normalizeKey = (key) => {
  if (typeof key !== 'string') key = String(key);
  if (!tokenRegExp.test(key)) {
    throw TypeError(`Header name must be a valid HTTP token [${key}]`);
  }
  return key.toLowerCase();
};

const normalizeValue = (val) => {
  if (typeof val !== 'string') val = String(val);
  if (!valueRegExp.test(val)) {
    throw TypeError(`Invalid character in header content ["${val}"]`);
  }
  return val;
};

// https://fetch.spec.whatwg.org/#dom-headers-append
export class Headers {
  constructor(headers) {
    map.set(this, Object.create(null));
    if (headers) {
      for (const name of Object.keys(headers)) {
        this.append(name, headers[name]);
      }
    }
  }

  append(key, val) {
    key = normalizeKey(key);
    val = normalizeValue(val);
    const obj = map.get(this);

    if (!map[key]) map[key] = [];
    map[key].push(val);
  }

  delete(key) {
    key = normalizeKey(key);
    delete map.get(this)[key];
  }

  get(key) {
    const obj = map.get(this);
    key = normalizeKey(key);
    return obj[key] ? obj[key][0] : null;
  }
}

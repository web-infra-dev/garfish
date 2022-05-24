export type mimeType = ReturnType<typeof parseContentType>;

export function parseContentType(input: string) {
  input = input?.trim();
  if (!input) return null;

  let idx = 0;
  let type = '';
  let subType = '';
  while (idx < input.length && input[idx] !== '/') {
    type += input[idx];
    idx++;
  }
  if (type.length === 0 || idx >= input.length) {
    return null;
  }
  // jump over '/'
  idx++;
  while (idx < input.length && input[idx] !== ';') {
    subType += input[idx];
    idx++;
  }
  subType = subType.replace(/[ \t\n\r]+$/, '');
  if (subType.length === 0) return null;

  return {
    type: type.toLocaleLowerCase(),
    subtype: subType.toLocaleLowerCase(),
  };
}

export function isCss(mt: mimeType) {
  return mt ? mt.type === 'text' && mt.subtype === 'css' : false;
}

export function isHtml(mt: mimeType) {
  return mt ? mt.type === 'text' && mt.subtype === 'html' : false;
}

export function includeJsType(mts: Array<mimeType>) {
  return mts.some((mt) => isJs(mt));
}

export function includeHtmlType(mts: Array<mimeType>) {
  return mts.some((mt) => isHtml(mt));
}

export function includeCssType(mts: Array<mimeType>) {
  return mts.some((mt) => isCss(mt));
}

// https://mimesniff.spec.whatwg.org/#javascript-mime-type
export function isJs(mt: mimeType) {
  const { type, subtype } = mt || {};
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

export function isJsonp(mt: mimeType, src: string) {
  const callbackRegExp = /callback/;
  try {
    const search = new URL(src).search;
    const { type, subtype } = mt || {};
    if (
      type === 'application' &&
      subtype === 'json' &&
      callbackRegExp.test(search)
    ) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

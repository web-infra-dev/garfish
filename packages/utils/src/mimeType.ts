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

export function isJsType({ src = '', type }: { src?: string; type?: string }) {
  if (/\.js$/.test(src)) return true;

  if (type) {
    if (type === 'module') return true;
    const mimeTypeInfo = parseContentType(type);
    if (isJsonp(mimeTypeInfo, src)) return true;
    if (isJs(mimeTypeInfo)) return true;
  }

  return false;
}

export function isCssType({ src = '', type }: { src?: string; type?: string }) {
  if (/\.css$/.test(src)) return true;

  if (type) {
    const mimeTypeInfo = parseContentType(type);
    if (isCss(mimeTypeInfo)) return true;
  }

  return false;
}

export function isHtmlType({
  src = '',
  type,
}: {
  src?: string;
  type?: string;
}) {
  if (/\.html$/.test(src)) return true;

  if (type) {
    const mimeTypeInfo = parseContentType(type);
    if (isHtml(mimeTypeInfo)) return true;
  }

  return false;
}

export function isGarfishConfigType({
  type = '',
}: {
  type?: string;
}) {
  return /garfish-config/i.test(type);
}

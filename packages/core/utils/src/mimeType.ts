/* eslint-disable indent */
type FileType = ReturnType<typeof parseContentType>;

export function parseContentType(input: string) {
  input = input?.trim();
  if (!input) return null;

  let idx = 0;
  let type = '';
  let subtype = '';
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

export function isCss(ft: FileType) {
  return ft ? ft.type === 'text' && ft.subtype === 'css' : false;
}

export function isHtml(ft: FileType) {
  return ft ? ft.type === 'text' && ft.subtype === 'html' : false;
}

// https://mimesniff.spec.whatwg.org/#javascript-mime-type
export function isJs(ft: FileType) {
  const { type, subtype } = ft || {};
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

/* eslint-disable quotes */
// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
import { Node, StylesheetNode } from './types';

const commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

export interface CssParserOptions {
  source?: string;
  silent?: boolean;
}

// 1M text takes about 150ms
export function parse(css: string, options?: CssParserOptions) {
  options = options || {};
  let line = 1;
  let column = 1;

  // Update lineno and column based on `str`.
  function updatePosition(str) {
    const lines = str.match(/\n/g);
    if (lines) line += lines.length;
    const i = str.lastIndexOf('\n');
    column = i > -1 ? str.length - i : column + str.length;
  }

  // Mark position and patch `node.position`.
  function position() {
    const start = { line, column };
    return function (node) {
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  // Store position information for a node
  function Position(start) {
    this.start = start;
    this.end = { line, column };
    this.source = options.source;
    this.content = css;
  }

  const errorsList = [];
  function error(msg) {
    const source = options.source ? options.source + ':' : '';
    const err: any = new Error(source + line + ':' + column + ': ' + msg);

    err.line = line;
    err.column = column;
    err.reason = msg;
    err.source = css;
    err.filename = options.source;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  // Parse stylesheet.
  function stylesheet() {
    const rulesList = rules();
    return {
      type: 'stylesheet',
      stylesheet: {
        rules: rulesList,
        source: options.source,
        parsingErrors: errorsList,
      },
    };
  }

  // Opening brace.
  function open() {
    return match(/^{\s*/);
  }

  // Closing brace.
  function close() {
    return match(/^}/);
  }

  // Parse whitespace.
  function whitespace() {
    match(/^\s*/);
  }

  // Parse ruleset.
  function rules() {
    let node;
    const rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  // Match `re` and return captures.
  function match(re) {
    const m = re.exec(css);
    if (m) {
      const str = m[0];
      updatePosition(str);
      css = css.slice(str.length);
      return m;
    }
  }

  // Parse comments;
  function comments(rules?: Array<any>) {
    let c;
    rules = rules || [];
    while ((c = comment())) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  // Parse comment.
  function comment() {
    const pos = position();
    if ('/' !== css.charAt(0) || '*' !== css.charAt(1)) return;

    let i = 2;
    while (
      '' !== css.charAt(i) &&
      ('*' !== css.charAt(i) || '/' !== css.charAt(i + 1))
    ) {
      ++i;
    }

    i += 2;

    if ('' === css.charAt(i - 1)) {
      return error('End of comment missing');
    }

    const str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str,
    });
  }

  // Parse selector.
  function selector() {
    const m = match(/^([^{]+)/);
    if (m) {
      // @fix Remove all comments from selectors
      // http://ostermiller.org/findcomment.html
      return trim(m[0])
        .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
        .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (m) => {
          return m.replace(/,/g, '\u200C');
        })
        .split(/\s*(?![^(]*\)),\s*/)
        .map((s) => s.replace(/\u200C/g, ','));
    }
  }

  // Parse declaration.
  function declaration() {
    const pos = position();
    // prop
    let prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return;
    prop = trim(prop[0]);
    // :
    if (!match(/^:\s*/)) return error("property missing ':'");
    // val
    const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    const ret = pos({
      type: 'declaration',
      property: prop.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : '',
    });

    // ;
    match(/^[;\s]*/);
    return ret;
  }

  // Parse declarations.
  function declarations() {
    const decls = [];
    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    let decl;
    while ((decl = declaration())) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }
    if (!close()) return error("missing '}'");
    return decls;
  }

  // Parse keyframe.
  function keyframe() {
    let m;
    const vals = [];
    const pos = position();

    while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;
    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations(),
    });
  }

  // Parse keyframes.
  function atkeyframes() {
    const pos = position();
    let m = match(/^@([-\w]+)?keyframes\s*/);
    if (!m) return;
    const vendor = m[1];

    // identifier
    m = match(/^([-\w]+)\s*/);
    if (!m) return error('@keyframes missing name');
    const name = m[1];

    if (!open()) return error("@keyframes missing '{'");
    let frame;
    let frames = comments();
    while ((frame = keyframe())) {
      frames.push(frame);
      frames = frames.concat(comments());
    }
    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames,
    });
  }

  // Parse supports.
  function atsupports() {
    const pos = position();
    const m = match(/^@supports *([^{]+)/);

    if (!m) return;
    const supports = trim(m[1]);

    if (!open()) return error("@supports missing '{'");
    const style = comments().concat(rules());
    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style,
    });
  }

  // Parse host.
  function athost() {
    const pos = position();
    const m = match(/^@host\s*/);
    if (!m) return;

    if (!open()) return error("@host missing '{'");
    const style = comments().concat(rules());
    if (!close()) return error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style,
    });
  }

  // Parse media.
  function atmedia() {
    const pos = position();
    const m = match(/^@media *([^{]+)/);

    if (!m) return;
    const media = trim(m[1]);

    if (!open()) return error("@media missing '{'");
    const style = comments().concat(rules());
    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style,
    });
  }

  // Parse custom-media.
  function atcustommedia() {
    const pos = position();
    const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2]),
    });
  }

  // Parse paged media.
  function atpage() {
    const pos = position();
    const m = match(/^@page */);
    if (!m) return;

    const sel = selector() || [];

    if (!open()) return error("@page missing '{'");
    // declarations
    let decl;
    let decls = comments();

    while ((decl = declaration())) {
      decls.push(decl);
      decls = decls.concat(comments());
    }
    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls,
    });
  }

  // Parse document.
  function atdocument() {
    const pos = position();
    const m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    const vendor = trim(m[1]);
    const doc = trim(m[2]);

    if (!open()) return error("@document missing '{'");
    const style = comments().concat(rules());
    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style,
    });
  }

  // Parse font-face.
  function atfontface() {
    const pos = position();
    const m = match(/^@font-face\s*/);
    if (!m) return;

    if (!open()) return error("@font-face missing '{'");
    // declarations
    let decl;
    let decls = comments();
    while ((decl = declaration())) {
      decls.push(decl);
      decls = decls.concat(comments());
    }
    if (!close()) return error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls,
    });
  }

  // Parse non-block at-rules
  function compileAtrule(name) {
    const re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function () {
      const pos = position();
      const m = match(re);
      if (!m) return;
      const ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    };
  }

  // Parse import
  const atimport = compileAtrule('import');
  // Parse charset
  const atcharset = compileAtrule('charset');
  // Parse namespace
  const atnamespace = compileAtrule('namespace');

  // Parse at rule.
  function atrule() {
    if (css[0] !== '@') return;
    return (
      atkeyframes() ||
      atmedia() ||
      atcustommedia() ||
      atsupports() ||
      atimport() ||
      atcharset() ||
      atnamespace() ||
      atdocument() ||
      atpage() ||
      athost() ||
      atfontface()
    );
  }

  // Parse rule.
  function rule() {
    const pos = position();
    const sel = selector();
    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations(),
    });
  }

  return addParent(stylesheet() as any) as StylesheetNode;
}

function trim(str) {
  return str ? str.trim() : '';
}

// Adds non-enumerable parent node reference to each node.
function addParent(obj: Node, parent?: Node | null) {
  const isNode = obj && typeof obj.type === 'string';
  const childParent = isNode ? obj : parent;

  for (const k in obj) {
    const value = obj[k];
    if (Array.isArray(value)) {
      value.forEach((v) => addParent(v, childParent));
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    obj.parent = parent || null;
  }
  return obj;
}

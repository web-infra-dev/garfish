
export interface ImportSpecifier {
  /**
   * Module name
   *
   * To handle escape sequences in specifier strings, the .n field of imported specifiers will be provided where possible.
   *
   * For dynamic import expressions, this field will be empty if not a valid JS string.
   *
   * @example
   * const [imports1, exports1] = parse(String.raw`import './\u0061\u0062.js'`);
   * imports1[0].n;
   * // Returns "./ab.js"
   *
   * const [imports2, exports2] = parse(`import("./ab.js")`);
   * imports2[0].n;
   * // Returns "./ab.js"
   *
   * const [imports3, exports3] = parse(`import("./" + "ab.js")`);
   * imports3[0].n;
   * // Returns undefined
   */
  readonly n: string | undefined;
  /**
   * Start of module specifier
   *
   * @example
   * const source = `import { a } from 'asdf'`;
   * const [imports, exports] = parse(source);
   * source.substring(imports[0].s, imports[0].e);
   * // Returns "asdf"
   */
  readonly s: number;
  /**
   * End of module specifier
   */
  readonly e: number;

  /**
   * Start of import statement
   *
   * @example
   * const source = `import { a } from 'asdf'`;
   * const [imports, exports] = parse(source);
   * source.substring(imports[0].ss, imports[0].se);
   * // Returns "import { a } from 'asdf';"
   */
  readonly ss: number;
  /**
   * End of import statement
   */
  readonly se: number;

  /**
   * If this import statement is a dynamic import, this is the start value.
   * Otherwise this is `-1`.
   */
  readonly d: number;

  /**
   * If this import has an import assertion, this is the start value.
   * Otherwise this is `-1`.
   */
  readonly a: number;
}

export interface ExportSpecifier {
  /**
   * Exported name
   *
   * @example
   * const source = `export default []`;
   * const [imports, exports] = parse(source);
   * exports[0].n;
   * // Returns "default"
   *
   * @example
   * const source = `export const asdf = 42`;
   * const [imports, exports] = parse(source);
   * exports[0].n;
   * // Returns "asdf"
   */
  readonly n: string;

  /**
   * Local name, or undefined.
   *
   * @example
   * const source = `export default []`;
   * const [imports, exports] = parse(source);
   * exports[0].ln;
   * // Returns undefined
   *
   * @example
   * const asdf = 42;
   * const source = `export { asdf as a }`;
   * const [imports, exports] = parse(source);
   * exports[0].ln;
   * // Returns "asdf"
   */
  readonly ln: string | undefined;

  /**
   * Start of exported name
   *
   * @example
   * const source = `export default []`;
   * const [imports, exports] = parse(source);
   * source.substring(exports[0].s, exports[0].e);
   * // Returns "default"
   *
   * @example
   * const source = `export { 42 as asdf }`;
   * const [imports, exports] = parse(source);
   * source.substring(exports[0].s, exports[0].e);
   * // Returns "asdf"
   */
  readonly s: number;
  /**
   * End of exported name
   */
  readonly e: number;

  /**
   * Start of local name, or -1.
   *
   * @example
   * const asdf = 42;
   * const source = `export { asdf as a }`;
   * const [imports, exports] = parse(source);
   * source.substring(exports[0].ls, exports[0].le);
   * // Returns "asdf"
   */
  readonly ls: number;
  /**
   * End of local name, or -1.
   */
  readonly le: number;
}

const isLE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

/**
 * Outputs the list of exports and locations of import specifiers,
 * including dynamic import and import meta handling.
 *
 * @param source Source code to parser
 * @param name Optional sourcename
 * @returns Tuple contaning imports list and exports list.
 */
export function parse (source: string, name = '@'): readonly [
  imports: ReadonlyArray<ImportSpecifier>,
  exports: ReadonlyArray<ExportSpecifier>,
  facade: boolean
] {
  if (!wasm)
    // actually returns a promise if init hasn't resolved (not type safe).
    // casting to avoid a breaking type change.
    return init().then(() => parse(source)) as unknown as ReturnType<typeof parse>;

  const len = source.length + 1;

  // need 2 bytes per code point plus analysis space so we double again
  const extraMem = (wasm.__heap_base.value || wasm.__heap_base) as number + len * 4 - wasm.memory.buffer.byteLength;
  if (extraMem > 0)
    wasm.memory.grow(Math.ceil(extraMem / 65536));

  const addr = wasm.sa(len - 1);
  (isLE ? copyLE : copyBE)(source, new Uint16Array(wasm.memory.buffer, addr, len));

  if (!wasm.parse())
    throw Object.assign(new Error(`Parse error ${name}:${source.slice(0, wasm.e()).split('\n').length}:${wasm.e() - source.lastIndexOf('\n', wasm.e() - 1)}`), { idx: wasm.e() });

  const imports: ImportSpecifier[] = [], exports: ExportSpecifier[] = [];
  while (wasm.ri()) {
    const s = wasm.is(), e = wasm.ie(), a = wasm.ai(), d = wasm.id(), ss = wasm.ss(), se = wasm.se();
    let n;
    if (wasm.ip())
      n = decode(source.slice(d === -1 ? s - 1 : s, d === -1 ? e + 1 : e));
    imports.push({ n, s, e, ss, se, d, a });
  }
  while (wasm.re()) {
    const s = wasm.es(), e = wasm.ee(), ls = wasm.els(), le = wasm.ele();
    const n = source.slice(s, e), ch = n[0];
    const ln = ls < 0 ? undefined : source.slice(ls, le), lch = ln ? ln[0] : '';
    exports.push({
      s, e, ls, le,
      n: (ch === '"' || ch === "'") ? decode(n) : n,
      ln: (lch === '"' || lch === "'") ? decode(ln) : ln,
    });
  }

  function decode (str: string | undefined) {
    try {
      return (0, eval)(str as string) // eval(undefined) -> undefined
    }
    catch (e) {}
  }

  return [imports, exports, !!wasm.f()];
}

function copyBE (src: string, outBuf16: Uint16Array) {
  const len = src.length;
  let i = 0;
  while (i < len) {
    const ch = src.charCodeAt(i);
    outBuf16[i++] = (ch & 0xff) << 8 | ch >>> 8;
  }
}

function copyLE (src: string, outBuf16: Uint16Array) {
  const len = src.length;
  let i = 0;
  while (i < len)
    outBuf16[i] = src.charCodeAt(i++);
}

let wasm: {
  __heap_base: {value: number} | number & {value: undefined};
  memory: WebAssembly.Memory;
  parse(): boolean;
  /** getAssertIndex */
  ai(): number;
  /** getErr */
  e(): number;
  /** getExportEnd */
  ee(): number;
  /** getExportLocalEnd */
  ele(): number;
  /** getExportLocalStart */
  els(): number;
  /** getExportStart */
  es(): number;
  /** facade */
  f(): boolean;
  /** getImportDynamic */
  id(): number;
  /** getImportEnd */
  ie(): number;
  /** getImportSafeString */
  ip(): number;
  /** getImportStart */
  is(): number;
  /** readExport */
  re(): boolean;
  /** readImport */
  ri(): boolean;
  /** allocateSource */
  sa(utf16Len: number): number;
  /** getImportStatementEnd */
  se(): number;
  /** getImportStatementStart */
  ss(): number;
};

let initTask: Promise<any>;

/**
 * Wait for init to resolve before calling `parse`.
 */
export const init = () => {
  if (!initTask) {
    initTask = WebAssembly.compile(
      (binary => typeof Buffer !== 'undefined' ? Buffer.from(binary, 'base64') : Uint8Array.from(atob(binary), x => x.charCodeAt(0)))
      ('WASM_BINARY')
    )
    .then(WebAssembly.instantiate)
    .then(({ exports }) => { wasm = exports as typeof wasm; });
  }

  return initTask;
};

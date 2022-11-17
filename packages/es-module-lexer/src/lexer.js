const isLE = new Uint8Array(new Uint16Array([
    1
]).buffer)[0] === 1;
/**
 * Outputs the list of exports and locations of import specifiers,
 * including dynamic import and import meta handling.
 *
 * @param source Source code to parser
 * @param name Optional sourcename
 * @returns Tuple contaning imports list and exports list.
 */ export function parse(source, name = '@') {
    if (!wasm) // actually returns a promise if init hasn't resolved (not type safe).
    // casting to avoid a breaking type change.
    return init().then(()=>parse(source));
    const len = source.length + 1;
    // need 2 bytes per code point plus analysis space so we double again
    const extraMem = (wasm.__heap_base.value || wasm.__heap_base) + len * 4 - wasm.memory.buffer.byteLength;
    if (extraMem > 0) wasm.memory.grow(Math.ceil(extraMem / 65536));
    const addr = wasm.sa(len - 1);
    (isLE ? copyLE : copyBE)(source, new Uint16Array(wasm.memory.buffer, addr, len));
    if (!wasm.parse()) throw Object.assign(new Error(`Parse error ${name}:${source.slice(0, wasm.e()).split('\n').length}:${wasm.e() - source.lastIndexOf('\n', wasm.e() - 1)}`), {
        idx: wasm.e()
    });
    const imports = [], exports = [];
    while(wasm.ri()){
        const s = wasm.is(), e = wasm.ie(), a = wasm.ai(), d = wasm.id(), ss = wasm.ss(), se = wasm.se();
        let n;
        if (wasm.ip()) n = decode(source.slice(d === -1 ? s - 1 : s, d === -1 ? e + 1 : e));
        imports.push({
            n,
            s,
            e,
            ss,
            se,
            d,
            a
        });
    }
    while(wasm.re()){
        const s = wasm.es(), e = wasm.ee(), ls = wasm.els(), le = wasm.ele();
        const n = source.slice(s, e), ch = n[0];
        const ln = ls < 0 ? undefined : source.slice(ls, le), lch = ln ? ln[0] : '';
        exports.push({
            s,
            e,
            ls,
            le,
            n: ch === '"' || ch === "'" ? decode(n) : n,
            ln: lch === '"' || lch === "'" ? decode(ln) : ln
        });
    }
    function decode(str) {
        try {
            return (0, eval)(str) // eval(undefined) -> undefined
            ;
        } catch (e) {}
    }
    return [
        imports,
        exports,
        !!wasm.f()
    ];
}
function copyBE(src, outBuf16) {
    const len = src.length;
    let i = 0;
    while(i < len){
        const ch = src.charCodeAt(i);
        outBuf16[i++] = (ch & 0xff) << 8 | ch >>> 8;
    }
}
function copyLE(src, outBuf16) {
    const len = src.length;
    let i = 0;
    while(i < len)outBuf16[i] = src.charCodeAt(i++);
}
let wasm;
let initTask;
/**
 * Wait for init to resolve before calling `parse`.
 */ export const init = ()=>{
    if (!initTask) {
        initTask = WebAssembly.compile(((binary)=>typeof Buffer !== 'undefined' ? Buffer.from(binary, 'base64') : Uint8Array.from(atob(binary), (x)=>x.charCodeAt(0)))('WASM_BINARY')).then(WebAssembly.instantiate).then(({ exports  })=>{
            wasm = exports;
        });
    }
    return initTask;
};


//# sourceMappingURL=lexer.js.map
// https://github.com/node-fetch/node-fetch/blob/master/src/body.js
const wm = new WeakMap();

async function* read(parts) {
  for (const part of parts) {
    if ('stream' in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}

export class Blob {
  constructor(blobParts = [], options = { type: '' }) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(
          element.buffer,
          element.byteOffset,
          element.byteLength,
        );
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob) {
        buffer = element;
      } else {
        buffer = Buffer.from(
          typeof element === 'string' ? element : String(element),
        );
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });

    const type =
      options.type === undefined ? '' : String(options.type).toLowerCase();

    wm.set(this, {
      size,
      parts,
      type: /[^\u0020-\u007E]/.test(type) ? '' : type,
    });
  }

  get size() {
    return wm.get(this).size;
  }

  get type() {
    return wm.get(this).type;
  }

  get [Symbol.toStringTag]() {
    return 'Blob';
  }

  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }

  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }

  stream() {
    // eslint-disable-next-line no-restricted-globals
    const { Readable } = require('stream');
    return Readable.from(read(wm.get(this).parts));
  }

  slice(start = 0, end = this.size, type = '') {
    const { size } = this;
    let relativeStart =
      start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);

    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;

    for (const part of parts) {
      const size = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size <= relativeStart) {
        relativeStart -= size;
        relativeEnd -= size;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) break;
      }
    }

    const blob = new Blob([], { type: String(type).toLowerCase() });
    Object.assign(wm.get(blob), { size: span, parts: blobParts });
    return blob;
  }

  static [Symbol.hasInstance](object) {
    return (
      typeof object === 'object' &&
      typeof object.stream === 'function' &&
      object.stream.length === 0 &&
      typeof object.constructor === 'function' &&
      /^(Blob|File)$/.test(object[Symbol.toStringTag])
    );
  }
}

Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true },
});

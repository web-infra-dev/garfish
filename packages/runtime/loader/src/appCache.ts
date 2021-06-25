import { calculateObjectSize } from './utils';

export const cachedDataSet = new WeakSet();

export enum FileTypes {
  js = 'js',
  css = 'css',
  template = 'template',
  component = 'component',
}

const MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_POLL = Symbol('__defaultBufferPoll__');
const FILE_TYPES = [
  FileTypes.js,
  FileTypes.css,
  FileTypes.template,
  FileTypes.component,
  DEFAULT_POLL,
];

export class AppCacheContainer {
  private maxSize: number;
  private totalSize = 0;
  private recorder = {};

  constructor(maxSize = MAX_SIZE) {
    this.maxSize = maxSize;
    FILE_TYPES.forEach((key) => {
      this.recorder[key] = 0;
      this[key] = new Map<string, any>();
    });
  }

  bufferPool(type: FileTypes | typeof DEFAULT_POLL) {
    return this[type] as Map<string, any>;
  }

  has(url: string) {
    return FILE_TYPES.some((key) => this[key].has(url));
  }

  get(url: string) {
    for (const key of FILE_TYPES) {
      if (this[key].has(url)) {
        return this[key].get(url);
      }
    }
  }

  set(url: string, data: any, type: FileTypes) {
    const curSize = cachedDataSet.has(data) ? 0 : calculateObjectSize(data);
    const totalSize = this.totalSize + curSize;

    if (totalSize < this.maxSize) {
      let bar = type;
      let bufferPool = this.bufferPool(type);
      if (!bufferPool) {
        bar = DEFAULT_POLL as any;
        bufferPool = this.bufferPool(DEFAULT_POLL);
      }

      bufferPool.set(url, data);
      this.totalSize = totalSize;
      this.recorder[bar] += curSize;
      return true;
    }
    return false;
  }

  clear(type?: FileTypes) {
    if (typeof type === 'string') {
      const cacheBox = this.bufferPool(type);
      if (cacheBox && cacheBox instanceof Map) {
        const size = this.recorder[type];
        this.totalSize -= size;
        this.recorder[type] = 0;
        cacheBox.clear();
      }
    } else {
      FILE_TYPES.forEach((key) => {
        this[key].clear();
        this.recorder[key] = 0;
      });
      this.totalSize = 0;
    }
  }
}

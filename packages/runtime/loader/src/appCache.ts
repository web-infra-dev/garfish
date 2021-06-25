import { calculateObjectSize } from './utils';

const MAX_SIZE = 1024 * 1024 * 15;
const DEFAULT_POLL = Symbol('__defaultBufferPoll__');
const FILE_TYPES = ['js', 'css', 'template', 'component'] as const;

export const cachedDataSet = new WeakSet();
export type FileType = typeof FILE_TYPES[number];

export class AppCacheContainer {
  private maxSize: number;
  private totalSize = 0;

  constructor(maxSize = MAX_SIZE) {
    this.maxSize = maxSize;
    FILE_TYPES.forEach((key) => {
      this[key] = new Map<string, any>();
    });
    this[DEFAULT_POLL] = new Map<string, any>();
  }

  bufferPool(type: FileType | typeof DEFAULT_POLL) {
    return this[type] as Map<string, any>;
  }

  has(url: string) {
    return (
      FILE_TYPES.some((key) => this[key].has(url)) ||
      this.bufferPool(DEFAULT_POLL).has(url)
    );
  }

  get(url: string) {
    for (const key of FILE_TYPES) {
      if (this[key].has(url)) {
        return this[key].get(url);
      }
    }
    const defaultPool = this.bufferPool(DEFAULT_POLL);
    if (defaultPool.has(url)) {
      return defaultPool.get(url);
    }
  }

  set(url: string, data: any, type: FileType) {
    // prettier-ignore
    const totalSize = this.totalSize + (
      cachedDataSet.has(data)
        ? 0
        : calculateObjectSize(data)
    );
    if (totalSize < this.maxSize) {
      let bufferPool = this.bufferPool(type);
      if (!bufferPool) {
        bufferPool = this.bufferPool(DEFAULT_POLL);
      }
      bufferPool.set(url, data);
      this.totalSize = totalSize;
      return true;
    }
    return false;
  }

  clear(type?: FileType) {
    if (typeof type === 'string') {
      const cacheBox = this.bufferPool(type);
      if (cacheBox && cacheBox instanceof Map) {
        cacheBox.clear();
      }
    } else {
      FILE_TYPES.forEach((key) => {
        this[key].clear();
      });
      this.bufferPool(DEFAULT_POLL).clear();
    }
  }
}

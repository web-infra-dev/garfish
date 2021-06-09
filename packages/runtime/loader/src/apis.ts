// import { Hooks } from '@garfish/hooks';
import { error, assert, parseContentType } from '@garfish/utils';

let cumulativeSize = 0;
const overCapacity = (s) => s > 1024 * 1024 * 30;

class Hooks {
  add(_) {}
  run(_, __) {}
}

// loader 的定位是加载器
// 需要负责资源的加载，缓存和错误处理
export class Loader {
  // private plugins = new Hooks();
  private cacheBox = Object.create(null);
  private loadingBox = Object.create(null);
  public requestConfig: RequestInit | ((id: string) => RequestInit) = {};

  // use(plugin: () => any) {
  //   this.plugins.add(plugin);
  // }

  load(id: string) {
    assert(id, 'Miss load url');
    assert(typeof id === 'string', 'load url must be an string');

    if (this.loadingBox[id]) return this.loadingBox[id];
    if (this.cacheBox[id]) return Promise.resolve(this.cacheBox[id]);

    const requestConfig =
      typeof this.requestConfig === 'function'
        ? this.requestConfig(id)
        : this.requestConfig;
    const config = { mode: 'cors', ...requestConfig };

    // @ts-ignore
    this.loadingBox[id] = fetch(id, config)
      .then((res) => {
        // 响应码大于 400 的当做错误
        if (res.status >= 400) {
          error(`"${id}" load failed with status "${res.status}"`);
        }
        return res.text().then((code) => ({ code, res }));
      })
      .then(({ code, res }) => {
        const blob = new Blob([code]);
        const size = Number(blob.size);
        const type = res.headers.get('content-type');
        // const result = this.plugins.run(code, {
        //   size,
        //   url: res.url,
        //   mimeType: parseContentType(type),
        // });

        this.loadingBox[id] = null;
        cumulativeSize += isNaN(size) ? 0 : size;
        // if (!overCapacity(cumulativeSize)) {
        //   this.cacheBox[id] = result;
        // }
        // return result;
      });
    return this.loadingBox[id];
  }
}

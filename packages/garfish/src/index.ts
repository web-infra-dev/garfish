// export type { interfaces } from '@garfish/core';
// export { default as Garfish } from '@garfish/core';
// export { GarfishInstance as default } from './instance';
// export { defineCustomElements } from './customElement';
import { App, Options } from './app';

class Garfish {
  private loading: Record<string, Promise<any> | null> = {};
  public async loadApp(options: Options) {
    if (this.loading[options.entry]) return this.loading[options.entry];

    const asyncLoadProcess = async () => {
      try {
        const response = await fetch(options.entry, options.fetchOptions);
        const htmlText = await response.text();
        return new App(options, htmlText);
      } catch (err) {
        throw err;
      } finally {
        this.loading[options.entry] = null;
      }
    };

    this.loading[options.entry] = asyncLoadProcess();
    return this.loading[options.entry];
  }
}

export default Garfish;

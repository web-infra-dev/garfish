// export type { interfaces } from '@garfish/core';
// export { default as Garfish } from '@garfish/core';
// export { GarfishInstance as default } from './instance';
// export { defineCustomElements } from './customElement';

class App {}

interface Options {
  entry: string;
  fetchOptions: Object;
  JSRuntimePath?: string;
}

class Garfish {
  private loading: Record<string, Promise<any> | null> = {};
  async loadApp(options: Options) {
    if (this.loading[options.entry]) return this.loading[options.entry];
    const domParser = new DOMParser();

    const asyncLoadProcess = async function () {
      const iframe = document.createElement('iframe');
      iframe.src = options.JSRuntimePath || '';
      iframe.hidden = true;
      try {
        const [response] = await Promise.all([
          fetch(options.entry, options.fetchOptions),
        ]);
        const htmlText = await response.text();
        console.log(htmlText);
        console.log(
          domParser
            .parseFromString(htmlText, 'text/html')
            .querySelectorAll('script'),
        );
      } catch (err) {
        throw err;
      }
    };

    this.loading[options.entry] = asyncLoadProcess();
  }
}

export default Garfish;

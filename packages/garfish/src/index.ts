// export type { interfaces } from '@garfish/core';
// export { default as Garfish } from '@garfish/core';
// export { GarfishInstance as default } from './instance';
// export { defineCustomElements } from './customElement';
import { getRenderNode } from '@garfish/utils';
import {
  addEventListenerTo,
  appendChildTo,
  assert,
  defineProperties,
  defineProperty,
} from './utils';

interface Options {
  entry: string;
  fetchOptions: Object;
  JSRuntimePath?: string;
  shadowMode?: boolean;
}

interface MountOptions {
  domGetter: string | (() => Element);
}

class App {
  private iframeContext: HTMLIFrameElement;
  private document: Document;
  private options: Options;
  private htmlText: string;

  constructor(options: Options, htmlText: string) {
    this.options = options;
    this.htmlText = htmlText;
  }

  public async mount(options: MountOptions) {
    const container = await getRenderNode(options.domGetter);

    this.injectHtml(container);
  }

  private injectHtml(container) {
    const iframe = document.createElement('iframe');
    iframe.src = this.options.JSRuntimePath || '';
    iframe.hidden = true;
    iframe.setAttribute('display', 'none');

    const appContainer = document.createElement('div');
    const doc = document.createElement('m-document');
    const appRoot = appContainer.attachShadow({ mode: 'closed' });
    defineProperty(appRoot, 'document', { value: doc });
    container.appendChild(appContainer);

    DocumentFragment.prototype.append.call(appRoot, iframe, doc);

    const domParser = new DOMParser();
    const subAppDoc = domParser.parseFromString(this.htmlText, 'text/html');
    defineProperties(appRoot, {
      documentElement: {
        configurable: true,
        value: subAppDoc.documentElement,
      },
      head: {
        configurable: true,
        value: subAppDoc.head,
      },
      body: {
        configurable: true,
        value: subAppDoc.body,
      },
    });

    appendChildTo((appRoot as any).document, subAppDoc.documentElement);
  }
}

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

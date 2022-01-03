import {
  addEventListenerTo,
  appendChildTo,
  appendTo,
  defineProperties,
  defineProperty,
  getRenderNode,
  SCRIPT_TYPES,
} from './utils';

export interface Options {
  entry: string;
  fetchOptions: Object;
  JSRuntimePath?: string;
  shadowMode?: boolean;
}

interface MountOptions {
  domGetter: string | (() => Element);
}

export class App {
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

    await this.injectHtml(container);
  }

  private async injectHtml(container) {
    const iframe = document.createElement('iframe');
    iframe.src = this.options.JSRuntimePath || '';
    iframe.hidden = true;
    // iframe.setAttribute('display', 'none');

    const appContainer = document.createElement('div');
    const doc = document.createElement('m-document');
    const appRoot = appContainer.attachShadow({ mode: 'closed' });
    defineProperty(appRoot, 'frameElement', { value: iframe });
    container.appendChild(appContainer);
    defineProperty(appRoot, 'document', { value: doc });

    await Promise.all([
      new Promise((resolve) => {
        addEventListenerTo(iframe, 'load', resolve, { once: true });
        DocumentFragment.prototype.append.call(appRoot, iframe, doc);
      }),
    ]);

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

    const newScripts: HTMLScriptElement[] = [];
    subAppDoc.querySelectorAll('script').forEach((script) => {
      const { type, attributes } = script;
      if (SCRIPT_TYPES.includes(type)) {
        const newEl = (
          appRoot as any
        ).frameElement.contentDocument.createElement('script');
        newEl.text = script.text;
        newEl.async = script.async; // fix: the default value of "async" is true
        for (let i = 0, { length } = attributes; i < length; ++i) {
          newEl.setAttribute(attributes[i].name, attributes[i].value);
        }
        script.type = 'm;' + script.type;
        newScripts.push(newEl);
      }
    });

    appendChildTo((appRoot as any).document, subAppDoc.documentElement);

    appendTo((appRoot as any).frameElement.contentDocument.body, ...newScripts);
  }
}

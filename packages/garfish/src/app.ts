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

declare interface MicroAppRoot extends ShadowRoot {
  frameElement?: HTMLIFrameElement;
  documentElement?: HTMLHtmlElement;
  head?: HTMLHeadElement;
  body?: HTMLBodyElement;
  // host: MicroAppElement;
  document?: HTMLElement;
}

declare interface MicroAppElement extends HTMLElement {
  _option: Options;
}

export class App {
  private iframeContext: HTMLIFrameElement;
  private options: Options;
  private htmlText: string;

  constructor(options: Options, htmlText: string) {
    this.options = options;
    this.htmlText = htmlText;
  }

  public async mount(options: MountOptions) {
    const container = await getRenderNode(options.domGetter);
    await this.initShadowDom(container);
  }

  private async initShadowDom(container: Element) {
    const iframeInstance = this.initJsRuntime();
    const appContainer = document.createElement('div');
    const shadowRoot: MicroAppRoot = appContainer.attachShadow({
      mode: 'closed',
    });
    const subAppDocument = document.createElement('micro-document');

    defineProperty(shadowRoot, 'frameElement', { value: iframeInstance });
    container.appendChild(appContainer);
    defineProperty(shadowRoot, 'document', { value: subAppDocument });

    await Promise.all([
      new Promise((resolve) => {
        addEventListenerTo(iframeInstance, 'load', resolve, { once: true });
        DocumentFragment.prototype.append.call(
          shadowRoot,
          iframeInstance,
          subAppDocument,
        );
      }),
    ]);
    this.injectBaseHtmlContainer(shadowRoot);
  }

  private injectBaseHtmlContainer(shadowRoot: MicroAppRoot) {
    // init sub app
    const domParser = new DOMParser();
    const subAppDoc = domParser.parseFromString(this.htmlText, 'text/html');
    defineProperties(shadowRoot, {
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

    //TODO: need keep script in order to inject
    const newScripts: HTMLScriptElement[] = [];
    subAppDoc.querySelectorAll('script').forEach((script) => {
      const { type, attributes } = script;
      if (SCRIPT_TYPES.includes(type)) {
        const newEl =
          shadowRoot.frameElement.contentDocument.createElement('script');
        newEl.text = script.text;
        newEl.async = script.async; // fix: the default value of "async" is true
        for (let i = 0, { length } = attributes; i < length; ++i) {
          newEl.setAttribute(attributes[i].name, attributes[i].value);
        }
        script.type = 'm;' + script.type;
        newScripts.push(newEl);
      }
    });

    // this.hijackNodeMethodsOfIframe(shadowRoot.frameElement.contentWindow);
    requestAnimationFrame(() => {
      appendChildTo(shadowRoot.document, subAppDoc.documentElement);
      appendTo(shadowRoot.frameElement.contentDocument.body, ...newScripts);
    });
  }

  private hijackNodeMethodsOfIframe() {}

  private initJsRuntime() {
    const iframe = document.createElement('iframe');
    iframe.src = this.options.JSRuntimePath || '';
    iframe.hidden = true;
    this.iframeContext = iframe;
    return iframe;
  }
}

import { hasOwn, Node, isAbsolute, transformUrl } from '@garfish/utils';

// Match url in css
const MATCH_CSS_URL = /url\(['"]?([^\)]+?)['"]?\)/g;

export class StyleManager {
  public url: string | null;

  private styleCode: string;
  private scopeString: string;
  private depsStack = new Set();

  constructor(styleCode: string, url?: string) {
    this.url = url || null;
    this.scopeString = '';
    this.styleCode = styleCode;
    this.correctPath();
    this.parseStyleCode();
  }

  private correctPath() {
    const { url, styleCode } = this;
    if (url && typeof styleCode === 'string') {
      // The relative path is converted to an absolute path according to the path of the css file
      this.styleCode = styleCode.replace(MATCH_CSS_URL, (k1, k2) => {
        if (isAbsolute(k2)) return k1;
        return `url("${transformUrl(url, k2)}")`;
      });
    }
  }

  setDep(node: Node) {
    this.depsStack.add(node);
  }

  parseStyleCode() {
    // Not parse by default
  }

  isSameOrigin(node: Node) {
    return this.depsStack.has(node);
  }

  // This method is used to rewrite the css scope plugin
  getStyleCode() {
    return this.styleCode;
  }

  renderAsStyleElement(extraCode = '') {
    const styleCode = this.getStyleCode();
    const node = document.createElement('style');
    node.setAttribute('type', 'text/css');
    node.textContent =
      extraCode + (styleCode ? styleCode : '/**empty style**/');
    return node;
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.styleCode = this.styleCode;
    cloned.scopeString = this.scopeString;
    cloned.depsStack = new Set(this.depsStack);
    return cloned;
  }
}

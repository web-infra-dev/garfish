import { Node } from './renderApi';
import { isAbsolute, transformUrl } from '../domApis';

// Match url in css
const MATCH_CSS_URL = /url\(['"]?([^\)]+?)['"]?\)/g;

export class StyleManager {
  public url: string | null;
  public styleCode: string;

  private depsStack = new Set();

  constructor(styleCode: string, url?: string) {
    this.url = url || null;
    this.styleCode = styleCode;
  }

  correctPath(baseUrl?: string) {
    const { url, styleCode } = this;
    if (!baseUrl) baseUrl = url;
    if (baseUrl && typeof styleCode === 'string') {
      // The relative path is converted to an absolute path according to the path of the css file
      this.styleCode = styleCode.replace(MATCH_CSS_URL, (k1, k2) => {
        if (isAbsolute(k2)) return k1;
        return `url("${transformUrl(url, k2)}")`;
      });
    }
  }

  setScope(_scope: string) {
    // Process css cope
  }

  setDep(node: Node) {
    this.depsStack.add(node);
  }

  isSameOrigin(node: Node) {
    return this.depsStack.has(node);
  }

  renderAsStyleElement(extraCode = '') {
    const node = document.createElement('style');
    node.setAttribute('type', 'text/css');
    // prettier-ignore
    node.textContent = extraCode + (
      this.styleCode
        ? this.styleCode
        : '/**empty style**/'
    );
    return node;
  }
}

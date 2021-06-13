import { isAbsolute, transformUrl } from '../domApis';

// Match url in css
const MATCH_CSS_URL = /url\(['"]?([^\)]+?)['"]?\)/g;

export class StyleManager {
  public url: string | null;
  public styleCode: string;
  public type = 'style';

  constructor(styleCode: string, url?: string) {
    this.url = url || null;
    this.styleCode = styleCode;
  }

  correctPath() {
    const { url, styleCode } = this;
    if (url && typeof styleCode === 'string') {
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

  renderAsStyleElement(parent?: Element) {
    const node = document.createElement('style');
    node.setAttribute('type', 'text/css');
    // prettier-ignore
    node.textContent = this.styleCode
      ? this.styleCode
      : '/**empty style**/';
    if (parent) {
      parent.appendChild(node);
    }
    return node;
  }
}

import { Node, isAbsolute, transformUrl } from '@garfish/utils';

// Match url in css
const MATCH_CSS_URL = /url\(\s*(['"])?(.*?)\1\s*\)/g;
const MATCH_CHARSET_URL = /@charset\s+(['"])(.*?)\1\s*;?/g;
const MATCH_IMPORT_URL = /@import\s+(['"])(.*?)\1/g;

export class StyleManager {
  public url?: string;
  public styleCode: string;

  private depsStack = new Set();

  constructor(styleCode: string, url?: string) {
    this.url = url;
    this.styleCode = styleCode;
  }

  correctPath(baseUrl?: string) {
    const { url, styleCode } = this;
    if (!baseUrl) baseUrl = url;
    if (baseUrl && typeof styleCode === 'string') {
      // The relative path is converted to an absolute path according to the path of the css file
      this.styleCode = styleCode
        .replace(MATCH_CHARSET_URL, '')
        .replace(MATCH_IMPORT_URL, function (k0, k1, k2) {
          return k2 ? `@import url(${k1}${k2}${k1})` : k0;
        })
        .replace(MATCH_CSS_URL, (k0, k1, k2) => {
          if (isAbsolute(k2)) return k0;
          return `url("${baseUrl ? transformUrl(baseUrl, k2) : k2}")`;
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

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.styleCode = this.styleCode;
    cloned.depsStack = new Set(this.depsStack);
    return cloned;
  }
}

import { Node, isAbsolute, transformUrl } from '@garfish/utils';

// Match url in css
const MATCH_CSS_URL = /url\(\s*(['"])?(.*?)\1\s*\)/g;
const MATCH_CHARSET_URL = /@charset\s+(['"])(.*?)\1\s*;?/g;
const MATCH_IMPORT_URL = /@import\s+(['"])(.*?)\1/g;

interface ScopeData {
  appName: string;
  rootElId: string;
}

export class StyleManager {
  public styleCode: string;
  public url: string | null;
  public scopeData: ScopeData | null;

  private depsStack = new Set();

  constructor(styleCode: string, url?: string) {
    this.scopeData = null;
    this.url = url || null;
    this.styleCode = styleCode;
  }

  correctPath(baseUrl?: string) {
    const { url, styleCode } = this;
    if (!baseUrl) baseUrl = url as any;
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

  // Provided to plugins to override this method
  transformCode(code: string) {
    return code;
  }

  setDep(node: Node) {
    this.depsStack.add(node);
  }

  setScope(data: ScopeData) {
    this.scopeData = data;
  }

  isSameOrigin(node: Node) {
    return this.depsStack.has(node);
  }

  renderAsStyleElement(extraCode = '') {
    const node = document.createElement('style');
    // prettier-ignore
    const code = extraCode + (
      this.styleCode
        ? this.styleCode
        : '/**empty style**/'
    );
    node.setAttribute('type', 'text/css');
    node.textContent = this.transformCode(code);
    return node;
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.styleCode = this.styleCode;
    cloned.scopeData = this.scopeData;
    cloned.depsStack = new Set(this.depsStack);
    return cloned;
  }
}

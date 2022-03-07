import { Node } from '@garfish/utils';

export class JavaScriptManager {
  public async: boolean;
  public mimeType: string;
  public scriptCode: string;
  public url: string | null;

  // Need to remove duplication, so use "set"
  private depsStack = new Set();

  constructor(scriptCode: string, url?: string) {
    this.mimeType = '';
    this.async = false;
    this.url = url || null;
    this.scriptCode = scriptCode;
  }

  isModule() {
    return this.mimeType === 'module';
  }

  isInlineScript() {
    return Boolean(!this.url);
  }

  setMimeType(mimeType: string) {
    this.mimeType = mimeType || '';
  }

  setAsyncAttribute(val: boolean) {
    this.async = Boolean(val);
  }

  setDep(node: Node) {
    this.depsStack.add(node);
  }

  isSameOrigin(node: Node) {
    return this.depsStack.has(node);
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.async = this.async;
    cloned.mimeType = this.mimeType;
    cloned.scriptCode = this.scriptCode;
    cloned.depsStack = new Set(this.depsStack);
    return cloned;
  }
}

let id = 0;

// Maybe we can convert "esModule" to "commonjs" in the future
export class JavaScriptManager {
  public id = id++;
  public url: string | null;
  public mimeType: string;
  public scriptCode: string;

  constructor(scriptCode: string, url?: string) {
    this.mimeType = '';
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
}

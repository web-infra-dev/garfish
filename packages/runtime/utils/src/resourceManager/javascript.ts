let id = 0;

// Maybe we can convert "esModule" to "commonjs" in the future
export class JavaScriptManager {
  public id = id++;
  public url: string | null;
  public mimeType: string;
  public scriptCode: string;

  constructor(scriptCode: string, mimeType?: string, url?: string) {
    this.url = url || null;
    this.scriptCode = scriptCode;
    this.mimeType = mimeType || '';
  }

  isModule() {
    return this.mimeType === 'module';
  }

  isInlineScript() {
    return Boolean(this.url);
  }
}

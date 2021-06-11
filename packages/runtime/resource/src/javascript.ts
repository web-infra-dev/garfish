let createId = 0;

export class JavaScriptResource {
  public code: string;
  public id = createId++;
  public url: string | null;

  constructor(code: string, url?: string) {
    this.code = code;
    this.url = url || null;
  }

  isInlineScript() {
    return !!this.url;
  }
}

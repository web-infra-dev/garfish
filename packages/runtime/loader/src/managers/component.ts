export class ComponentManager {
  public componentCode: string;
  public url: string | null;

  constructor(scriptCode: string, url?: string) {
    this.url = url || null;
    this.componentCode = scriptCode;
  }
}

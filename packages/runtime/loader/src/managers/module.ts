export class ModuleManager {
  public moduleCode: string;
  public url: string | null;

  constructor(moduleCode: string, url?: string) {
    this.url = url || null;
    this.moduleCode = moduleCode;
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.moduleCode = this.moduleCode;
    return cloned;
  }
}

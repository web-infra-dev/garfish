export class ModuleManager {
  public moduleCode: string;
  public url: string | null;
  public alias: string | null;

  constructor(moduleCode: string, url?: string) {
    this.alias = null;
    this.url = url || null;
    this.moduleCode = moduleCode;
  }

  setAlias(name: string) {
    if (name && typeof name === 'string') {
      this.alias = name;
    }
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.alias = this.alias;
    cloned.moduleCode = this.moduleCode;
    return cloned;
  }
}

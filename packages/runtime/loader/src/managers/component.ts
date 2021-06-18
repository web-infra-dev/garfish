export class ComponentManager {
  public componentCode: string;
  public url: string | null;

  constructor(componentCode: string, url?: string) {
    this.url = url || null;
    this.componentCode = componentCode;
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.componentCode = this.componentCode;
  }
}

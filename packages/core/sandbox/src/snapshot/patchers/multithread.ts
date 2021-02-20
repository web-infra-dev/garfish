import { Snapshot } from './interceptor';
export class MultithreadInterceptor {
  snapshotBefore: Snapshot;
  targetToProtect: HTMLElement;
  uuid: string;
  constructor() {
    this.uuid = '' + -new Date();
    this.targetToProtect.setAttribute('gar', this.uuid);
  }
  beforeAdd() {
    this.snapshotBefore = Snapshot.take(document.getElementsByTagName('style'));
  }
  afterAdd() {
    const now = Snapshot.take(document.getElementsByTagName('style'));
    const diff = this.snapshotBefore.diff(now);
    diff.created.arrDoms.forEach((styleElement: HTMLStyleElement) => {
      const styleSheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;
      if (!styleSheet.cssRules) {
        return;
      }
      for (
        let i = 0, rule: CSSStyleRule;
        (rule = styleSheet.cssRules[i] as CSSStyleRule);
        i++
      ) {
        rule.selectorText += `[gar=${this.uuid}] `;
      }
    });
  }
}

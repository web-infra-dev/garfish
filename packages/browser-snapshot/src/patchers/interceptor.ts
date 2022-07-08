export type SnapshotDiff = {
  created: Snapshot;
  removed: Snapshot;
};

export function isStyledComponentsLike(element: HTMLStyleElement) {
  // A styled-components liked element has no textContent but keep the rules in its sheet.cssRules.
  return (
    element instanceof HTMLStyleElement &&
    !element.textContent &&
    element.sheet?.cssRules.length
  );
}

export class Snapshot {
  constructor(public arrDoms: Array<HTMLElement>) {
    this.arrDoms = arrDoms;
  }

  static take(target: HTMLElement): Snapshot;
  static take<T extends Element = Element>(
    nodeList: HTMLCollectionOf<T>,
  ): Snapshot;
  static take(nodeList?: NodeList): Snapshot;
  static take(target: HTMLElement | HTMLCollection | NodeList = document.head) {
    let list: Array<HTMLElement>;
    if ((target as HTMLElement).childNodes) {
      list = Array.prototype.slice.call((target as HTMLElement).childNodes);
    } else {
      list = Array.prototype.slice.call(target);
    }
    return new Snapshot(list);
  }

  diff(s: Snapshot): SnapshotDiff {
    if (!s) {
      return {
        created: new Snapshot([]),
        removed: new Snapshot([]),
      };
    }

    return {
      created: new Snapshot(
        this.arrDoms.filter((d) => s.arrDoms.indexOf(d) === -1),
      ),
      removed: new Snapshot(
        s.arrDoms.filter((d) => this.arrDoms.indexOf(d) === -1),
      ),
    };
  }
}

export class Interceptor {
  dynamicStyleSheetElementSet: Set<HTMLStyleElement>;
  styledComponentCSSRulesMap: WeakMap<HTMLStyleElement, CSSRuleList>;
  constructor(public dom: HTMLElement = document.head) {
    this.dom = dom;
    this.dynamicStyleSheetElementSet = new Set<HTMLStyleElement>();
    this.styledComponentCSSRulesMap = new WeakMap<
      HTMLStyleElement,
      CSSRuleList
    >();
  }

  add(from: Snapshot): void;
  add(created: Snapshot, removed: Snapshot): void;
  add(createdOrSnapshot: Snapshot, removed?: Snapshot) {
    let created: Snapshot;
    if (!removed) {
      const diff = Snapshot.take(this.dom).diff(createdOrSnapshot);
      created = diff.created;
      removed = diff.removed;
    } else {
      created = createdOrSnapshot;
    }
    created.arrDoms.reduce((prev, val) => {
      prev.appendChild(val);
      if (val instanceof HTMLStyleElement) {
        const cssRules = this.styledComponentCSSRulesMap.get(val);
        if (cssRules && cssRules.length) {
          for (let i = 0; i < cssRules.length; i++) {
            const cssRule = cssRules[i];
            // re-insert rules for styled-components element
            val.sheet?.insertRule(cssRule.cssText, val.sheet?.cssRules.length);
          }
        }
      }
      return prev;
    }, this.dom);
    removed.arrDoms.reduce((prev, val) => {
      prev.removeChild(val);
      return prev;
    }, this.dom);
  }

  remove(to: Snapshot): void;
  remove(created: Snapshot, removed: Snapshot): void;
  remove(createdOrSnapshot: Snapshot, removed?: Snapshot) {
    let created: Snapshot;
    if (!removed) {
      const diff = Snapshot.take(this.dom).diff(createdOrSnapshot);
      created = diff.created;
      removed = diff.removed;
    } else {
      created = createdOrSnapshot;
    }
    created.arrDoms.reduce((prev, val) => {
      if (
        val instanceof HTMLStyleElement &&
        isStyledComponentsLike(val) &&
        val?.sheet?.cssRules
      ) {
        this.styledComponentCSSRulesMap.set(val, val.sheet.cssRules);
      }
      prev.removeChild(val);
      return prev;
    }, this.dom);
    removed.arrDoms.reduce((prev, val) => {
      prev.appendChild(val);
      return prev;
    }, this.dom);
  }
}

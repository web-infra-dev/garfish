export type SnapshotDiff = {
  created: Snapshot;
  removed: Snapshot;
};

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
  constructor(public dom: HTMLElement = document.head) {
    this.dom = dom;
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
      prev.removeChild(val);
      return prev;
    }, this.dom);
    removed.arrDoms.reduce((prev, val) => {
      prev.appendChild(val);
      return prev;
    }, this.dom);
  }
}

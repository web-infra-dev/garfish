interface LockItem {
  id: number;
  waiting: Promise<void>;
  resolve: (value?: any) => void;
}

export class Lock {
  private id = 0;
  private lockQueue: LockItem[] = [];

  genId() {
    return ++this.id;
  }

  getId() {
    return this.id;
  }

  async wait(id: number) {
    const { lockQueue } = this;
    const firstLock = lockQueue[0];
    const lastLock = firstLock ? lockQueue[lockQueue.length - 1] : undefined;

    // This lock is processing, just return immediately
    if (firstLock?.id === id) return;

    // This lock should wait for the other lock
    let lockItem = lockQueue.find(item => item.id === id);

    if (!lockItem) {
      let promiseResolve: LockItem['resolve'] = () => {};
      const waiting = new Promise<void>(resolve => {
        promiseResolve = resolve;
      });
      // create a new lock
      lockItem = { id, waiting, resolve: promiseResolve };
      lockQueue.push(lockItem);
    }
    if (lastLock) {
      // start waiting
      await lastLock.waiting;
    }
    // don't need to wait
  }

  release() {
    const { lockQueue } = this;
    const firstLock = lockQueue[0];
    if (!firstLock) return;
    // remove this lock
    lockQueue.shift();
    // resolve the promise of current lock
    firstLock.resolve();
  }

  clear() {
    this.lockQueue = [];
  }
}

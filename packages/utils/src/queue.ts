interface Defer {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

export class Queue {
  public init = true;
  private fx = [];
  private lock = false;
  private finishDefers = new Set<Defer>();

  private next() {
    if (!this.lock) {
      this.lock = true;
      if (this.fx.length === 0) {
        this.init = true;
        this.finishDefers.forEach((d) => d.resolve());
        this.finishDefers.clear();
      } else {
        const fn = this.fx.shift();
        if (fn) {
          fn(() => {
            this.lock = false;
            this.next();
          });
        }
      }
    }
  }

  add(fn: (next: () => void) => void) {
    this.fx.push(fn);
    if (this.init) {
      this.lock = false;
      this.init = false;
      this.next();
    }
  }

  awaitCompletion() {
    if (this.init) return Promise.resolve();
    const defer = {} as Defer;
    this.finishDefers.add(defer);
    return new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    });
  }
}

const rawInterval = window.setInterval;
const rawClearInterval = window.clearInterval;

export class PatchInterval {
  private intervals: Array<number> = [];
  constructor() {}

  public activate() {
    // @ts-ignore
    window.setInterval = (
      handler: Function,
      timeout?: number,
      ...args: any[]
    ) => {
      const intervalId = rawInterval(handler, timeout, ...args);
      this.intervals = [...this.intervals, intervalId];
      return intervalId;
    };

    // @ts-ignore
    window.clearInterval = (intervalId: number) => {
      this.intervals = this.intervals.filter((id) => id !== intervalId);
      return rawClearInterval(intervalId);
    };
  }

  public deactivate(_clearEffects?: boolean) {
    if (_clearEffects) {
      this.intervals.forEach((id) => window.clearInterval(id));
    }
    window.setInterval = rawInterval;
    window.clearInterval = rawClearInterval;
  }
}

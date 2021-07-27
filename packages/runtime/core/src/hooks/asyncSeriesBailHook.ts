export class AsyncSeriesBailHook {
  public hookList = [];
  public interceptList = [];

  intercept(intercept) {
    this.interceptList.push(intercept);
  }

  public tap(name, callback) {
    this.hookList.push({
      name,
      callback,
    });
  }

  public async call(...args) {
    let stop = false;
    for (let i = 0; i < this.hookList.length; i++) {
      stop = await this.hookList[i].callback(...args);
      if (stop === false) return false;
    }

    for (let i = 0; i < this.interceptList.length; i++) {
      stop = await this.interceptList[i].call(...args);
      if (stop === false) return false;
    }

    return true;
  }
}

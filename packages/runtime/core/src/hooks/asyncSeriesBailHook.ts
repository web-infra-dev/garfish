export class AsyncSeriesBailHook {
  hookList = [];
  interceptList = [];

  intercept(intercept) {
    this.interceptList.push(intercept);
  }

  add(name, callback) {
    this.hookList.push({
      name,
      callback,
    });
  }

  remove(name, callback) {
    const idx = this.hookList.findIndex((hook) => {
      if (name !== hook.name) return false;
      return callback ? callback === hook.callback : true;
    });
    if (idx > -1) {
      this.hookList.splice(idx, 1);
    }
  }

  async call(...args) {
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

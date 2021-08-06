export class SyncHook {
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

  call(...args) {
    this.hookList.forEach((hook) => {
      hook.callback.apply(null, args);
    });
    this.interceptList.forEach((intercept) => {
      intercept.call(...args);
    });
  }
}

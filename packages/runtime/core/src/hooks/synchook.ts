export class SyncHook {
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

  public call(...args) {
    this.hookList.forEach((hook) => {
      hook.callback.apply(null, args);
    });
    this.interceptList.forEach((intercept) => {
      intercept.call(...args);
    });
  }
}

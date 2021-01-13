import { hasOwn } from '@garfish/utils';
export class PatchGlobalVal {
  public snapshotOriginal: any = {};
  private snapshotMutated: any = {};
  private whiteList: Array<string> = [
    'location',
    'addEventListener',
    'removeEventListener',
    'webpackJsonp',
  ];
  // ,'addEventListener','removeEventListener','clearInterval','setInterval','webkitStorageInfo'
  constructor(
    public targetToProtect: any = typeof window !== 'undefined'
      ? window
      : globalThis,
    public protectVariable: Array<string> = [],
  ) {
    this.targetToProtect = targetToProtect;
    this.protectVariable = protectVariable;
    // this.whiteList = [...this.whiteList, ...GarConfig.protectVariable!];
    this.whiteList = [...this.whiteList, ...protectVariable];
  }

  protected safeIterator(fn: Function) {
    // 跳过不遍历的变量
    for (const i in this.targetToProtect) {
      if (this.whiteList.indexOf(i) !== -1) {
        continue;
      }
      if (hasOwn(this.targetToProtect, i)) {
        fn(i);
      }
    }
  }

  // 1.触发生命周期钩子，willActivate（将要激活）
  // 2.将当前组的其他沙盒disable，并触发switch生命周期
  // 3.将当前window对象属性进行缓存
  // 4.恢复沙盒运行期间产生的副作用
  public activate() {
    // 记录全局环境、恢复之前副作用变量
    this.safeIterator((i: string) => {
      this.snapshotOriginal[i] = this.targetToProtect[i] as any;
    });

    Object.keys(this.snapshotMutated).forEach((mutateKey) => {
      this.targetToProtect[mutateKey] = this.snapshotMutated[mutateKey] as any;
    });
  }

  // 1.恢复沙盒启动期间变量变更的变量，记录变更记录
  // 2.恢复沙盒启动期间删除的变量，记录变更记录
  public deactivate() {
    const deleteMap: any = {};
    const updateMap: any = {};
    const addMap: any = {};

    // 恢复沙盒运行前window属性环境，并将差异值进行缓存
    this.safeIterator((normalKey: string) => {
      if (
        this.snapshotOriginal[normalKey] !==
        (this.targetToProtect[normalKey] as any)
      ) {
        this.snapshotMutated[normalKey] = this.targetToProtect[normalKey]; // deleted key will be defined as undefined on
        this.targetToProtect[normalKey] = this.snapshotOriginal[normalKey]; // || this.targetToProtect[i]

        // 收集删除、修改的变量
        if (this.targetToProtect[normalKey] === undefined) {
          addMap[normalKey] = this.snapshotMutated[normalKey];
        } else {
          updateMap[normalKey] = this.snapshotMutated[normalKey];
        }
      }
      delete this.snapshotOriginal[normalKey];
    });

    Object.keys(this.snapshotOriginal).forEach((deleteKey) => {
      this.snapshotMutated[deleteKey] = this.targetToProtect[deleteKey];
      this.targetToProtect[deleteKey] = this.snapshotOriginal[deleteKey];
      deleteMap[deleteKey] = this.targetToProtect[deleteKey];
    });

    // 提供给开发者，让其了解清除了哪些副作用变量
    // channel.emit('sandbox-variable', {
    //   update: updateMap,
    //   removed: deleteMap,
    //   add: addMap,
    // });
  }
}

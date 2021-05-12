import { hasOwn } from '@garfish/utils';
export class PatchGlobalVal {
  public snapshotOriginal = new Map();
  private snapshotMutated: any = new Map();
  private whiteList: Array<PropertyKey> = [
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
    public protectVariable: Array<PropertyKey> = [],
  ) {
    this.targetToProtect = targetToProtect;
    this.protectVariable = protectVariable;
    // this.whiteList = [...this.whiteList, ...GarConfig.protectVariable!];
    this.whiteList = [...this.whiteList, ...protectVariable];
  }

  protected safeIterator(fn: Function) {
    // Skip the variables not traverse
    // Do not include a symbol
    for (const i in this.targetToProtect) {
      if (this.whiteList.indexOf(i) !== -1) {
        continue;
      }
      const prop = Object.getOwnPropertyDescriptor(this.targetToProtect, i);
      if (!prop || !prop.writable) {
        continue;
      }
      if (hasOwn(this.targetToProtect, i)) {
        fn(i);
      }
    }
  }

  // 1.Trigger hooks, life cycle willActivate enabled (going to)
  // 2.Will disable the current group of other box, and triggers the switch life cycle
  // 3.The current window object properties for caching
  // 4.Restore the sandbox side effects during operation
  public activate() {
    // Recorded before the global environment, restore side effects of a variable
    this.safeIterator((i: string) => {
      this.snapshotOriginal.set(i, this.targetToProtect[i]);
    });

    Object.keys(this.snapshotMutated).forEach((mutateKey) => {
      this.targetToProtect[mutateKey] = this.snapshotMutated[mutateKey] as any;
    });
  }

  // 1.Restore the sandbox during startup variables change, record the change record
  // 2.Restore the sandbox during startup to delete variables, record the change record
  public deactivate() {
    const deleteMap: any = {};
    const updateMap: any = {};
    const addMap: any = {};

    // Restore the sandbox before running Windows properties of environment, and difference value for caching
    this.safeIterator((normalKey: string) => {
      if (
        this.snapshotOriginal.get(normalKey) !==
        (this.targetToProtect[normalKey] as any)
      ) {
        this.snapshotMutated[normalKey] = this.targetToProtect[normalKey]; // deleted key will be defined as undefined on
        this.targetToProtect[normalKey] = this.snapshotOriginal.get(normalKey); // || this.targetToProtect[i]

        // Collection of delete, modify variables
        if (this.targetToProtect[normalKey] === undefined) {
          addMap[normalKey] = this.snapshotMutated[normalKey];
        } else {
          updateMap[normalKey] = this.snapshotMutated[normalKey];
        }
      }
      this.snapshotOriginal.delete(normalKey);
    });

    this.snapshotOriginal.forEach((deleteKey) => {
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

import { observable, computed, action, makeAutoObservable } from 'mobx';
class Store {
  @observable price = 2;
  @observable amount = 1;
  @observable activeApp = '';

  constructor() {
    makeAutoObservable(this);
  }

  @computed get total() {
    return this.price * this.amount;
  }

  @action.bound
  increment() {
    this.amount++;
  }

  @action.bound
  setActiveApp(name) {
    this.activeApp = name;
  }
}

export default Store;
export const store = new Store();

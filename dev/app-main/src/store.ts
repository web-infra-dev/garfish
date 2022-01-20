import { observable, computed, action, makeAutoObservable } from 'mobx';
class Store {
  @observable price = 2;
  @observable counter = 1;
  @observable activeApp = '';

  constructor() {
    makeAutoObservable(this);
  }

  @computed get total() {
    return this.price * this.counter;
  }

  @action.bound
  increment() {
    this.counter++;
  }

  @action.bound
  decrement() {
    this.counter--;
  }

  @action.bound
  setActiveApp(name) {
    this.activeApp = name;
  }
}

export default Store;
export const store = new Store();

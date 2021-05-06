import { observable, computed, action } from 'mobx';

class Store {
  @observable price = 2;
  @observable amount = 1;

  @computed get total() {
    return this.price * this.amount;
  }

  @action.bound
  increment() {
    this.amount++;
  }
}

export default Store;
export const store = new Store();

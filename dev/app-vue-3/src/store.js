import { observable, computed, action } from 'mobx';

export default class Store {
  @observable price = 2;
  @observable amount = 1;

  @computed get total() {
    return this.price * this.amount;
  }

  @action.bound
  increment() {
    this.amount += 1;
  }
}

export const store = new Store();

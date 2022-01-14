import { reactive, readonly, provide, inject } from 'vue';

export const stateSymbol = Symbol('state');
export const incrementSymbol = Symbol('increment');

export const createState = () => {
  const state = reactive({ counter: 0 });
  const increment = () => state.counter++;
  return { increment, state: readonly(state) };
};

export const useState = () => inject(stateSymbol);

export const provideState = () => provide(stateSymbol, createState());

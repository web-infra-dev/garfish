import { sayA } from './circularEsmA.js';

export const sayB = () => {
  sayA();
  console.log('say B');
};

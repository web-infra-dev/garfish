import { sayB } from './circularEsmB.js';
export * from './esmC.js';

export const sayA = () => console.log('say A');
export const execSayB = () => sayB();

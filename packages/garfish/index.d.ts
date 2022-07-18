/// <reference types="@garfish/browser-vm/dist" />
/// <reference types="@garfish/browser-snapshot/dist" />
/// <reference types="@garfish/router/dist" />
export * from './dist/index';
import defaultInstance from './dist/index';

export { default as Garfish } from '@garfish/core';
export default defaultInstance;

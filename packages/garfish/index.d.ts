/// <reference types="@garfish/browser-vm" />
/// <reference types="@garfish/browser-snapshot" />
/// <reference types="@garfish/router" />
export * from './dist/index';
import defaultInstance from './dist/index';

export { default as Garfish } from '@garfish/core';
export default defaultInstance;

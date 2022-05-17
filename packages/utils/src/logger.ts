import createDebug from 'debug';

const log = createDebug('garfish');

export const coreLog = log.extend('core');
export const routerLog = log.extend('router');

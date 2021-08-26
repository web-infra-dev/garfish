import { SyncHook } from './syncHook';
import { HooksSystem } from './hooksSystem';
import { AsyncSeriesBailHook } from './asyncSeriesBailHook';

export function createGlobalLifecycle(_hasIntercept: boolean) {
  return new HooksSystem('global', {
    beforeBootstrap: new SyncHook(),
    bootstrap: new SyncHook(),
    beforeRegisterApp: new SyncHook(),
    registerApp: new SyncHook(),
    beforeLoad: new AsyncSeriesBailHook(),
    afterLoad: new SyncHook(),
    errorLoadApp: new SyncHook(),
  });
}

export function createAppLifecycle(_hasIntercept: boolean) {
  return new HooksSystem('app', {
    beforeEval: new SyncHook(),
    afterEval: new SyncHook(),
    beforeMount: new SyncHook(),
    afterMount: new SyncHook(),
    beforeUnMount: new SyncHook(),
    afterUnMount: new SyncHook(),
    errorMountApp: new SyncHook(),
    errorUnmountApp: new SyncHook(),
    errorExecCode: new SyncHook(),
  });
}

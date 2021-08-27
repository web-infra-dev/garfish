import { HooksSystem } from './hooksSystem';
import { SyncHook, AsyncHook } from '@garfish/hooks';

export function globalLifecycle() {
  return new HooksSystem({
    beforeBootstrap: new SyncHook(),
    bootstrap: new SyncHook(),
    beforeRegisterApp: new SyncHook(),
    registerApp: new SyncHook(),
    beforeLoad: new AsyncHook(),
    afterLoad: new SyncHook(),
    errorLoadApp: new SyncHook(),
  });
}

export function appLifecycle() {
  return new HooksSystem({
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

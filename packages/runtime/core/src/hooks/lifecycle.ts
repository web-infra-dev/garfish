import { HooksSystem } from './hooksSystem';
import { SyncHook, AsyncHook } from '@garfish/hooks';

export function globalLifecycle() {
  const hooks = {
    beforeBootstrap: new SyncHook(),
    bootstrap: new SyncHook(),
    beforeRegisterApp: new SyncHook(),
    registerApp: new SyncHook(),
    beforeLoad: new AsyncHook(),
    afterLoad: new SyncHook(),
    errorLoadApp: new SyncHook(),
  };
  return new HooksSystem('global', hooks);
}

export function appLifecycle() {
  const hooks = {
    beforeEval: new SyncHook(),
    afterEval: new SyncHook(),
    beforeMount: new SyncHook(),
    afterMount: new SyncHook(),
    beforeUnMount: new SyncHook(),
    afterUnMount: new SyncHook(),
    errorMountApp: new SyncHook(),
    errorUnmountApp: new SyncHook(),
    errorExecCode: new SyncHook(),
  };
  return new HooksSystem('app', hooks);
}

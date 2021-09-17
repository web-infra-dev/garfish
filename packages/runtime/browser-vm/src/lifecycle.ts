import { SyncHook, PluginSystem } from '@garfish/hooks';
import { ExecScriptOptions } from './types';

export function sandboxLifecycle() {
  return new PluginSystem({
    beforeClearEffect: new SyncHook<[], void>(),
    afterClearEffect: new SyncHook<[], void>(),
    appendNode: new SyncHook<[Element, Element, Element, string], void>(),
    beforeInvoke: new SyncHook<
      [string, Record<string, any>, ExecScriptOptions],
      void
    >(),
    afterInvoke: new SyncHook<
      [string, Record<string, any>, ExecScriptOptions],
      void
    >(),
    invokeError: new SyncHook<
      [Error, string, Record<string, any>, ExecScriptOptions],
      void
    >(),
  });
}

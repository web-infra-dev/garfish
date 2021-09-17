import { SyncHook, PluginSystem } from '@garfish/hooks';
import { FakeWindow, ExecScriptOptions } from './types';

export function sandboxLifecycle() {
  return new PluginSystem({
    closed: new SyncHook<[], void>(),
    stared: new SyncHook<[FakeWindow], void>(),
    appendNode: new SyncHook<[Element, Element, Element, string], void>(),
    beforeClearEffect: new SyncHook<[], void>(),
    afterClearEffect: new SyncHook<[], void>(),
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

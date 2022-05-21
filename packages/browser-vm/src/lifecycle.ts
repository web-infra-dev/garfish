import { SyncHook, PluginSystem } from '@garfish/hooks';
import type { interfaces } from '@garfish/core';
import type { FakeWindow } from './types';

export function sandboxLifecycle() {
  return new PluginSystem({
    closed: new SyncHook<[], void>(),
    stared: new SyncHook<[FakeWindow | undefined], void>(),
    appendNode: new SyncHook<[Element, Element, Element, string], void>(),
    beforeClearEffect: new SyncHook<[], void>(),
    afterClearEffect: new SyncHook<[], void>(),
    beforeInvoke: new SyncHook<
      [
        { code: string },
        string | undefined,
        Record<string, any>,
        interfaces.ExecScriptOptions | undefined,
      ],
      void
    >(),
    afterInvoke: new SyncHook<
      [
        { code: string },
        string | undefined,
        Record<string, any>,
        interfaces.ExecScriptOptions | undefined,
      ],
      void
    >(),
    invokeError: new SyncHook<
      [
        Error,
        string | undefined,
        Record<string, any> | undefined,
        interfaces.ExecScriptOptions | undefined,
      ],
      void
    >(),
  });
}

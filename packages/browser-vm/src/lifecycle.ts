import { SyncHook, PluginSystem } from '@garfish/hooks';
import type { interfaces } from '@garfish/core';
import type { FakeWindow } from './types';

export function sandboxLifecycle() {
  return new PluginSystem({
    closed: new SyncHook<[], void>(),
    stared: new SyncHook<[FakeWindow?], void>(),
    appendNode: new SyncHook<[Element, Element, Element, string], void>(),
    beforeClearEffect: new SyncHook<[], void>(),
    afterClearEffect: new SyncHook<[], void>(),
    beforeInvoke: new SyncHook<
      [
        { code: string },
        string?,
        Record<string, any>?,
        interfaces.ExecScriptOptions?,
      ],
      void
    >(),
    afterInvoke: new SyncHook<
      [
        { code: string },
        string?,
        Record<string, any>?,
        interfaces.ExecScriptOptions?,
      ],
      void
    >(),
    invokeError: new SyncHook<
      [Error, string?, Record<string, any>?, interfaces.ExecScriptOptions?],
      void
    >(),
  });
}

import { SyncHook, SyncWaterfallHook, PluginSystem } from '@garfish/hooks';
import type { interfaces } from '@garfish/core';
import type { FakeWindow } from './types';

export interface DocumentGetterData {
  value: any;
  propName: PropertyKey;
  proxyDocument: Document;
  rootNode?: null | Element | ShadowRoot;
  customValue?: any;
}

export function sandboxLifecycle() {
  return new PluginSystem({
    closed: new SyncHook<[], void>(),
    stared: new SyncHook<[FakeWindow?], void>(),
    appendNode: new SyncHook<[Element, Element, Element, string], void>(),
    documentGetter: new SyncWaterfallHook<DocumentGetterData>('documentGetter'),
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
